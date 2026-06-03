from fastapi import APIRouter, HTTPException
from app.core import supabase_client as sbclient
from app.ai.clustering import cluster_complaints
from datetime import datetime
import time

router = APIRouter()


def generate_cluster_code() -> str:
    return f"CL-{int(time.time())}"


@router.post("/run")
def run_clustering(limit: int = 1000):
    records = sbclient.fetch_complaints_for_clustering(limit=limit)
    if not records:
        return {"clusters_created": 0}

    clusters = cluster_complaints(records)
    created = 0
    for c in clusters:
        cluster_code = generate_cluster_code()
        cluster_payload = {
            "cluster_code": cluster_code,
            "cluster_name": c.get("cluster_name"),
            "is_geographic": True,
            "affected_citizens": c.get("affected_citizens"),
            "first_reported_at": c.get("first_reported_at"),
            "latest_reported_at": c.get("latest_reported_at"),
            "district_impact": c.get("district_impact"),
            "confidence_score": c.get("confidence_score"),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        new_cluster = sbclient.insert_cluster(cluster_payload)
        cluster_id = new_cluster.get("id")
        for cid in c.get("complaint_ids", []):
            try:
                sbclient.insert_cluster_complaint({"cluster_id": cluster_id, "complaint_id": cid, "similarity_score": None})
            except Exception:
                pass
        created += 1

    return {"clusters_created": created}


@router.get("/")
def list_clusters():
    try:
        clusters = sbclient.get_clusters()
        return clusters
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
