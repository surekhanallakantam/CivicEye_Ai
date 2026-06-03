from fastapi import APIRouter
from app.schemas.ai import (
    ComplaintAnalyzeRequest,
    AIAnalysisResponse,
    GenerateRequest,
    GeneratedComplaintResponse,
)
from app.ai import service as ai_service

router = APIRouter()


@router.post("/analyze", response_model=AIAnalysisResponse)
def analyze_complaint(payload: ComplaintAnalyzeRequest):
    result = ai_service.analyze(payload.dict())
    return AIAnalysisResponse(**result)


@router.post("/generate", response_model=GeneratedComplaintResponse)
def generate_complaint(payload: GenerateRequest):
    result = ai_service.generate(payload.dict())
    return GeneratedComplaintResponse(**result)
