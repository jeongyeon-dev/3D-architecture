import { sendSocketMessage } from "./project-socket";


/* 오브젝트 조작 본체 로직들 */
import { doPrismTransform } from "../three/tools/roof-tool";

/* 프론트 오브젝트 데이터: 동기화용 */
import { getObject } from "../three/project/project-state.js";

/* gizmo 동기화용 */
import { updateGizmoPosition } from "../three/tools/utils/selection.js";


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
    let mesh;

    function receiveObjectDragStart(message) {
        mesh = findObjectMesh(scene, message.object_id);
    }

    function receiveObjectTransform(message) {
        if(mesh != null){
            doPrismTransform(mesh, message.data);
            updateGizmoPosition(message.data);
        }
    }

    function receiveObjectDragEnd(message) {
        if(mesh != null){
            doPrismTransform(mesh, message.data);
            updateGizmoPosition(message.data);
        
            /* 프론트 상 데이터 반영 필요 */
            const object = getObject(message.object_id);
            object.data = message.data;
        }
    }

    return {
        receiveObjectDragStart,
        receiveObjectTransform,
        receiveObjectDragEnd
    };
}


/* 보조 함수 */
function findObjectMesh(scene, objectId) {
    let targetMesh;

    scene.traverse((object) => {
        if (
            object.isMesh &&
            object.userData.objectId === objectId
        ) {
            targetMesh = object;
        }
    });

    return targetMesh;
}