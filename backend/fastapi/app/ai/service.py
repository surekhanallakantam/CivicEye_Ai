from typing import Dict
from app.core.config import settings
import httpx


def analyze_with_gemini(payload: Dict) -> Dict:
    # Placeholder: replace with real Gemini API call.
    return {
        "category": "Road Safety",
        "department": "Roads Department",
        "severity": "high",
        "confidence": 94,
        "ai_summary": "An open manhole near a school; urgent attention required.",
    }


def analyze_with_huggingface(payload: Dict) -> Dict:
    # Placeholder: replace with real HF inference call.
    return {
        "category": "Road Safety",
        "department": "Roads Department",
        "severity": "high",
        "confidence": 90,
        "ai_summary": "Image and text indicate an open manhole near a school.",
    }


def analyze_with_groq(payload: Dict) -> Dict:
    # Call GROQ endpoint provided in settings.groq_endpoint
    endpoint = settings.groq_endpoint
    api_key = settings.groq_api_key
    if not endpoint or not api_key:
        return {
            "category": "Unknown",
            "department": "Unknown",
            "severity": "low",
            "confidence": 0,
            "ai_summary": "GROQ not configured",
        }

    prompt = (
        f"Analyze the following civic complaint and return a JSON with category, department, severity (critical|high|medium|low), confidence (0-100), and a short ai_summary.\nComplaint: {payload.get('description')}\nLocation: {payload.get('address')} {payload.get('city')} {payload.get('state')} {payload.get('pincode')}"
    )

    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    body = {"prompt": prompt, "max_tokens": 300}

    try:
        resp = httpx.post(endpoint, json=body, headers=headers, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()
        # Expecting model to return parsed JSON in `result` or raw text — try to be flexible.
        # If data contains 'result' use it, else try to parse text content.
        if isinstance(data, dict) and "result" in data:
            result = data["result"]
        else:
            # fallback: try to parse top-level fields
            result = data

        return {
            "category": result.get("category", "Unknown"),
            "department": result.get("department", "Unknown"),
            "severity": result.get("severity", "low"),
            "confidence": int(result.get("confidence", 0)),
            "ai_summary": result.get("ai_summary") or result.get("summary") or str(data),
        }
    except Exception:
        return {
            "category": "Unknown",
            "department": "Unknown",
            "severity": "low",
            "confidence": 0,
            "ai_summary": "GROQ call failed",
        }


def generate_with_gemini(payload: Dict) -> Dict:
    return {
        "generated_complaint": "An open manhole has been observed near ABC School, creating a safety hazard.",
        "normalized_text": payload.get("description", "")
    }


def generate_with_huggingface(payload: Dict) -> Dict:
    return {
        "generated_complaint": "Open manhole near ABC School — immediate inspection requested.",
        "normalized_text": payload.get("description", "")
    }


def generate_with_groq(payload: Dict) -> Dict:
    endpoint = settings.groq_endpoint
    api_key = settings.groq_api_key
    if not endpoint or not api_key:
        return {"generated_complaint": payload.get("description", ""), "normalized_text": payload.get("description", "")}

    prompt = (
        f"Rewrite the following civic complaint into a formal, actionable complaint text suitable for government officials.\nComplaint: {payload.get('description')}\nLocation: {payload.get('address')} {payload.get('city')} {payload.get('state')} {payload.get('pincode')}"
    )

    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    body = {"prompt": prompt, "max_tokens": 300}

    try:
        resp = httpx.post(endpoint, json=body, headers=headers, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()
        if isinstance(data, dict) and "result" in data:
            text = data["result"].get("text") or data["result"]
        else:
            text = data.get("text") if isinstance(data, dict) else str(data)
        return {"generated_complaint": text, "normalized_text": payload.get("description", "")}
    except Exception:
        return {"generated_complaint": payload.get("description", ""), "normalized_text": payload.get("description", "")}


def analyze(payload: Dict) -> Dict:
    provider = settings.ai_provider.lower()
    if provider == "huggingface":
        return analyze_with_huggingface(payload)
    if provider == "groq":
        return analyze_with_groq(payload)
    return analyze_with_gemini(payload)


def generate(payload: Dict) -> Dict:
    provider = settings.ai_provider.lower()
    if provider == "huggingface":
        return generate_with_huggingface(payload)
    if provider == "groq":
        return generate_with_groq(payload)
    return generate_with_gemini(payload)
