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
    image_url: Optional[str]


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
    image_url: Optional[str]
    status: str
    ai_confidence: Optional[int]
    generated_complaint: Optional[str]
    submitted_at: Optional[datetime]
