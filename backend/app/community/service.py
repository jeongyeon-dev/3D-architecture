from datetime import datetime

from app.community.schema import BuildingCard


DUMMY_BUILDINGS = [
    BuildingCard(
        image_url="https://example.com/building1.jpg",
        id=1,
        user_id=101,
        title="모던 하우스",
        view_count=152,
        like_count=23,
        updated_at=datetime(2026, 8, 20, 15, 30),
    ),
    BuildingCard(
        image_url="https://example.com/building2.jpg",
        id=2,
        user_id=102,
        title="2층 목조 주택",
        view_count=87,
        like_count=12,
        updated_at=datetime(2026, 8, 19, 11, 20),
    ),
    BuildingCard(
        image_url="https://example.com/building3.jpg",
        id=3,
        user_id=101,
        title="작은 카페",
        view_count=321,
        like_count=48,
        updated_at=datetime(2026, 8, 18, 9, 10),
    ),
]


def get_building_cards() -> list[BuildingCard]:
    return DUMMY_BUILDINGS