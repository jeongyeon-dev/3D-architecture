from fastapi import APIRouter

from app.community.schema import BuildingCard
from app.community.service import get_building_cards


router = APIRouter(
    
    tags=["community"]
)


@router.get("/posts", response_model=list[BuildingCard])
def get_buildings():
    return get_building_cards()