from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.project.service import get_projects

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