from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.model import User


def find_user(db: Session, username: str):
    return db.scalar(
        select(User).where(User.username == username)
    )


def find_user_by_username(
    db: Session,
    username: str,
):
    return db.scalar(
        select(User).where(User.username == username)
    )


def find_user_by_nickname(
    db: Session,
    nickname: str,
):
    return db.scalar(
        select(User).where(User.nickname == nickname)
    )


def create_user(
    db: Session,
    username: str,
    nickname: str,
    password: str,
):
    user = User(
        username=username,
        nickname=nickname,
        password=password,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user