import * as THREE from 'three';

import { createBuildToolInstance } from '../assets/build-tool-assets.js';

import { 
    createStructureInstance, 
    updateWallSegmentInstance 
} from '../assets/structure-assets.js';

import { 
    WALL_HEIGHT,
    WINDOW_HEIGHT, 
    WINDOW_WIDTH 
} from '../config.js';

import { 
    getObject,
    addObject, 
} from "../project/project-state.js";


export function createWindowTool({
    scene,
    gridSize
}){
    /* 벽 절편 mesh를 미리 선언 => 초기화 */
    const hoverWallSegmentGroup = new THREE.Group();
    const hoverWallSegments = [];

    /* 변화 감지를 인식하기 위한 변수 */
    let currentGridPoint = undefined;
    let previewedWallMesh = undefined;
    
    scene.add(hoverWallSegmentGroup);
    initialzieWallSegments();


    /* 가시적 도구 객체들 호출 */
    const hoverWindowGroup = createBuildToolInstance('hover-window-group');
    hoverWindowGroup.visible = false;
    scene.add(hoverWindowGroup);


    /* 마우스 커서 추적 */
    function updateHoverPoint(gridX, gridZ, gridY, object, normal){   
        updateHoverWindowGroup(gridX, gridZ, gridY, object, normal);
        
        if (object?.userData.id !== 'wall-face'){
            clearWallSegmentationPreview();
            return;
        }

        /* 커서의 좌표가 변했는지 판별하기 */
        const nextGridPoint = {gridX, gridZ, gridY};
        const isSameGridPoint =
            currentGridPoint &&
            currentGridPoint.gridX === nextGridPoint.gridX &&
            currentGridPoint.gridZ === nextGridPoint.gridZ &&
            currentGridPoint.gridY === nextGridPoint.gridY;
        const isSameWall = previewedWallMesh === object;

        /* 조건 판별 부분 */
        if (isSameGridPoint && isSameWall) return;
        if (previewedWallMesh && !isSameWall) {
            previewedWallMesh.visible = true;
        }

        /* 현재 원본 벽을 숨김 => 변경된 커서 좌표를 업데이트 */
        previewedWallMesh = object;
        previewedWallMesh.visible = false;
        currentGridPoint = nextGridPoint;

        doWallSegmentation(gridX, gridZ, gridY, object);
    }

    /* 마우스 클릭 시 */
    function confirmPoint(gridX, gridZ, gridY, object){

    }

    /* 도구 감추기 */
    function hide(){
        hoverWindowGroup.visible = false;
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
    }


    /* 벽을 창문으로 뚫어서 재구성 하는 함수 */
    function doWallSegmentation(gridX, gridZ, gridY, object){
        
        /* 해당 wall 오브젝트의 wall data를 가져오기 */
        const wallObjectId = object.userData.objectId;
        const wallData = getObject(wallObjectId).data;
        
        /* wall data 기반으로 각 벽 절편(segment) 데이터 구하기 */
        const splitResult = splitWallByWindow(
                wallData, 
                gridX, 
                gridZ, 
                gridY,
                WINDOW_WIDTH, 
                WINDOW_HEIGHT
            );
        
        const segmentList = [
            splitResult.leftWall,
            splitResult.rightWall,
            splitResult.bottomWall,
            splitResult.topWall
        ].filter(Boolean);

        if (previewedWallMesh && previewedWallMesh !== object) {
            previewedWallMesh.visible = true;
        }

        previewedWallMesh = object;
        previewedWallMesh.visible = false;

        /* 벽 절편들을 실시간으로 변형을 수행 */
        hoverWallSegments.forEach((mesh, index) => {
            const segmentData = segmentList[index];

            if (!segmentData) {
                mesh.visible = false;
                return;
            }

            updateWallSegmentInstance(mesh, segmentData);
            mesh.visible = true;
        });

    }

    /* 초기 벽 절편 생성 함수 */
    function initialzieWallSegments(){
        for (let i = 0; i < 4; i++) {
            const mesh = createStructureInstance('wall-segment', {
                start: { x: 0, z: 0 },
                end: { x: 1, z: 0 },
                baseY: 0,
                height: 1
            });

            mesh.visible = false;

            hoverWallSegments.push(mesh);
            hoverWallSegmentGroup.add(mesh);
        }      
    }

    /* 절편 없애는 함수 */
    function clearWallSegmentationPreview() {
        if (previewedWallMesh) {
            previewedWallMesh.visible = true;
            previewedWallMesh = undefined;
        }

        for (const mesh of hoverWallSegments) {
            mesh.visible = false;
        }
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

