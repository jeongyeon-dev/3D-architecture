package com.architecture.backend.realtime.objectSync;

import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.architecture.backend.realtime.objectSync.ObjectDtos.ObjectEditState;

import tools.jackson.databind.JsonNode;

@Component 
public class ObjectSessionStore {
    /* 인 메모리상 저장하는 변형 오브젝트들
       프로젝트ID => 조작자 유저ID: 오브젝트 data */
    private final Map<Integer, Map<Integer, ObjectEditState>>
            editingObjectsByProject = new ConcurrentHashMap<>();


    /* 데이터 넣기: 덮어쓰기 가는 */
    public void putObject(        
        Integer userId, 
        Integer projectId,
        Integer objectId,
        JsonNode data
    ){
        editingObjectsByProject
            .computeIfAbsent(
                projectId, 
                key -> new ConcurrentHashMap<>()
            )
            .put(
                userId,
                new ObjectEditState(objectId, data)
            );
    }


    /* 데이터 지우기 */
    public void deleteObject(
        Integer userId, 
        Integer projectId,
        Integer objectId,
        JsonNode data
    ){
        Map<Integer, ObjectEditState> editingObjects = editingObjectsByProject.get(projectId);

        if(editingObjects == null){
            return;
        }

        editingObjects.computeIfPresent(userId, (key, state) ->
            Objects.equals(state.objectId(), objectId) ? null : state
        );

        /* 비엇을 경우 최상위 항목 제거 */
        if (editingObjects.isEmpty()) {
            editingObjectsByProject.remove(projectId, editingObjects);
        }
    }
}
