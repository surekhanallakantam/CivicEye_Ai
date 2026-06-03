from fastapi import APIRouter
from app.core import supabase_client as sbclient
from collections import Counter, defaultdict
from datetime import datetime

router = APIRouter()


def _safe_list(value):
    return value if isinstance(value, list) else []


def _complaints():
    return sbclient.fetch_all_complaints()


def _clusters():
    return sbclient.get_clusters()


@router.get("/dashboard/executive")
def executive_dashboard():
    complaints = _complaints()
    clusters = _clusters()

    total_complaints = len(complaints)
    resolved_cases = sum(1 for c in complaints if str(c.get("status", "")).lower() == "resolved")
    pending_cases = sum(1 for c in complaints if str(c.get("status", "")).lower() not in {"resolved", "feedback_received"})
    critical_issues = sum(1 for c in complaints if str(c.get("severity", "")).lower() == "critical")
    total_departments = len({c.get("department_id") for c in complaints if c.get("department_id")})
    active_clusters = sum(1 for c in clusters if str(c.get("status", "open")).lower() == "open")
    complaint_reduction_pct = round((len(clusters) / total_complaints) * 100, 2) if total_complaints else 0.0

    return {
        "total_complaints": total_complaints,
        "total_departments": total_departments,
        "total_clusters": len(clusters),
        "active_clusters": active_clusters,
        "critical_issues": critical_issues,
        "resolved_cases": resolved_cases,
        "pending_cases": pending_cases,
        "complaint_reduction_pct": complaint_reduction_pct,
    }


@router.get("/dashboard/insight-card")
def executive_insight_card():
    complaints = _complaints()
    clusters = _clusters()

    city_counts = Counter((c.get("city") or "Unknown") for c in complaints)
    department_counts = Counter((c.get("department_id") or "Unassigned") for c in complaints)
    total = len(complaints) or 1
    resolved = sum(1 for c in complaints if str(c.get("status", "")).lower() == "resolved")

    top_city, top_city_count = city_counts.most_common(1)[0] if city_counts else ("Unknown", 0)
    top_department, top_department_count = department_counts.most_common(1)[0] if department_counts else ("Unassigned", 0)

    return {
        "title": "AI Summary",
        "items": [
            f"Total complaints: {len(complaints)}",
            f"Highest concentration area: {top_city} ({top_city_count})",
            f"Most loaded department: {top_department} ({top_department_count})",
            f"Resolved rate: {round((resolved / total) * 100, 2)}%",
            f"Active clusters: {len(clusters)}",
        ],
    }


@router.get("/dashboard/transparency")
def transparency_metrics():
    complaints = _complaints()
    status_counts = Counter((c.get("status") or "unknown") for c in complaints)
    timeline_available = sum(1 for c in complaints if c.get("submitted_at"))

    return {
        "current_status_distribution": dict(status_counts),
        "resolution_timeline_coverage": timeline_available,
        "total_complaints": len(complaints),
    }


@router.get("/dashboard/accountability")
def accountability_metrics():
    complaints = _complaints()
    departments = defaultdict(lambda: {"total": 0, "resolved": 0, "pending": 0})
    for complaint in complaints:
        dept = complaint.get("department_id") or "Unassigned"
        departments[dept]["total"] += 1
        if str(complaint.get("status", "")).lower() == "resolved":
            departments[dept]["resolved"] += 1
        else:
            departments[dept]["pending"] += 1

    department_rankings = []
    for dept, values in departments.items():
        resolution_rate = round((values["resolved"] / values["total"]) * 100, 2) if values["total"] else 0.0
        department_rankings.append({
            "department": dept,
            "total": values["total"],
            "resolved": values["resolved"],
            "pending": values["pending"],
            "resolution_rate": resolution_rate,
        })

    department_rankings.sort(key=lambda item: item["resolution_rate"], reverse=True)
    return {
        "department_rankings": department_rankings,
        "total_departments": len(departments),
    }


@router.get("/analytics/heatmap")
def heatmap_data():
    clusters = _clusters()
    points = []
    for cluster in clusters:
        if not cluster.get("is_geographic", True):
            continue
        points.append({
            "cluster_id": cluster.get("id"),
            "cluster_name": cluster.get("cluster_name"),
            "latitude": cluster.get("latitude"),
            "longitude": cluster.get("longitude"),
            "weight": cluster.get("affected_citizens", 1),
            "district_impact": cluster.get("district_impact"),
        })
    return {"points": points}


@router.get("/analytics/hotspots")
def hotspots():
    clusters = _clusters()
    hotspot_counts = Counter((cluster.get("city") or "Unknown") for cluster in clusters if cluster.get("is_geographic", True))
    return {
        "hotspots": [
            {"location": location, "count": count}
            for location, count in hotspot_counts.most_common()
        ]
    }


@router.get("/analytics/cluster-density")
def cluster_density():
    clusters = _clusters()
    density = Counter((cluster.get("city") or "Unknown") for cluster in clusters)
    return {"density": dict(density)}


@router.get("/analytics/trends")
def trends():
    complaints = _complaints()
    category_counts = Counter((c.get("category_id") or "Uncategorized") for c in complaints)
    severity_counts = Counter((c.get("severity") or "unknown") for c in complaints)
    return {
        "category_trends": dict(category_counts),
        "severity_trends": dict(severity_counts),
    }


@router.get("/analytics/district-performance")
def district_performance():
    complaints = _complaints()
    district_counts = Counter((c.get("city") or "Unknown") for c in complaints)
    resolved_by_district = Counter((c.get("city") or "Unknown") for c in complaints if str(c.get("status", "")).lower() == "resolved")

    performance = []
    for district, total in district_counts.items():
        resolved = resolved_by_district.get(district, 0)
        performance.append({
            "district": district,
            "total_complaints": total,
            "resolved": resolved,
            "resolution_rate": round((resolved / total) * 100, 2) if total else 0.0,
        })
    performance.sort(key=lambda item: item["resolution_rate"], reverse=True)
    return {"districts": performance}
