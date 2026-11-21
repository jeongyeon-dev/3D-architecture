package com.architecture.backend.realtime.objectSync.lock;

import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

import org.springframework.stereotype.Component;

import com.architecture.backend.realtime.objectSync.lock.ObjectLockDtos.ObjectLockArguments;

@Component 
public class ObjectLockManager {
    /* 락을 저장하는 객체 */
    private final Map<ObjectLockKey, ObjectLockState> locks = new ConcurrentHashMap<>();

    /* 락 획득 시도하는 함수 */
    public boolean tryAcquire(ObjectLockArguments arguments){
        ObjectLockKey attemptKey = new ObjectLockKey(
                arguments.projectId(), 
                arguments.objectId()
            );

        /* 이미 누군가 획득했다면? */
        AtomicBoolean acquired = new AtomicBoolean(false);
        Instant now = Instant.now();

        locks.compute(attemptKey, (currentKey, currentState) -> {
            /* 획득 가능 여부 측정하기 */
            boolean available =
                currentState == null ||
                isExpired(currentState, now) ||
                isSameOwner(currentState, arguments);

            /* 불가시 중단 */
            if (!available) return currentState;

            acquired.set(true);
            return new ObjectLockState(
                arguments.userId(),
                arguments.sessionId(),
                now.plusSeconds(10)
            );
            
        });

        return acquired.get();
    }


    /* 락 갱신 시도하는 함수 */
    public boolean renewIfOwner(ObjectLockArguments arguments){
        ObjectLockKey attemptKey = new ObjectLockKey(
                arguments.projectId(), 
                arguments.objectId()
            );

        /* 소유주 아닐 경우 => F, 소유주일 경우 => T & 시간 갱신 */
        if(!isOwner(attemptKey, arguments)) return false;

        ObjectLockState value = locks.get(attemptKey);
        locks.put(
            attemptKey, 
            new ObjectLockState(
                value.editorUserId(),
                value.sessionId(),
                Instant.now().plusSeconds(10)
            )
        );

        return true;
    }


    /* 락을 푸는 함수 */
    public boolean releaseIfOwner(ObjectLockArguments arguments){
        ObjectLockKey attemptKey = new ObjectLockKey(
                arguments.projectId(), 
                arguments.objectId()
            );

        if(!isOwner(attemptKey, arguments)) return false;

        /* 락 제거 */
        locks.computeIfPresent(attemptKey, (key, value) ->
            value.editorUserId().equals(arguments.userId()) ? null : value
        );

        return true;
    }

    

    /* 락의 소유주인지 확인하는 함수 */
    private boolean isOwner(ObjectLockKey key, ObjectLockArguments arguments){
        ObjectLockState state = locks.get(key);

        return state != null &&
            state.leaseExpiresAt().isAfter(Instant.now()) &&
            isSameOwner(state, arguments);
    }

    public boolean isOwner(ObjectLockArguments arguments) {
        ObjectLockKey key = new ObjectLockKey(
            arguments.projectId(),
            arguments.objectId()
        );

        return isOwner(key, arguments);
    }

    private boolean isSameOwner(
        ObjectLockState state,
        ObjectLockArguments arguments
    ) {
        return Objects.equals(state.editorUserId(), arguments.userId()) &&
            Objects.equals(state.sessionId(), arguments.sessionId());
    }

    /* 락이 만료되었는지 확인하는 함수 */
    private boolean isExpired(
        ObjectLockState state,
        Instant now
    ) {
        return !state.leaseExpiresAt().isAfter(now);
    }
}
