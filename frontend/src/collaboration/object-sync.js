import { sendSocketMessage } from "./project-socket";


/** 발신부 **/
/* 오브젝트 클릭 시작 */
export function sendObjectDragStart(projectId, objectId) {
    sendSocketMessage({
        type: 'OBJECT_DRAG_START',
        projectId,
        objectId
    });
}

/* 오브젝트 드래그 중: 변형 계속 */
export function sendObjectTransform(projectId, objectId, data) {
    sendSocketMessage({
        type: 'OBJECT_TRANSFORM',
        projectId,
        objectId,
        data
    });
}

/* 오브젝트 클릭 종료 */
export function sendObjectDragEnd(projectId, objectId, data) {
    sendSocketMessage({
        type: 'OBJECT_DRAG_END',
        projectId,
        objectId,
        data
    });
}


/** 수신부 **/
export function receiveObjectSync(scene) {
    function receiveObjectDragStart(message) {
        // scene 안에서 objectId로 Mesh를 찾고,
        // 원격 편집 시작 상태를 적용
        console.log("편집 시작: " + message)
    }

    function receiveObjectTransform(message) {
        // scene 안에서 objectId로 Mesh를 찾고,
        // message.data로 doTransform 실행
        console.log("편집 중: " + message)
    }

    function receiveObjectDragEnd(message) {
        // 최종 data 반영, 원격 편집 상태 해제
        console.log("편집 종료: " + message)
    }

    return {
        receiveObjectDragStart,
        receiveObjectTransform,
        receiveObjectDragEnd
    };
}