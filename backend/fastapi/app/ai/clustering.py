from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import DBSCAN
import numpy as np
from datetime import datetime


def cluster_complaints(records: List[Dict[str, Any]], eps: float = 0.35, min_samples: int = 2) -> List[Dict[str, Any]]:
    """
    Simple clustering using TF-IDF vectors + DBSCAN with cosine metric.
    Returns a list of clusters with metadata and members.
    """
    if not records:
        return []

    texts = [r.get("description", "") for r in records]
    ids = [r.get("id") for r in records]
    dates = [r.get("submitted_at") for r in records]

    vect = TfidfVectorizer(stop_words="english", max_features=4096)
    X = vect.fit_transform(texts)
    # DBSCAN with cosine distance
    clustering = DBSCAN(eps=eps, min_samples=min_samples, metric="cosine").fit(X)
    labels = clustering.labels_

    clusters: Dict[int, Dict[str, Any]] = {}
    for idx, label in enumerate(labels):
        if label == -1:
            continue
        clusters.setdefault(label, {"members": []})["members"].append(idx)

    output = []
    for label, info in clusters.items():
        member_idxs = info["members"]
        member_ids = [ids[i] for i in member_idxs]
        member_texts = [texts[i] for i in member_idxs]
        member_dates = [dates[i] for i in member_idxs]

        first_reported = min(member_dates) if any(member_dates) else None
        latest_reported = max(member_dates) if any(member_dates) else None

        cluster_name = member_texts[0][:80]
        output.append({
            "cluster_name": cluster_name,
            "complaint_ids": member_ids,
            "affected_citizens": len(member_ids),
            "first_reported_at": first_reported,
            "latest_reported_at": latest_reported,
            "district_impact": "unknown",
            "confidence_score": 80,
        })

    return output
