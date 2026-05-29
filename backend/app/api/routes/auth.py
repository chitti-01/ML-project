from fastapi import APIRouter, HTTPException
from app.models.schemas import LoginRequest, UserResponse

router = APIRouter()

@router.post("/login", response_model=UserResponse)
async def login(req: LoginRequest):
    # Basic mock login
    if req.email and req.password:
        return UserResponse(
            id="usr_123",
            email=req.email,
            name="Admin User",
            role="admin"
        )
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/me", response_model=UserResponse)
async def get_me():
    return UserResponse(
        id="usr_123",
        email="admin@provision.ai",
        name="Admin User",
        role="admin"
    )
