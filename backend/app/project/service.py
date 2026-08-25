from sqlalchemy.orm import Session

from app.auth.jwt import get_user_id
from app.project.repository import find_projects_by_user


def get_projects(
    db: Session,
    token: str,
):
    user_id = get_user_id(token)

    if user_id is None:
        return None

    return find_projects_by_user(db, user_id)