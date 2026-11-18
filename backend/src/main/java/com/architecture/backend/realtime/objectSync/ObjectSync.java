package com.architecture.backend.realtime.objectSync;

import org.springframework.stereotype.Component;

import com.architecture.backend.realtime.objectSync.ObjectDtos.ObjectSyncMessage;

import lombok.RequiredArgsConstructor;

@Component 
@RequiredArgsConstructor 
public class ObjectSync {

    private final ObjectSessionStore objectSessionStore;
    

    /* 오브젝트 변형 시작 */
    public void startManipulation(ObjectSyncMessage syncMessage){
        objectSessionStore.putObject(
            syncMessage.userId(),
            syncMessage.projectId(),
            syncMessage.objectId(),
            null
        );
    }


    /* 오브젝트 변형 계속 */
    public void doManipulation(ObjectSyncMessage syncMessage){
        objectSessionStore.putObject(
            syncMessage.userId(),
            syncMessage.projectId(),
            syncMessage.objectId(),
            syncMessage.data()
        );
    }


    /* 오브젝트 변형 확정(끝) */
    public void confirmManipulation(ObjectSyncMessage syncMessage){
        objectSessionStore.deleteObject(
            syncMessage.userId(),
            syncMessage.projectId(),
            syncMessage.objectId(),
            syncMessage.data()
        );
    }
}
