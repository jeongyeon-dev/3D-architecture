package com.architecture.backend.realtime.objectSync;

import java.util.Map;
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
        Map<Integer, ObjectEditState> editingObject = editingObjectsByProject.get(userId);

        if(editingObject != null){
            editingObject.remove(userId);
        }
    }

    /* 데이터 찾아서 반환하기 */
}
