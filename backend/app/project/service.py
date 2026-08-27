from typing import Any
from sqlalchemy.orm import Session

from app.auth.jwt import get_user_id
from app.project.repository import ( 
    find_projects_by_user, 
    create_project_one, 
    update_project_objects, 
    get_project_by_id,
)



def get_projects(
    db: Session,
    token: str,
):
    user_id = get_user_id(token)

    if user_id is None:
        return None

    return find_projects_by_user(db, user_id)


def create_project(
        db: Session, 
        token: str, 
        title: str
):
    user_id = get_user_id(token)

    project = create_project_one(
        db,
        user_id,
        title,
    )

    db.commit()
    db.refresh(project)

    return project


def save_project(
    db: Session,
    project_id: int,
    objects: list[dict[str, Any]],
):
    project_object = update_project_objects(
        db,
        project_id,
        objects,
    )

    if project_object is None:
        raise Exception("프로젝트를 찾을 수 없습니다.")

    db.commit()

    return project_object


def get_project(
    db: Session,
    project_id: int,     
):
    return get_project_by_id(db, project_id)  