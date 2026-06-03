from pydantic import BaseModel
from typing import Optional

class CitizenRegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None

class CitizenLoginRequest(BaseModel):
    email: str
    password: str

class CitizenResponse(BaseModel):
    id: str
    name: str
    email: str
    phone_number: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    citizen: CitizenResponse
