package com.architecture.backend.realtime.objectSync.lock;

public record ObjectLockKey(
    Integer projectId,
    Integer objectId
) {
}
