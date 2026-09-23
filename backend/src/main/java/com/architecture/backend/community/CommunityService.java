package com.architecture.backend.community;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class CommunityService {

    private static final List<BuildingCard> BUILDINGS = List.of(
        new BuildingCard("https://example.com/building1.jpg", 1L, 101L, "모던 하우스", 152, 23,
            LocalDateTime.of(2026, 8, 20, 15, 30)),
        new BuildingCard("https://example.com/building2.jpg", 2L, 102L, "2층 목조 주택", 87, 12,
            LocalDateTime.of(2026, 8, 19, 11, 20)),
        new BuildingCard("https://example.com/building3.jpg", 3L, 101L, "작은 카페", 321, 48,
            LocalDateTime.of(2026, 8, 18, 9, 10))
    );

    public List<BuildingCard> getBuildingCards() {
        return BUILDINGS;
    }
}
