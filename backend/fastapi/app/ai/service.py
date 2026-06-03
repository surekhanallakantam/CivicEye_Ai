import json
import re
from typing import Dict
from app.core.config import settings
import httpx


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
    department = "Roads Department"
    severity = "medium"
    ai_summary = "Civic complaint registered by citizen."

    if "pothole" in desc_lower or "road" in desc_lower:
        category = "Pothole"
        department = "Roads Department"
        severity = "high"
        ai_summary = "Pothole or road safety issue reported."
    elif "garbage" in desc_lower or "waste" in desc_lower or "dump" in desc_lower:
        category = "Garbage Accumulation"
        department = "Sanitation Department"
        severity = "medium"
        ai_summary = "Garbage accumulation or sanitation hazard reported."
    elif "drain" in desc_lower or "sewage" in desc_lower or "overflow" in desc_lower:
        category = "Drainage Leakage"
        department = "Drainage Department"
        severity = "high"
        ai_summary = "Drainage leakage or sewer overflow reported."
    elif "water" in desc_lower or "leak" in desc_lower:
        category = "Water Leakage"
        department = "Water Department"
        severity = "medium"
        ai_summary = "Water leakage or public water pipeline issue reported."
    elif "light" in desc_lower or "street" in desc_lower or "bulb" in desc_lower:
        category = "Broken Streetlight"
        department = "Electrical Department"
        severity = "low"
        ai_summary = "Broken streetlight or electrical outage reported."
    elif "pension" in desc_lower or "scheme" in desc_lower:
        category = "Pension Delay"
        department = "Pension Department"
        severity = "medium"
        ai_summary = "Delay in pension payouts or distribution reported."
    elif "farm" in desc_lower or "fertilizer" in desc_lower:
        category = "Farmer Subsidy Issues"
        department = "Agriculture Department"
        severity = "medium"
        ai_summary = "Agriculture subsidy or farming support issue reported."
    elif "scholarship" in desc_lower or "college" in desc_lower or "school" in desc_lower:
        category = "Scholarship Delay"
        department = "Education Department"
        severity = "medium"
        ai_summary = "Delay in education scholarship disbursement reported."
    elif "claim" in desc_lower or "insurance" in desc_lower:
        category = "Insurance Claims"
        department = "Insurance Department"
        severity = "medium"
        ai_summary = "Insurance claim processing delay reported."

    return {
        "category": category,
        "department": department,
        "severity": severity,
        "confidence": 85,
        "ai_summary": ai_summary,
    }


def analyze_with_groq(payload: Dict) -> Dict:
    endpoint = settings.groq_endpoint or "https://api.groq.com/openai/v1/chat/completions"
    api_key = settings.groq_api_key
    if not api_key:
        # Fallback to smart heuristic if API key is not yet configured
        return fallback_analyze(payload.get("description", ""))

    description = payload.get("description", "")
    address = payload.get("address", "")
    city = payload.get("city", "")
    state = payload.get("state", "")
    pincode = payload.get("pincode", "")

    system_prompt = (
        "You are the AI routing core of CivicEye AI. Analyze the citizen's civic complaint.\n"
        "You MUST return a JSON object with the following fields:\n"
        "- \"category\": Choose exactly one from: ['Road Safety', 'Pothole', 'Garbage Accumulation', 'Drainage Leakage', 'Broken Streetlight', 'Water Leakage', 'Pension Delay', 'Farmer Subsidy Issues', 'Scholarship Delay', 'Insurance Claims', 'Revenue Delay']\n"
        "- \"department\": Choose exactly one corresponding department from: ['Roads Department', 'Drainage Department', 'Sanitation Department', 'Water Department', 'Electrical Department', 'Pension Department', 'Agriculture Department', 'Revenue Department', 'Education Department', 'Insurance Department']\n"
        "- \"severity\": Choose exactly one from: ['critical', 'high', 'medium', 'low']\n"
        "- \"confidence\": An integer percentage score between 0 and 100 indicating classification confidence.\n"
        "- \"ai_summary\": A brief one-sentence summarization of the complaint.\n\n"
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

        return {
            "category": result.get("category", "Road Safety"),
            "department": result.get("department", "Roads Department"),
            "severity": result.get("severity", "medium").lower(),
            "confidence": int(result.get("confidence", 80)),
            "ai_summary": result.get("ai_summary", "Civic issue reported."),
        }
    except Exception as e:
        print(f"Groq API analyze failed: {e}")
        return fallback_analyze(description)


def generate_with_groq(payload: Dict) -> Dict:
    endpoint = settings.groq_endpoint or "https://api.groq.com/openai/v1/chat/completions"
    api_key = settings.groq_api_key
    description = payload.get("description", "")
    
    if not api_key:
        return {
            "generated_complaint": f"A formal request has been recorded for the following issue: {description}. Please address this at your earliest convenience.",
            "normalized_text": description
        }

    address = payload.get("address", "")
    city = payload.get("city", "")
    state = payload.get("state", "")
    pincode = payload.get("pincode", "")

    system_prompt = (
        "You are an expert civic administrator. Your task is to rewrite the raw citizen complaint into a formal, "
        "professional, polite, and actionable complaint description suitable for government officials. "
        "Preserve landmarks and locations. Do not invent new facts. Return a JSON object with the following fields:\n"
        "- \"generated_complaint\": The formal rewritten text.\n"
        "- \"normalized_text\": The raw text cleaned of typos.\n\n"
        "Return ONLY valid JSON. No markdown syntax, no explanations."
    )

    user_prompt = (
        f"Complaint: {description}\n"
        f"Location: {address}, {city}, {state} - {pincode}"
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
        "temperature": 0.2
    }

    try:
        resp = httpx.post(endpoint, json=body, headers=headers, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()
        raw_content = data["choices"][0]["message"]["content"]
        result = extract_json(raw_content)

        return {
            "generated_complaint": result.get("generated_complaint", f"A formal grievance has been raised regarding: {description}"),
            "normalized_text": result.get("normalized_text", description)
        }
    except Exception as e:
        print(f"Groq API generate failed: {e}")
        return {
            "generated_complaint": f"A formal request has been recorded for the following issue: {description}. Please inspect and rectify.",
            "normalized_text": description
        }


def analyze(payload: Dict) -> Dict:
    provider = settings.ai_provider.lower()
    if provider == "groq":
        return analyze_with_groq(payload)
    # Default to Groq since it's the requested client LLM
    return analyze_with_groq(payload)


def generate(payload: Dict) -> Dict:
    provider = settings.ai_provider.lower()
    if provider == "groq":
        return generate_with_groq(payload)
    return generate_with_groq(payload)
