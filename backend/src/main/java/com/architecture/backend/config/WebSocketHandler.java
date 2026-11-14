package com.architecture.backend.config;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component 
public class WebSocketHandler extends TextWebSocketHandler {
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        System.out.println("WebSocket 연결: " + session.getId());
    }

    @Override
    protected void handleTextMessage(
        WebSocketSession session,
        TextMessage message
    ) {
        System.out.println("수신: " + message.getPayload());
    }

    @Override
    public void afterConnectionClosed(
        WebSocketSession session,
        CloseStatus status
    ) {
        System.out.println("WebSocket 종료: " + session.getId());
    }
}
