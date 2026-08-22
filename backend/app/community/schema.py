from datetime import datetime

from pydantic import BaseModel


class BuildingCard(BaseModel):
    image_url: str
    id: int
    user_id: int
    title: str
    view_count: int
    like_count: int
    updated_at: datetime