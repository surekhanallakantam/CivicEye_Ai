from pydantic import BaseModel
from typing import Optional


class ComplaintAnalyzeRequest(BaseModel):
    description: str
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    pincode: Optional[str]
    image_url: Optional[str]


class AIAnalysisResponse(BaseModel):
    category: str
    department: str
    severity: str
    confidence: int
    ai_summary: Optional[str]


class GenerateRequest(BaseModel):
    description: str
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    pincode: Optional[str]
    image_url: Optional[str]


class GeneratedComplaintResponse(BaseModel):
    generated_complaint: str
    normalized_text: Optional[str]
