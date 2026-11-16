package com.architecture.backend.realtime;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.architecture.backend.realtime.WebSocketDtos.ProjectSession;
import com.architecture.backend.realtime.WebSocketDtos.UserAlertMessage;

import lombok.RequiredArgsConstructor;
import tools.jackson.databind.ObjectMapper;

@Component 
@RequiredArgsConstructor 
public class WebSocketHandler extends TextWebSocketHandler {

    private final WebSocketSessionRegistry webSocketSessionRegistry;
    private final ObjectMapper objectMapper;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        /* 등록하기 */
        webSocketSessionRegistry.register(session);

        System.out.println("WebSocket 연결: " + session.getId());
        ProjectSession joinUser = webSocketSessionRegistry.find(session);
        UserAlertMessage joinMessage = new UserAlertMessage("USER_JOIN", joinUser.userId());

        if(joinUser != null){
            String payload = objectMapper.writeValueAsString(joinMessage);
            webSocketSessionRegistry.broadcast(session, payload);
        }
    }

    @Override
    protected void handleTextMessage(
        WebSocketSession session,
        TextMessage message
    ) throws IOException {
        System.out.println("수신: " + message.getPayload());
        
        /* 발신(broadcast)하기 */
        webSocketSessionRegistry.broadcast(session, message.getPayload());
    }

    @Override
    public void afterConnectionClosed(
        WebSocketSession session,
        CloseStatus status
    ) throws IOException {
        System.out.println("WebSocket 종료: " + session.getId());
        ProjectSession leftUser = webSocketSessionRegistry.find(session);
        UserAlertMessage leaveMessage = new UserAlertMessage("USER_LEVE", leftUser.userId());

        if(leftUser != null){
            String payload = objectMapper.writeValueAsString(leaveMessage);
            webSocketSessionRegistry.broadcast(session, payload);
        }

        /* 해제하기 */
        webSocketSessionRegistry.unregister(session);
    }
}

