from fastapi import APIRouter
from app.auth.schema import LoginRequest, LoginResponse
from app.auth.service import login

router = APIRouter(tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login_user(request: LoginRequest):
    return login(request)