package com.architecture.backend.realtime.objectSync;

import com.fasterxml.jackson.annotation.JsonAlias;

import tools.jackson.databind.JsonNode;

public class ObjectDtos {
    public record ObjectEditState(
        Integer objectId,
        JsonNode data
    ) {
    }

    /* 역 직렬화 문제 */
    public record ObjectSyncMessage(
        String type,

        @JsonAlias("userId")
        Integer userId,

        @JsonAlias("projectId")
        Integer projectId,

        @JsonAlias("objectId")
        Integer objectId,

        @JsonAlias("sessionId")
        String sessionId,
        
        JsonNode data
    ) {
    }

    public record ObjectEditDeniedMessage(
        String type,
        Integer objectId,
        JsonNode data
    ) {
    }
}
