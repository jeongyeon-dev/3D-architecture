package com.architecture.backend.community;

import java.time.LocalDateTime;

public record BuildingCard(
    String imageUrl,
    Long id,
    Long userId,
    String title,
    long viewCount,
    long likeCount,
    LocalDateTime updatedAt
) {
}
