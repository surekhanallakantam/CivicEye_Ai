from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ComplaintCreate(BaseModel):
    name: str
    phone: Optional[str]
    description: str
    state: str
    city: str
    address: str
    pincode: str
    image_url: Optional[str] = None


class ComplaintResponse(BaseModel):
    id: str
    complaint_code: str
    name: str
    phone: Optional[str]
    description: str
    state: str
    city: str
    address: str
    pincode: str
    image_url: Optional[str] = None
    status: str
    category: Optional[str] = None
    department: Optional[str] = None
    severity: Optional[str] = None
    ai_confidence: Optional[int]
    ai_summary: Optional[str] = None
    generated_complaint: Optional[str]
    submitted_at: Optional[datetime]
