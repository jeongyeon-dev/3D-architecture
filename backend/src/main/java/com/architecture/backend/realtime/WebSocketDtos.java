package com.architecture.backend.realtime;

import com.fasterxml.jackson.annotation.JsonAlias;
import org.springframework.web.socket.WebSocketSession;

public class WebSocketDtos {
    /* 각 소켓 연결 세션에 저장할 정보들 */
    public record ProjectSession(
        WebSocketSession session,
        Integer userId,
        Integer projectId,
        String nickname
    ) {
    }

    public record UserAlertMessage(
        String type,
        Integer userId
    ) {
    }

    /* 서버 => 프론트로 broadcast 하는 커서 정보 */
    public record CursorMoveMessage(
        String type,
        Integer userId,
        String nickname,

        @JsonAlias("projectId")
        Integer projectId,

        @JsonAlias("gridX")
        Integer gridX,

        @JsonAlias("gridZ")
        Integer gridZ,

        @JsonAlias("gridY")
        Integer gridY
    ) {
    }
}
