from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    success: bool
    access_token: str | None = None
    token_type: str | None = None


class SignupRequest(BaseModel):
    username: str
    nickname: str
    password: str


class SignupResponse(BaseModel):
    id: int
    username: str
    nickname: str