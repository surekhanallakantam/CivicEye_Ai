from typing import Optional, Dict, Any
from app.core.config import settings

try:
    from supabase import create_client
except Exception:
    create_client = None


def get_supabase_client():
    if create_client is None:
        raise RuntimeError("supabase client library is not installed")
    key = settings.supabase_service_role_key or settings.supabase_anon_key
    return create_client(settings.supabase_url, key)


def insert_complaint(payload: Dict[str, Any]) -> Dict[str, Any]:
    sb = get_supabase_client()
    res = sb.table("complaints").insert(payload).execute()
    return res.data[0] if res and hasattr(res, "data") and res.data else {}


def update_complaint(complaint_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    sb = get_supabase_client()
    res = sb.table("complaints").update(payload).eq("id", complaint_id).execute()
    return res.data[0] if res and hasattr(res, "data") and res.data else {}


def insert_ai_analysis(payload: Dict[str, Any]) -> Dict[str, Any]:
    sb = get_supabase_client()
    res = sb.table("complaint_ai_analysis").insert(payload).execute()
    return res.data[0] if res and hasattr(res, "data") and res.data else {}


def get_complaint_by_code(code: str) -> Optional[Dict[str, Any]]:
    sb = get_supabase_client()
    res = sb.table("complaints").select("*").eq("complaint_code", code).limit(1).execute()
    return res.data[0] if res and hasattr(res, "data") and res.data else None


def get_complaint_by_id(complaint_id: str) -> Optional[Dict[str, Any]]:
    sb = get_supabase_client()
    res = sb.table("complaints").select("*").eq("id", complaint_id).limit(1).execute()
    return res.data[0] if res and hasattr(res, "data") and res.data else None


def insert_status_history(payload: Dict[str, Any]) -> Dict[str, Any]:
    sb = get_supabase_client()
    res = sb.table("complaint_status_history").insert(payload).execute()
    return res.data[0] if res and hasattr(res, "data") and res.data else {}


def get_status_history(complaint_id: str) -> list:
    sb = get_supabase_client()
    res = sb.table("complaint_status_history").select("*").eq("complaint_id", complaint_id).order("changed_at", desc=False).execute()
    return res.data if res and hasattr(res, "data") and res.data else []


def fetch_complaints_for_clustering(limit: int = 1000) -> list:
    sb = get_supabase_client()
    res = sb.table("complaints").select("id,description,submitted_at,city,state,complaint_code").limit(limit).execute()
    return res.data if res and hasattr(res, "data") and res.data else []


def insert_cluster(payload: Dict[str, Any]) -> Dict[str, Any]:
    sb = get_supabase_client()
    res = sb.table("clusters").insert(payload).execute()
    return res.data[0] if res and hasattr(res, "data") and res.data else {}


def insert_cluster_complaint(payload: Dict[str, Any]) -> Dict[str, Any]:
    sb = get_supabase_client()
    res = sb.table("cluster_complaints").insert(payload).execute()
    return res.data[0] if res and hasattr(res, "data") and res.data else {}


def get_clusters() -> list:
    sb = get_supabase_client()
    res = sb.table("clusters").select("*").execute()
    return res.data if res and hasattr(res, "data") and res.data else []


def fetch_all_complaints() -> list:
    sb = get_supabase_client()
    res = sb.table("complaints").select("*").execute()
    return res.data if res and hasattr(res, "data") and res.data else []


def fetch_all_complaint_analysis() -> list:
    sb = get_supabase_client()
    res = sb.table("complaint_ai_analysis").select("*").execute()
    return res.data if res and hasattr(res, "data") and res.data else []


def get_latest_ai_analysis(complaint_id: str) -> Optional[Dict[str, Any]]:
    sb = get_supabase_client()
    res = (
        sb.table("complaint_ai_analysis")
        .select("*")
        .eq("complaint_id", complaint_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    return res.data[0] if res and hasattr(res, "data") and res.data else None


def insert_citizen(payload: Dict[str, Any]) -> Dict[str, Any]:
    sb = get_supabase_client()
    res = sb.table("citizens").insert(payload).execute()
    return res.data[0] if res and hasattr(res, "data") and res.data else {}


def get_citizen_by_email(email: str) -> Optional[Dict[str, Any]]:
    sb = get_supabase_client()
    res = sb.table("citizens").select("*").eq("email", email).limit(1).execute()
    return res.data[0] if res and hasattr(res, "data") and res.data else None


def get_citizen_by_id(citizen_id: str) -> Optional[Dict[str, Any]]:
    sb = get_supabase_client()
    res = sb.table("citizens").select("*").eq("id", citizen_id).limit(1).execute()
    return res.data[0] if res and hasattr(res, "data") and res.data else None


def fetch_complaints_by_citizen(citizen_id: str) -> list:
    sb = get_supabase_client()
    res = sb.table("complaints").select("*").eq("citizen_id", citizen_id).order("submitted_at", desc=True).execute()
    return res.data if res and hasattr(res, "data") and res.data else []

