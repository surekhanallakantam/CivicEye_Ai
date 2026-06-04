import json
import re
from typing import Dict
from app.core.config import settings
import httpx

ALLOWED_CATEGORIES = [
    'Road Safety', 'Pothole', 'Garbage Accumulation', 'Drainage Leakage', 
    'Broken Streetlight', 'Water Leakage', 'Pension Delay', 
    'Farmer Subsidy Issues', 'Scholarship Delay', 'Insurance Claims', 'Revenue Delay'
]

ALLOWED_DEPARTMENTS = [
    'Roads Department', 'Drainage Department', 'Sanitation Department', 
    'Water Department', 'Electrical Department', 'Pension Department', 
    'Agriculture Department', 'Revenue Department', 'Education Department', 'Insurance Department'
]

CATEGORY_TO_DEPT = {
    'Road Safety': 'Roads Department',
    'Pothole': 'Roads Department',
    'Garbage Accumulation': 'Sanitation Department',
    'Drainage Leakage': 'Drainage Department',
    'Broken Streetlight': 'Electrical Department',
    'Water Leakage': 'Water Department',
    'Pension Delay': 'Pension Department',
    'Farmer Subsidy Issues': 'Agriculture Department',
    'Scholarship Delay': 'Education Department',
    'Insurance Claims': 'Insurance Department',
    'Revenue Delay': 'Revenue Department'
}

# Request cache to store full analysis results during a single request lifecycle
_request_cache: Dict[str, Dict] = {}


