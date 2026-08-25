from sqlalchemy import select
from sqlalchemy.orm import Session

from app.project.model import Project


def find_projects_by_user(
    db: Session,
    user_id: int,
):
    return db.scalars(
        select(Project)
        .where(Project.user_id == user_id)
        .order_by(Project.updated_at.desc())
    ).all()