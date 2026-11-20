package com.architecture.backend.realtime.objectSync.lock;

import java.time.Instant;


public record ObjectLockState(
    Integer editorUserId,

    /* 상대가 도중에 나갔는데, 락 걸려있을 경우 => 자동 락 소실하도록 */
    String sessionId,
    Instant leaseExpiresAt
) {
}
