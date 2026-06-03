from fastapi import APIRouter, HTTPException
from app.schemas.complaint import ComplaintCreate, ComplaintResponse
from app.core import supabase_client as sbclient
from app.ai import service as ai_service
from datetime import datetime
import time

router = APIRouter()


def generate_complaint_code() -> str:
    ts = int(time.time())
    return f"CIV-{ts}"


@router.post("/", response_model=ComplaintResponse)
def create_complaint(payload: ComplaintCreate):
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
        "image_url": data.get("image_url"),
        "status": "submitted",
        "submitted_at": datetime.utcnow().isoformat(),
    }

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
        # update complaint with generated text and confidence
        sbclient.update_complaint(complaint_id, {
            "generated_complaint": gen_result.get("generated_complaint"),
            "ai_confidence": ai_result.get("confidence"),
            "updated_at": datetime.utcnow().isoformat(),
        })
    except Exception:
        # non-fatal; AI persistence failure shouldn't block complaint creation
        pass

    # Return created complaint record (shallow)
    return ComplaintResponse(
        id=complaint_id,
        complaint_code=complaint_code,
        name=data["name"],
        phone=data.get("phone"),
        description=data["description"],
        state=data["state"],
        city=data["city"],
        address=data["address"],
        pincode=data["pincode"],
        image_url=data.get("image_url"),
        status="submitted",
        ai_confidence=ai_result.get("confidence"),
        generated_complaint=gen_result.get("generated_complaint"),
        submitted_at=created.get("submitted_at"),
    )


@router.get("/{complaint_code}", response_model=ComplaintResponse)
def get_complaint(complaint_code: str):
    rec = sbclient.get_complaint_by_code(complaint_code)
    if not rec:
        raise HTTPException(status_code=404, detail="Complaint not found")
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
        ai_confidence=rec.get("ai_confidence"),
        generated_complaint=rec.get("generated_complaint"),
        submitted_at=rec.get("submitted_at"),
    )
