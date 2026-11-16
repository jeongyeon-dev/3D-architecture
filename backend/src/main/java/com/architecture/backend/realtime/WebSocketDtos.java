package com.architecture.backend.realtime;

import org.springframework.web.socket.WebSocketSession;

public class WebSocketDtos {
    public record ProjectSession(
        WebSocketSession session,
        Integer userId,
        Integer projectId
    ) {
    }

    public record UserAlertMessage(
        String type,
        Integer userId
    ) {
    }
}
