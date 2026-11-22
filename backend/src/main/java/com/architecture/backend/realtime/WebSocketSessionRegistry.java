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
import com.architecture.backend.realtime.objectSync.ObjectSessionStore;
import com.architecture.backend.realtime.objectSync.ObjectSync;
import com.architecture.backend.realtime.objectSync.ObjectDtos.ObjectEditDeniedMessage;
import com.architecture.backend.realtime.objectSync.ObjectDtos.ObjectEditState;
import com.architecture.backend.realtime.objectSync.ObjectDtos.ObjectSyncMessage;

import lombok.RequiredArgsConstructor;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/* 접속 소켓과 유저·프로젝트 정보 보관 */
@Component 
@RequiredArgsConstructor 
public class WebSocketSessionRegistry {

    private final JwtDecoder jwtDecoder;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    
    /* 오브젝트 동기화 */
    private final ObjectSync objectSync;
    private final ObjectSessionStore objectSessionStore;

    
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

        String outgoingPayload = null;
        ObjectSyncMessage syncMessage = null;
        String type = objectMapper
            .readTree(payload)
            .path("type")
            .asString();

        /* 분기에 따라 메시지가 작성됨 */
        switch (type) {
            case "CURSOR_MOVE" -> {
                outgoingPayload = makeCursorMessage(sender, payload);
            }        
            case "OBJECT_DRAG_START" -> {
                syncMessage = objectSync.startManipulation(
                    makeObjectMessage(sender, payload)
                );
            }
            case "OBJECT_TRANSFORM" -> {
                syncMessage = objectSync.doManipulation(
                    makeObjectMessage(sender, payload)
                );
            }
            case "OBJECT_DRAG_END" -> {
                syncMessage = objectSync.confirmManipulation(
                    makeObjectMessage(sender, payload)
                );
            }
        }

        /* 전할 메시지 구성 검토 단계 */
        if (syncMessage != null) {
            outgoingPayload = objectMapper.writeValueAsString(syncMessage);
        }

        /* 수행이 제대로 안되었다는 것: 예 => lock으로 막힘 */
        if (outgoingPayload == null){
            if ("OBJECT_DRAG_START".equals(type)) {
                /* 해당 오브젝트ID 기반 "거절됨" 메시지 및 transform 데이터를 편집 시도자에게 발송 */
                Integer objectId = objectMapper
                    .readTree(payload)
                    .path("objectId")
                    .intValue();

                ObjectEditState editState = objectSessionStore.getObject(sender.projectId(), objectId);
                JsonNode transform = editState == null ? null : editState.data();

                ObjectEditDeniedMessage deniedMessage =
                    new ObjectEditDeniedMessage(
                        "OBJECT_LOCK_DENIED",
                        objectId,
                        transform
                    );

                session.sendMessage(
                    new TextMessage(
                        objectMapper.writeValueAsString(deniedMessage)
                    )
                );
            }   
            
            return;
        }


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


    /* 내부 분기 함수들 */
    private String makeCursorMessage(ProjectSession sender, String payload){
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

        return objectMapper.writeValueAsString(outgoing);
    }

    private ObjectSyncMessage makeObjectMessage(
        ProjectSession sender, 
        String payload
    ) throws IOException {
        
        ObjectSyncMessage received = objectMapper.readValue(
            payload,
            ObjectSyncMessage.class
        );

        return new ObjectSyncMessage(
            received.type(),
            sender.userId(),
            received.projectId(),
            received.objectId(),
            sender.session().getId(),
            received.data()
        );
    }
}

