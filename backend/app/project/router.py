from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.project.schema import ProjectCreateRequest, ProjectSaveRequest
from app.project.service import get_projects, create_project, save_project, get_project

router = APIRouter(
    tags=["projects"]
)


@router.get("")
def get_project_list(
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    token = authorization.replace("Bearer ", "")

    projects = get_projects(db, token)

    if projects is None:
        raise HTTPException(401, "Invalid token")

    return projects


@router.post("/create")
def create_project_one(
    request: ProjectCreateRequest,
    authorization: str = Header(...),
    db:Session = Depends(get_db),
):
    token = authorization.replace("Bearer ", "")

    return create_project(db, token, request.title)


@router.put("/save/{id}")
def save_project_one(
    id: int,
    request: ProjectSaveRequest,
    authorization: str = Header(...),
    db:Session = Depends(get_db),
):
    token = authorization.replace("Bearer ", "")

    if token is None:
        raise Exception("권한이 없는 사용자입니다")

    return save_project(
        db=db,
        project_id=id,
        objects=request.objects,
    )


@router.get("/{id}")
def get_project_one(
    id: int,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    token = authorization.replace("Bearer ", "")

    if token is None:
        raise Exception("권한이 없는 사용자입니다")

    return get_project(db, id)