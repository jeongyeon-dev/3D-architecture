from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.schema import (
    LoginRequest, 
    LoginResponse,
    SignupRequest, 
    SignupResponse
)
from app.auth.service import (
    login,
    signup
)
from app.database import get_db


router = APIRouter(tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login_user(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    access_token = login(
        db,
        request.username,
        request.password,
    )

    if access_token is None:
        return LoginResponse(
            success=False
        )

    return LoginResponse(
        success=True,
        access_token=access_token,
        token_type="bearer"
    )


@router.post("/signup", response_model=SignupResponse)
def signup_user(
    request: SignupRequest,
    db: Session = Depends(get_db),
):
    try:
        return signup(
            db,
            request.username,
            request.nickname,
            request.password,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )