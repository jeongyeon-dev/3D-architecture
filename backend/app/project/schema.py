from typing import Any
from pydantic import BaseModel


class ProjectCreateRequest(BaseModel):
    title: str

class ProjectSaveRequest(BaseModel):
    objects: list[dict[str, Any]]
