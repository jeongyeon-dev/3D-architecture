package com.architecture.backend.realtime.objectSync;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.architecture.backend.realtime.objectSync.ObjectDtos.ObjectEditState;

import tools.jackson.databind.JsonNode;

@Component 
public class ObjectSessionStore {
    /* 인 메모리상 저장하는 변형 오브젝트들
       프로젝트ID => 오브젝트ID: 오브젝트 data */
    private final Map<Integer, Map<Integer, ObjectEditState>>
            editingObjectsByProject = new ConcurrentHashMap<>();


    /* 데이터 넣기: 덮어쓰기 가능 */
    public void putObject(
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
                objectId,
                new ObjectEditState(objectId, data)
            );
    }


    /* 데이터 지우기 */
    public void deleteObject(
        Integer projectId,
        Integer objectId
    ){
        Map<Integer, ObjectEditState> editingObjects =
            editingObjectsByProject.get(projectId);

        if(editingObjects == null){
            return;
        }

        editingObjects.remove(objectId);

        /* 비었을 경우 최상위 항목 제거 */
        if (editingObjects.isEmpty()) {
            editingObjectsByProject.remove(projectId, editingObjects);
        }
    }


    /* 데이터를 가져오는 함수 */
    public ObjectEditState getObject(
        Integer projectId,
        Integer objectId
    ) {
        Map<Integer, ObjectEditState> editingObjects =
            editingObjectsByProject.get(projectId);

        if (editingObjects == null) return null;

        return editingObjects.get(objectId);
    }
}