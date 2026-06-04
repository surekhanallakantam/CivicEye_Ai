from fastapi import APIRouter, HTTPException, Depends, Request
from app.schemas.complaint import ComplaintCreate, ComplaintResponse
from app.core import supabase_client as sbclient
from app.ai import service as ai_service
from app.core.websocket import manager
from app.api.v1.routes.auth import get_current_citizen
from app.core.security import verify_access_token
from datetime import datetime
from typing import Optional
import time

router = APIRouter()


def generate_complaint_code() -> str:
    ts = int(time.time())
    return f"CIV-{ts}"


def get_optional_citizen(request: Request) -> Optional[dict]:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    payload = verify_access_token(token)
    if payload and "sub" in payload:
        try:
            return sbclient.get_citizen_by_id(payload["sub"])
        except Exception:
            return None
    return None


@router.post("/", response_model=ComplaintResponse)
async def create_complaint(payload: ComplaintCreate, request: Request):
    data = payload.dict()
    complaint_code = generate_complaint_code()
    insert_payload = {
        "complaint_code": complaint_code,
        "citizen_name": data["name"],
        "phone_number": data.get("phone"),
        "description": data["description"],
        "state": data["state"],
        "city": data["city"],
        "address": data["address"],
        "pincode": data["pincode"],
        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),
        "image_url": data.get("image_url"),
        "status": "submitted",
        "submitted_at": datetime.utcnow().isoformat(),
    }

    # If logged-in citizen, link the citizen_id and pre-fill details
    citizen = get_optional_citizen(request)
    if citizen:
        insert_payload["citizen_id"] = citizen["id"]
        insert_payload["citizen_name"] = citizen["name"]
        insert_payload["phone_number"] = citizen.get("phone_number") or insert_payload["phone_number"]

    try:
        created = sbclient.insert_complaint(insert_payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB insert failed: {e}")

    complaint_id = created.get("id")

    # Call AI analysis and generation
    ai_input = {
        "description": data["description"],
        "address": data.get("address"),
        "city": data.get("city"),
        "state": data.get("state"),
        "pincode": data.get("pincode"),
        "image_url": data.get("image_url"),
    }

    ai_result = ai_service.analyze(ai_input)
    gen_result = ai_service.generate(ai_input)

    # Persist AI analysis linked to complaint
    ai_payload = {
        "complaint_id": complaint_id,
        "raw_input": ai_input,
        "ai_summary": ai_result.get("ai_summary"),
        "category": ai_result.get("category"),
        "department_name": ai_result.get("department"),
        "severity": ai_result.get("severity"),
        "root_cause": None,
        "sentiment": None,
        "confidence_score": ai_result.get("confidence"),
        "model_version": None,
    }

    try:
        sbclient.insert_ai_analysis(ai_payload)
        
        # Resolve category_id and department_id by querying Supabase
        update_data = {
            "generated_complaint": gen_result.get("generated_complaint"),
            "ai_confidence": ai_result.get("confidence"),
            "severity": ai_result.get("severity"),
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        # Try finding department id matching department name
        dept_name = ai_result.get("department")
        if dept_name:
            sb = sbclient.get_supabase_client()
            dept_res = sb.table("departments").select("id").eq("name", dept_name).execute()
            if dept_res.data:
                update_data["department_id"] = dept_res.data[0]["id"]
                
        # Try finding category id matching category name
        cat_name = ai_result.get("category")
        if cat_name:
            sb = sbclient.get_supabase_client()
            cat_res = sb.table("categories").select("id").eq("name", cat_name).execute()
            if cat_res.data:
                update_data["category_id"] = cat_res.data[0]["id"]
        
        # update complaint with generated text, confidence, category and department
        sbclient.update_complaint(complaint_id, update_data)

        sbclient.insert_status_history({
            "complaint_id": complaint_id,
            "old_status": None,
            "new_status": "submitted",
            "changed_by": "system",
            "note": "Citizen complaint created",
            "changed_at": datetime.utcnow().isoformat(),
        })
        # Broadcast real-time creation event
        await manager.broadcast({
            "event": "complaint_created",
            "complaint_id": complaint_id
        })
    except Exception:
        # non-fatal; AI persistence failure shouldn't block complaint creation
        pass

    # Return created complaint record (shallow)
    return ComplaintResponse(
        id=complaint_id,
        complaint_code=complaint_code,
        name=insert_payload["citizen_name"],
        phone=insert_payload["phone_number"],
        description=data["description"],
        state=data["state"],
        city=data["city"],
        address=data["address"],
        pincode=data["pincode"],
        image_url=data.get("image_url"),
        status="submitted",
        category=ai_result.get("category"),
        department=ai_result.get("department"),
        severity=ai_result.get("severity"),
        ai_confidence=ai_result.get("confidence"),
        ai_summary=ai_result.get("ai_summary"),
        generated_complaint=gen_result.get("generated_complaint"),
        submitted_at=created.get("submitted_at"),
    )


@router.get("/my")
def get_my_complaints(citizen: dict = Depends(get_current_citizen)):
    try:
        complaints = sbclient.fetch_complaints_by_citizen(citizen["id"])
        res_list = []
        for c in complaints:
            ai = sbclient.get_latest_ai_analysis(c["id"]) or {}
            
            category_name = ai.get("category")
            if not category_name and c.get("category_id"):
                category_name = sbclient.get_category_name_by_id(c["category_id"])
                
            department_name = ai.get("department_name")
            if not department_name and c.get("department_id"):
                department_name = sbclient.get_department_name_by_id(c["department_id"])

            res_list.append({
                "id": c.get("id"),
                "complaint_code": c.get("complaint_code"),
                "name": c.get("citizen_name"),
                "phone": c.get("phone_number"),
                "description": c.get("description"),
                "state": c.get("state"),
                "city": c.get("city"),
                "address": c.get("address"),
                "pincode": c.get("pincode"),
                "image_url": c.get("image_url"),
                "status": c.get("status"),
                "category": category_name,
                "department": department_name,
                "severity": ai.get("severity") or c.get("severity"),
                "ai_confidence": c.get("ai_confidence"),
                "ai_summary": ai.get("ai_summary"),
                "generated_complaint": c.get("generated_complaint"),
                "submitted_at": c.get("submitted_at"),
            })
        return res_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch complaints: {e}")


@router.get("/{complaint_code}", response_model=ComplaintResponse)
def get_complaint(complaint_code: str):
    rec = sbclient.get_complaint_by_code(complaint_code)
    if not rec:
        raise HTTPException(status_code=404, detail="Complaint not found")

    ai = sbclient.get_latest_ai_analysis(rec.get("id")) or {}
    
    category_name = ai.get("category")
    if not category_name and rec.get("category_id"):
        category_name = sbclient.get_category_name_by_id(rec["category_id"])
        
    department_name = ai.get("department_name")
    if not department_name and rec.get("department_id"):
        department_name = sbclient.get_department_name_by_id(rec["department_id"])

    return ComplaintResponse(
        id=rec.get("id"),
        complaint_code=rec.get("complaint_code"),
        name=rec.get("citizen_name"),
        phone=rec.get("phone_number"),
        description=rec.get("description"),
        state=rec.get("state"),
        city=rec.get("city"),
        address=rec.get("address"),
        pincode=rec.get("pincode"),
        image_url=rec.get("image_url"),
        status=rec.get("status"),
        category=category_name,
        department=department_name,
        severity=ai.get("severity") or rec.get("severity"),
        ai_confidence=rec.get("ai_confidence"),
        ai_summary=ai.get("ai_summary"),
        generated_complaint=rec.get("generated_complaint"),
        submitted_at=rec.get("submitted_at"),
    )


@router.get("/{complaint_code}/timeline")
def get_timeline(complaint_code: str):
    rec = sbclient.get_complaint_by_code(complaint_code)
    if not rec:
        raise HTTPException(status_code=404, detail="Complaint not found")

    history = sbclient.get_status_history(rec.get("id"))
    if not history:
        history = [{
            "complaint_id": rec.get("id"),
            "old_status": None,
            "new_status": rec.get("status", "submitted"),
            "changed_by": "system",
            "note": "Complaint created",
            "changed_at": rec.get("submitted_at"),
        }]

    return {
        "complaint_code": complaint_code,
        "complaint_id": rec.get("id"),
        "current_status": rec.get("status"),
        "timeline": history,
    }
