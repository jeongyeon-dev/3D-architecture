package com.architecture.backend.realtime.objectSync;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.architecture.backend.config.ResourceNotFoundException;
import com.architecture.backend.project.projectObject.ProjectObjectEntity;
import com.architecture.backend.project.projectObject.ProjectObjectRepository;
import com.architecture.backend.realtime.objectSync.ObjectDtos.ObjectSyncMessage;
import com.architecture.backend.realtime.objectSync.lock.ObjectLockManager;
import com.architecture.backend.realtime.objectSync.lock.ObjectLockDtos.ObjectLockArguments;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import tools.jackson.databind.node.ObjectNode;

@Component 
@RequiredArgsConstructor 
public class ObjectSync {
    
    private final ObjectLockManager objectLockManager;
    private final ObjectSessionStore objectSessionStore;
    private final ProjectObjectRepository projectObjectRepository;

    /* 오브젝트 변형 시작 */
    public ObjectSyncMessage startManipulation(ObjectSyncMessage syncMessage){
    
        /* 락 획득 실패시 중단. */
        ObjectLockArguments arguments = assembleLockArguments(syncMessage);
        if(!objectLockManager.tryAcquire(arguments)) return null;

        objectSessionStore.putObject(
            syncMessage.projectId(),
            syncMessage.objectId(),
            null
        );

        return syncMessage;
    }


    /* 오브젝트 변형 계속 */
    public ObjectSyncMessage doManipulation(ObjectSyncMessage syncMessage){

        /* 락 없을시 중단. */
        ObjectLockArguments arguments = assembleLockArguments(syncMessage);
        if(!objectLockManager.renewIfOwner(arguments)) return null;

        objectSessionStore.putObject(
            syncMessage.projectId(),
            syncMessage.objectId(),
            syncMessage.data()
        );

        return syncMessage;
    }


    /* 오브젝트 변형 확정(끝) */
    @Transactional 
    public ObjectSyncMessage confirmManipulation(ObjectSyncMessage syncMessage){
        
        /* 락을 풀기: 애초에 락 없었으면 중단. */
        ObjectLockArguments arguments = assembleLockArguments(syncMessage);
        if (!objectLockManager.isOwner(arguments)) return null;


        /* DB 계층에서 이를 반영한다 */
        ProjectObjectEntity targetObject 
            = projectObjectRepository.findByProjectIdAndObjectId(
                    syncMessage.projectId(), 
                    syncMessage.objectId()
                )
                .orElseThrow(()-> new ResourceNotFoundException("해당 객체가 없습니다."));

        ObjectNode updatedObject = (ObjectNode) targetObject.getObjectData().deepCopy();         
        updatedObject.set("data", syncMessage.data());
        targetObject.update(updatedObject, LocalDateTime.now());
        projectObjectRepository.saveAndFlush(targetObject);       


        /* 인메모리 계층에서 해당 객체를 지운다 */
        objectSessionStore.deleteObject(
            syncMessage.projectId(),
            syncMessage.objectId()
        );

        /* 락 제거하기 */
        objectLockManager.releaseIfOwner(arguments);
        return syncMessage;
    }


    /* argument 객체 만드는 헬퍼 함수 */
    private ObjectLockArguments assembleLockArguments(ObjectSyncMessage message){
        return new ObjectLockArguments(
            message.projectId(),
            message.objectId(),
            message.userId(),
            message.sessionId()            
        );
    }
}
