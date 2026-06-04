from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.schemas.auth import CitizenRegisterRequest, CitizenLoginRequest, TokenResponse, CitizenResponse
from app.core import supabase_client as sbclient
from app.core.security import hash_password, verify_password, create_access_token, verify_access_token

router = APIRouter()
security = HTTPBearer()

def get_current_citizen(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    payload = verify_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token or expired token")
    if payload["sub"] == "admin_surekha":
        return {
            "id": "admin_surekha",
            "name": "Surekha Nallakantham",
            "email": "surekhanallakantham@gmail.com",
            "phone_number": None,
            "role": "admin"
        }
    citizen = sbclient.get_citizen_by_id(payload["sub"])
    if not citizen:
        raise HTTPException(status_code=401, detail="Citizen not found")
    return citizen

@router.post("/register", response_model=TokenResponse)
def register(payload: CitizenRegisterRequest):
    # Check if already exists
    existing = sbclient.get_citizen_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")
    
    hashed = hash_password(payload.password)
    citizen_payload = {
        "email": payload.email,
        "password_hash": hashed,
        "name": payload.name,
        "phone_number": payload.phone,
        "role": "citizen",
    }
    
    try:
        new_citizen = sbclient.insert_citizen(citizen_payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database insertion failed: {e}")
        
    token = create_access_token({"sub": new_citizen["id"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "citizen": {
            "id": new_citizen["id"],
            "name": new_citizen["name"],
            "email": new_citizen["email"],
            "phone_number": new_citizen.get("phone_number"),
            "role": new_citizen.get("role", "citizen"),
        }
    }

@router.post("/login", response_model=TokenResponse)
def login(payload: CitizenLoginRequest):
    # Intercept override for admin credentials
    if payload.email == "surekhanallakantham@gmail.com" and payload.password == "surekha@123":
        citizen = sbclient.get_citizen_by_email(payload.email)
        if not citizen:
            try:
                hashed = hash_password(payload.password)
                citizen = sbclient.insert_citizen({
                    "email": payload.email,
                    "password_hash": hashed,
                    "name": "Surekha Nallakantham",
                    "role": "admin"
                })
            except Exception:
                # Fallback if db column doesn't exist yet
                token = create_access_token({"sub": "admin_surekha"})
                return {
                    "access_token": token,
                    "token_type": "bearer",
                    "citizen": {
                        "id": "admin_surekha",
                        "name": "Surekha Nallakantham",
                        "email": payload.email,
                        "phone_number": None,
                        "role": "admin"
                    }
                }
        else:
            if citizen.get("role") != "admin":
                try:
                    sb = sbclient.get_supabase_client()
                    sb.table("citizens").update({"role": "admin"}).eq("id", citizen["id"]).execute()
                    citizen["role"] = "admin"
                except Exception:
                    pass

        token = create_access_token({"sub": citizen["id"]})
        return {
            "access_token": token,
            "token_type": "bearer",
            "citizen": {
                "id": citizen["id"],
                "name": citizen["name"],
                "email": citizen["email"],
                "phone_number": citizen.get("phone_number"),
                "role": "admin"
            }
        }

    citizen = sbclient.get_citizen_by_email(payload.email)
    if not citizen:
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    if not verify_password(payload.password, citizen["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    token = create_access_token({"sub": citizen["id"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "citizen": {
            "id": citizen["id"],
            "name": citizen["name"],
            "email": citizen["email"],
            "phone_number": citizen.get("phone_number"),
            "role": citizen.get("role", "citizen"),
        }
    }

@router.get("/me", response_model=CitizenResponse)
def get_me(citizen: dict = Depends(get_current_citizen)):
    return {
        "id": citizen["id"],
        "name": citizen["name"],
        "email": citizen["email"],
        "phone_number": citizen.get("phone_number"),
        "role": citizen.get("role", "citizen"),
    }
