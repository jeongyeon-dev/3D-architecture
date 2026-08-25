from sqlalchemy.orm import Session
from app.auth.jwt import create_access_token
from app.auth.repository import (
    find_user,
    create_user,
    find_user_by_nickname,
    find_user_by_username,
)


def login(
    db: Session,
    username: str,
    password: str,
):
    user = find_user(db, username)

    if user is None:
        return None

    if user.password != password:
        return None

    access_token = create_access_token(user.id)

    return access_token


def signup(
    db: Session,
    username: str,
    nickname: str,
    password: str,
):
    if find_user_by_username(db, username):
        raise ValueError("이미 존재하는 아이디입니다.")

    if find_user_by_nickname(db, nickname):
        raise ValueError("이미 존재하는 닉네임입니다.")

    return create_user(
        db,
        username,
        nickname,
        password,
    )