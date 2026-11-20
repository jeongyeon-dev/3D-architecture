package com.architecture.backend.realtime.objectSync.lock;

public class ObjectLockDtos {
    public record ObjectLockArguments(
        Integer projectId,
        Integer objectId,
        Integer userId,
        String sessionId
    ) {
    }    
}
