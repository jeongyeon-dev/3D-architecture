from sqlalchemy import select
from sqlalchemy.orm import Session

from typing import Any
from datetime import datetime

from app.project.model import Project, ProjectObject


def find_projects_by_user(
    db: Session,
    user_id: int,
):
    return db.scalars(
        select(Project)
        .where(Project.user_id == user_id)
        .order_by(Project.updated_at.desc())
    ).all()


def create_project_one(
    db: Session,
    user_id: int,
    title: str,
):
    project = Project(
        user_id=user_id,
        title=title,
        updated_at=datetime.now(),
    )

    db.add(project)
    db.flush()

    project_object = ProjectObject(
        project_id=project.id,
        objects={},
        updated_at=datetime.now(),
    )

    db.add(project_object)

    return project


def update_project_objects(
    db: Session,
    project_id: int,
    objects: list[dict[str, Any]],
):
    project_object = (
        db.query(ProjectObject)
        .filter(ProjectObject.project_id == project_id)
        .first()
    )

    if project_object is None:
        return None

    project_object.objects = objects

    db.flush();

    return project_object


def get_project_by_id(
    db: Session,
    project_id: int,        
):
    return (
        db.query(ProjectObject)
        .filter(ProjectObject.project_id == project_id)
        .first()
    )