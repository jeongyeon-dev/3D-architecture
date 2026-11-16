package com.architecture.backend.realtime;

import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.util.UriComponentsBuilder;

import com.architecture.backend.auth.UserEntity;
import com.architecture.backend.auth.UserRepository;
import com.architecture.backend.realtime.WebSocketDtos.CursorMoveMessage;
import com.architecture.backend.realtime.WebSocketDtos.ProjectSession;

import lombok.RequiredArgsConstructor;
import tools.jackson.databind.ObjectMapper;

/* 접속 소켓과 유저·프로젝트 정보 보관 */
@Component 
@RequiredArgsConstructor 
public class WebSocketSessionRegistry {

    private final JwtDecoder jwtDecoder;
    private final ObjectMapper objectMapper;

    private final UserRepository userRepository;

    /* 웹 소켓 세션 */
    private final Map<String, ProjectSession> websocketSessions = new ConcurrentHashMap<>();
    
    /* 프로젝트별 현재 접속 중인 세션(ID 기반) */
    private final Map<Integer, Set<String>> projectSessions = new ConcurrentHashMap<>();


    /* 등록하는 함수 */
    public void register(WebSocketSession session){
        URI uri = session.getUri();

        MultiValueMap<String, String> query = UriComponentsBuilder.fromUri(uri)
                .build()
                .getQueryParams();

        /* 유저 ID, 프로젝트 ID 파싱 */
        Jwt jwt = jwtDecoder.decode(query.getFirst("token"));
        Integer userId = Integer.valueOf(jwt.getSubject());
        Integer projectId = Integer.valueOf(query.getFirst("projectId"));

        /* 닉네임 찾는 과정 */
        UserEntity user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        String nickname = user.getNickname();


        websocketSessions.put(
            session.getId(), 
            new ProjectSession(session, userId, projectId, nickname)
        );

        projectSessions
            .computeIfAbsent(projectId, key -> ConcurrentHashMap.newKeySet())
            .add(session.getId());
    }

    /* 등록 해제하는 함수 */
    public void unregister(WebSocketSession session){
        /* 웹 소켓 세션에서 먼저 지운다 */
        ProjectSession projectSession = websocketSessions.remove(session.getId());
        if(projectSession == null) return;

        /* 해당 프로젝트 ID를 찾고 여기서 접속 중인 sessionId들을 찾는다 */
        Integer projectId = projectSession.projectId();
        Set<String> sessionIds = projectSessions.get(projectId);
        if(sessionIds == null) return;
        
        sessionIds.remove(session.getId());

        /* 만약 해당 프로젝트 조차 접속자가 없으면 => 다 지우기 */
        if(sessionIds.isEmpty()) projectSessions.remove(projectId);
    }

    /* 메시지 발신하는 함수 */
    public void broadcast(WebSocketSession session, String payload) throws IOException {
        /* 발신자 세션 찾기 */
        ProjectSession sender = websocketSessions.get(session.getId());
        if(sender == null) return;

        /* 맡은 메시지를 dto에 넣는 과정 */
        CursorMoveMessage received = objectMapper.readValue(
            payload,
            CursorMoveMessage.class
        );
        CursorMoveMessage outgoing = new CursorMoveMessage(
            received.type(),
            sender.userId(),
            sender.nickname(),
            received.projectId(),
            received.gridX(),
            received.gridZ(),
            received.gridY()
        );
        String outgoingPayload = objectMapper.writeValueAsString(outgoing);

        /* 해당 프로젝트에 있는 세션들 찾기 */
        Set<String> sesssionIds = projectSessions.get(sender.projectId());
        
        /* 발신하기: 해당 프로젝트 모든 세션에게, 본인만 빼고 */
        for(String sessionId : sesssionIds){
            if(sessionId.equals(session.getId())) continue;

            ProjectSession target = websocketSessions.get(sessionId);

            if(target != null && target.session().isOpen()){
                target.session().sendMessage(new TextMessage(outgoingPayload));
            }
        }
    }

    /* 특정 유저 찾기 */
    public ProjectSession find(WebSocketSession session) {
        return websocketSessions.get(session.getId());
    }
}

