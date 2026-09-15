import { createBuildToolInstance } from '../assets/build-tool-assets.js';
import { createInvisibleInstance } from '../assets/invisible-assets.js';
import { 
    WALL_HEIGHT,
    WINDOW_HEIGHT, 
    WINDOW_WIDTH 
} from '../config.js';

import { 
    createOutline, 
    removeOutline,
    createGizmo,
    removeGizmo,
    createSelectionHighlight,
    removeSelectionHighlight,
    setGizmoArrowScale,
    updateGizmoPosition
} from './utils/selection.js';
import { 
    getObject,
    addObject, 
} from "../project/project-state.js";


export function createWindowTool({
    scene,
    gridSize
}){
    /* 빈 변수들 */
    const confirmedRoofs = [];
    let currentGizmoTargets = [];
    
    let currentStartPoint;
    let currentHoverPoint;
    let currentSelecteMesh;
    let currentHoveredMesh;

    let draggingArrow = undefined;
    let dragStartPoint = undefined; 
    let hoveredArrow = undefined;
    let draggingPrismData = undefined;

    let dragPlane;


    /* 가시적 도구 객체들 호출 */
    const hoverWindowGroup = createBuildToolInstance('hover-window-group');
    const hoverRoofDot = createBuildToolInstance('hover-roof-dot');

    hoverWindowGroup.visible = false;
    hoverRoofDot.visible = false;

    scene.add(hoverWindowGroup);
    scene.add(hoverRoofDot);


    /* 마우스 커서 추적 */
    function updateHoverPoint(gridX, gridZ, gridY, object, normal){
        currentHoverPoint = { gridX, gridZ, gridY };
        updateHoverWindowGroup(gridX, gridZ, gridY, object, normal);
    }

    /* 마우스 클릭 시 */
    function confirmPoint(gridX, gridZ, gridY, object){
        currentHoverPoint = { gridX, gridZ, gridY };
        const arrow = getArrow(object);
        
        /* 화살표 클릭 시 => 드래그 시작 */
        if(arrow){
            draggingArrow = arrow;
            dragStartPoint = currentHoverPoint;

            /* 변형 데이터 지속적 반영 */
            const objectId = currentSelecteMesh.userData.objectId;
            const _object = getObject(objectId);
            draggingPrismData = structuredClone(_object.data);
            return;
        }
        
        removeOutline(currentSelecteMesh);
        removeSelectionHighlight(currentSelecteMesh);
        removeGizmo();

        currentSelecteMesh = object;

        createOutline(currentSelecteMesh);
        createSelectionHighlight(currentSelecteMesh);
        createGizmo(currentSelecteMesh);

        /* drag plane y 위치 설정 */
        dragPlane = createInvisibleInstance(
            'invisible-plane',
            currentSelecteMesh.position.y
        );
    }

    /* 도구 감추기 */
    function hide(){
        hoverWindowGroup.visible = false;
        hoverRoofDot.visible = false;
    }


    /* hoverWindowGroup 위치 업데이트 */
    function updateHoverWindowGroup(gridX, gridZ, gridY, object, normal){
        hoverWindowGroup.position.set(
            gridX * gridSize,
            (gridY * 0.1) + (WINDOW_HEIGHT / 2),
            gridZ * gridSize            
        );

        hoverWindowGroup.rotation.y = 0;
        hoverWindowGroup.visible = true;

        /* object가 벽일 경우 => 방향을 벽에 맞게 회전시키기 */
        if (object?.userData.id !== 'wall-face') return;

        const rotationY = Math.atan2(normal.x, normal.z);
        hoverWindowGroup.rotation.y = rotationY;

        /* 해당 wall 오브젝트의 wall data를 가져오기 */
        const wallObjectId = object.userData.objectId;
        const wallData = getObject(wallObjectId).data;
        
        splitWallByWindow(
            wallData, 
            gridX, 
            gridZ, 
            WINDOW_WIDTH, 
            WINDOW_HEIGHT
        );
    }

    /* 창문을 기준으로 벽을 쪼개는 함수 */
    function splitWallByWindow(
        wallData,
        gridX,
        gridZ,
        gridY,
        windowWidth,
        windowHeight
    ) {
        /* 현 벽의 오른쪽 및 왼쪽 끝 점 구하기 */
        const wallStart = {
            x: (wallData.startLeft.x + wallData.startRight.x) / 2,
            z: (wallData.startLeft.z + wallData.startRight.z) / 2
        };

        const wallEnd = {
            x: (wallData.endLeft.x + wallData.endRight.x) / 2,
            z: (wallData.endLeft.z + wallData.endRight.z) / 2
        };

        const wallBaseY = wallData.baseY;
        const wallTopY = wallBaseY + WALL_HEIGHT;

        const directionX = wallEnd.x - wallStart.x;
        const directionZ = wallEnd.z - wallStart.z;
        const wallLength = Math.hypot(directionX, directionZ);

        const unitX = directionX / wallLength;
        const unitZ = directionZ / wallLength;


        /* 현재 커서의  x, z 값을 구한다 */
        const cursorX = gridX * gridSize;
        const cursorZ = gridZ * gridSize;

        const cursorDistance =
            (cursorX - wallStart.x) * unitX +
            (cursorZ - wallStart.z) * unitZ;

        const halfWidth = windowWidth / 2;

        /* 이를 바탕으로 창문 object의 중앙점을 구한다 */
        const windowCenterDistance = Math.max(
            halfWidth,
            Math.min(
                cursorDistance,
                wallLength - halfWidth
            )
        );

        /* 창문의 좌, 우 끝 지점을 구한다 */
        const windowStart = {
            x: wallStart.x + unitX * (windowCenterDistance - halfWidth),
            z: wallStart.z + unitZ * (windowCenterDistance - halfWidth)
        };
        const windowEnd = {
            x: wallStart.x + unitX * (windowCenterDistance + halfWidth),
            z: wallStart.z + unitZ * (windowCenterDistance + halfWidth)
        };

        /* 창문의 위, 아래 끝 지점을 구한다 */
        const windowBottomY = Math.max(
            wallBaseY,
            Math.min(gridY * 0.1, wallTopY - windowHeight)
        );
        const windowTopY = windowBottomY + windowHeight;

        /* 계산된 data 값들을 반환한다 */
        return {
            leftWall: {
                start: wallStart,
                end: windowStart,
                baseY: wallBaseY,
                height: WALL_HEIGHT
            },
            rightWall: {
                start: windowEnd,
                end: wallEnd,
                baseY: wallBaseY,
                height: WALL_HEIGHT
            },
            bottomWall: {
                start: windowStart,
                end: windowEnd,
                baseY: wallBaseY,
                height: windowBottomY - wallBaseY
            },
            topWall: {
                start: windowStart,
                end: windowEnd,
                baseY: windowTopY,
                height: wallTopY - windowTopY
            },
            opening: {
                start: windowStart,
                end: windowEnd,
                bottomY: windowBottomY,
                topY: windowTopY
            }
        };
    }

    return {
        updateHoverPoint,
        confirmPoint,
        hide
    }
}

