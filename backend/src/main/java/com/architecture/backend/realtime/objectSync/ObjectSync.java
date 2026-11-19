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
        /* 인메모리 계층에서 해당 객체를 지운다 */
        objectSessionStore.deleteObject(
            syncMessage.userId(),
            syncMessage.projectId(),
            syncMessage.objectId(),
            syncMessage.data()
        );

        /* DB 계층에서 이를 반영한다 */
    }
}