def extract_json(text: str) -> Dict:
    try:
        return json.loads(text.strip())
    except Exception:
        pass

    # Regex search for first '{' and last '}'
    match = re.search(r'(\{.*\})', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass
    raise ValueError("No valid JSON found in response")


def fallback_analyze(description: str) -> Dict:
    desc_lower = description.lower()
    category = "Road Safety"
    severity = "medium"
    ai_summary = "Civic complaint registered by citizen."

    if "pothole" in desc_lower or "road" in desc_lower:
        category = "Pothole"
        severity = "high"
        ai_summary = "Pothole or road safety issue reported."
    elif "garbage" in desc_lower or "waste" in desc_lower or "dump" in desc_lower:
        category = "Garbage Accumulation"
        severity = "medium"
        ai_summary = "Garbage accumulation or sanitation hazard reported."
    elif "drain" in desc_lower or "sewage" in desc_lower or "overflow" in desc_lower:
        category = "Drainage Leakage"
        severity = "high"
        ai_summary = "Drainage leakage or sewer overflow reported."
    elif "water" in desc_lower or "leak" in desc_lower:
        category = "Water Leakage"
        severity = "medium"
        ai_summary = "Water leakage or public water pipeline issue reported."
    elif "light" in desc_lower or "street" in desc_lower or "bulb" in desc_lower:
        category = "Broken Streetlight"
        severity = "low"
        ai_summary = "Broken streetlight or electrical outage reported."
    elif "pension" in desc_lower or "scheme" in desc_lower:
        category = "Pension Delay"
        severity = "medium"
        ai_summary = "Delay in pension payouts or distribution reported."
    elif "farm" in desc_lower or "fertilizer" in desc_lower:
        category = "Farmer Subsidy Issues"
        severity = "medium"
        ai_summary = "Agriculture subsidy or farming support issue reported."
    elif "scholarship" in desc_lower or "college" in desc_lower or "school" in desc_lower:
        category = "Scholarship Delay"
        severity = "medium"
        ai_summary = "Delay in education scholarship disbursement reported."
    elif "claim" in desc_lower or "insurance" in desc_lower:
        category = "Insurance Claims"
        severity = "medium"
        ai_summary = "Insurance claim processing delay reported."
    elif "revenue" in desc_lower or "delay" in desc_lower:
        category = "Revenue Delay"
        severity = "medium"
        ai_summary = "Revenue department delay reported."

    department = CATEGORY_TO_DEPT.get(category, "Roads Department")

    return {
        "category": category,
        "department": department,
        "severity": severity,
        "confidence": 85,
        "ai_summary": ai_summary,
    }


def normalize_result(result: Dict, raw_description: str) -> Dict:
    category = result.get("category", "")
    department = result.get("department", "")
    severity = str(result.get("severity", "")).lower()
    confidence = result.get("confidence")
    ai_summary = result.get("ai_summary", "")
    generated_complaint = result.get("generated_complaint", "")
    normalized_text = result.get("normalized_text", raw_description)

    # 1. Normalize Category (case-insensitive fuzzy matching)
    matched_category = None
    for allowed in ALLOWED_CATEGORIES:
        if allowed.lower() == str(category).lower().strip():
            matched_category = allowed
            break

    if not matched_category:
        for allowed in ALLOWED_CATEGORIES:
            if allowed.lower() in str(category).lower() or str(category).lower() in allowed.lower():
                matched_category = allowed
                break

    if not matched_category:
        fallback = fallback_analyze(raw_description)
        matched_category = fallback["category"]

    # 2. Strict Department Mapping to resolve any AI mismatch or DB constraint errors
    matched_dept = CATEGORY_TO_DEPT.get(matched_category, "Roads Department")

    # 3. Normalize Severity
    if severity not in ['critical', 'high', 'medium', 'low']:
        if 'crit' in severity:
            severity = 'critical'
        elif 'high' in severity:
            severity = 'high'
        elif 'med' in severity:
            severity = 'medium'
        elif 'low' in severity:
            severity = 'low'
        else:
            severity = 'medium'

    # 4. Normalize Confidence
    try:
        confidence = int(confidence)
        if not (0 <= confidence <= 100):
            confidence = 85
    except Exception:
        confidence = 85

    # 5. Normalize texts
    if not ai_summary:
        ai_summary = f"Civic complaint registered under {matched_category}."
    else:
        ai_summary = ai_summary.strip().strip('"').strip("'")

    if not generated_complaint:
        generated_complaint = f"A formal grievance has been registered regarding: {raw_description}"
    else:
        # Strip outer quotes and redundant formatting prefixes
        generated_complaint = generated_complaint.strip().strip('"').strip("'")
        
    if not normalized_text:
        normalized_text = raw_description

    return {
        "category": matched_category,
        "department": matched_dept,
        "severity": severity,
        "confidence": confidence,
        "ai_summary": ai_summary,
        "generated_complaint": generated_complaint,
        "normalized_text": normalized_text
    }


def process_complaint_with_groq(payload: Dict) -> Dict:
    endpoint = settings.groq_endpoint or "https://api.groq.com/openai/v1/chat/completions"
    api_key = settings.groq_api_key
    description = payload.get("description", "")
    address = payload.get("address", "")
    city = payload.get("city", "")
    state = payload.get("state", "")
    pincode = payload.get("pincode", "")

    if not api_key:
        # Fallback to local analysis if key is not set
        print("Groq API key is not configured. Falling back to local smart heuristics.")
        analysis = fallback_analyze(description)
        analysis["generated_complaint"] = f"A formal request has been recorded for the following issue: {description}. Please address this at your earliest convenience."
        analysis["normalized_text"] = description
        return analysis

    system_prompt = (
        "You are the AI processing core of CivicEye AI. Analyze the citizen's civic complaint.\n"
        "You MUST return a JSON object with the following fields:\n"
        "- \"category\": Choose exactly one from: ['Road Safety', 'Pothole', 'Garbage Accumulation', 'Drainage Leakage', 'Broken Streetlight', 'Water Leakage', 'Pension Delay', 'Farmer Subsidy Issues', 'Scholarship Delay', 'Insurance Claims', 'Revenue Delay']\n"
        "- \"department\": Choose exactly one corresponding department from: ['Roads Department', 'Drainage Department', 'Sanitation Department', 'Water Department', 'Electrical Department', 'Pension Department', 'Agriculture Department', 'Revenue Department', 'Education Department', 'Insurance Department']\n"
        "- \"severity\": Choose exactly one from: ['critical', 'high', 'medium', 'low']. Do NOT set all standard complaints as high/critical. Follow these guidelines strictly:\n"
        "  - 'critical': ONLY for immediate threats to life, safety, or health (e.g. open manholes on active roads, exposed high-voltage cables near water, building collapses).\n"
        "  - 'high': Severe disruptions to public utilities or major transit roads (e.g. large potholes on highways, main sewer lines completely blocked causing street flooding, broken streetlights at major traffic junctions).\n"
        "  - 'medium': Default standard civic issues (e.g. normal potholes on residential streets, general trash heap accumulation, small water leaks, scholarship delays, pension distribution delays).\n"
        "  - 'low': Minor convenience issues (e.g. broken streetlight on a side alley, minor trash pile, general query).\n"
        "- \"confidence\": An integer percentage score between 0 and 100.\n"
        "- \"ai_summary\": A brief one-sentence summarization of the complaint.\n"
        "- \"generated_complaint\": Rewrite the raw citizen complaint into a formal, professional, and polite official letter format addressed to the Department Commissioner. The letter must include a Subject line (referencing the issue category and location), a Salutation (e.g., 'Respected Sir/Madam'), a body paragraph detailing the reported issue, its impact/danger, a request for immediate inspection and action, and a formal closing (e.g., 'Yours faithfully, Citizen'). Do not invent new factual details (like specific names or dates) not present in the input.\n"
        "- \"normalized_text\": The raw text cleaned of typos.\n\n"
        "Return ONLY valid JSON. No markdown syntax, no explanations."
    )

    user_prompt = (
        f"Complaint text: {description}\n"
        f"Location reported: {address}, {city}, {state} - {pincode}"
    )

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    body = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.1
    }

    try:
        resp = httpx.post(endpoint, json=body, headers=headers, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()
        raw_content = data["choices"][0]["message"]["content"]
        result = extract_json(raw_content)
        return result
    except Exception as e:
        print(f"Groq API combined call failed: {e}")
        analysis = fallback_analyze(description)
        analysis["generated_complaint"] = f"A formal request has been recorded for the following issue: {description}. Please address this at your earliest convenience."
        analysis["normalized_text"] = description
        return analysis


def get_full_analysis(payload: Dict) -> Dict:
    description = payload.get("description", "")
    if not description:
        return {}

    # Check request cache to avoid duplicate Groq calls for same complaint description
    if description in _request_cache:
        return _request_cache[description]

    raw_result = process_complaint_with_groq(payload)
    normalized = normalize_result(raw_result, description)
    
    # Store in request cache
    _request_cache[description] = normalized
    return normalized


def analyze(payload: Dict) -> Dict:
    return get_full_analysis(payload)


def generate(payload: Dict) -> Dict:
    return get_full_analysis(payload)
