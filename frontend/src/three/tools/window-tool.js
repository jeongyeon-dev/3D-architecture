import * as THREE from 'three';

import { 
    createBuildToolInstance
} from '../assets/build-tool-assets.js';

import { 
    createStructureInstance
} from '../assets/structure-assets.js';

import {
    createMiterWallSegmentGeometry
} from '../assets/util/geometry-calculator.js';

import { 
    WALL_HEIGHT,
    WINDOW_HEIGHT, 
    WINDOW_WIDTH,
    WALL_THICKNESS
} from '../config.js';

import { 
    getObject,
    addObject, 
    addWallSegment,
    getWallSegment
} from "../project/project-state.js";



export function createWindowTool({
    scene,
    gridSize
}){
    /* 벽 절편 mesh를 미리 선언 => 초기화 */
    const hoverWallSegmentGroup = new THREE.Group();

    /* 변화 감지를 인식하기 위한 변수 */
    let currentGridPoint = undefined;
    let previewedWallMesh = undefined;
    
    scene.add(hoverWallSegmentGroup);
    
    let {
        leftMiterWall: hoverLeftMiterWall,
        rightMiterWall: hoverRightMiterWall,
        bottomWall: hoverBottomWall,
        topWall: hoverTopWall  
    } = createBasicWallSegments();


    /* hover 창문 객체 만들기 */
    const hoverWindowGroup = createBuildToolInstance('hover-window-group');
    hoverWindowGroup.visible = false;
    scene.add(hoverWindowGroup);


    /* 마우스 커서 추적 */
    function updateHoverPoint(gridX, gridZ, gridY, object, normal){   
        updateHoverWindowGroup(gridX, gridZ, gridY, object, normal);
        
        if (!isWallType(object)){
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
        const windowGroup = createStructureInstance('window-group');
        const rotationY = hoverWindowGroup.rotation.y;
        
        /* 위치 및 방향 설정 */
        windowGroup.position.set(
            gridX * gridSize,
            (gridY * 0.1) + (WINDOW_HEIGHT / 2),
            gridZ * gridSize            
        );
        windowGroup.rotation.y = rotationY; 
        scene.add(windowGroup);

        /* 벽 절편화 확정 */
        commitWallSegmentation(gridX, gridZ, gridY, object);
    }

    /* 도구 감추기 && 임시 벽 절변 상태 원복 */
    function hide(){
        hoverWindowGroup.visible = false;
        clearWallSegmentationPreview();
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
        if (object?.userData.id === 'wall-face' ||
            object?.userData.id === 'wall-segment'
        ){
            const rotationY = Math.atan2(normal.x, normal.z);
            hoverWindowGroup.rotation.y = rotationY; 
        }
    }


    /* 벽을 창문으로 뚫어서 재구성 하는 함수 */
    function doWallSegmentation(gridX, gridZ, gridY, object) {
        /* 다른 벽으로 옮겨졌다면 이전 원본 벽 복구 */
        if (previewedWallMesh && previewedWallMesh !== object) {
            previewedWallMesh.visible = true;
        }

        /* 현재 창문이 닿은 원본 벽 숨김 */
        previewedWallMesh = object;
        previewedWallMesh.visible = false;

        /* 벽 데이터 가져오기(원본 벽 or 벽 절편) */
        const wallData = object.userData.id === 'wall-segment'
                ? getWallSegment(object.userData.segmentId)
                : getObject(object.userData.objectId).data;

        const splitResult = splitWallByWindow(
            wallData,
            gridX,
            gridZ,
            gridY,
            WINDOW_WIDTH,
            WINDOW_HEIGHT
        );

        /* 벽 절편 geometry 변경 개시 */
        updateMiterWallSegmentMesh(hoverLeftMiterWall, splitResult.leftWall);
        updateMiterWallSegmentMesh(hoverRightMiterWall, splitResult.rightWall);
        updateWallSegmentMesh(hoverBottomWall, splitResult.bottomWall);
        updateWallSegmentMesh(hoverTopWall, splitResult.topWall);
    }

    /* 초기 벽 절편 생성 함수 */
    function createBasicWallSegments() {
        const halfThickness = WALL_THICKNESS / 2;

        const initialBoxData = {
            startLeft: { x: 0, z: halfThickness },
            startRight: { x: 0, z: -halfThickness },
            endLeft: { x: 1, z: halfThickness },
            endRight: { x: 1, z: -halfThickness },
            baseY: 0,
            height: 1
        };

        const initialMiterData = {
            startLeft: { x: 0, z: -0.08 },
            startRight: { x: 0, z: 0.08 },
            endLeft: { x: 1, z: -0.08 },
            endRight: { x: 1, z: 0.08 },
            baseY: 0,
            height: 1
        };

        const leftMiterWall = createBuildToolInstance(
            'miter-wall-segment',
            initialMiterData
        );
        const rightMiterWall = createBuildToolInstance(
            'miter-wall-segment',
            initialMiterData
        );
        const bottomWall = createBuildToolInstance(
            'wall-segment',
            initialBoxData
        );
        const topWall = createBuildToolInstance(
            'wall-segment',
            initialBoxData
        );

        const meshes = [
            leftMiterWall,
            rightMiterWall,
            bottomWall,
            topWall
        ];

        /* secene에서 일단 보이지 않게 하기 */
        for (const mesh of meshes) {
            mesh.visible = false;
            scene.add(mesh);
        }

        return {
            leftMiterWall,
            rightMiterWall,
            bottomWall,
            topWall
        }
    }

    /* 절편 없애는 함수 */
    function clearWallSegmentationPreview() {
        if (previewedWallMesh) {
            previewedWallMesh.visible = true;
            previewedWallMesh = undefined;
        }

        const meshes = [
            hoverLeftMiterWall,
            hoverRightMiterWall,
            hoverBottomWall,
            hoverTopWall
        ];

        for (const mesh of meshes) {
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
        const wallHeight = wallData.height ?? WALL_HEIGHT;
        const wallTopY = wallBaseY + wallHeight;

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
        const normalX = -unitZ;
        const normalZ = unitX;
        const halfThickness = WALL_THICKNESS / 2;

        const windowStart = {
            x: wallStart.x + unitX * (windowCenterDistance - halfWidth),
            z: wallStart.z + unitZ * (windowCenterDistance - halfWidth)
        };
        const windowEnd = {
            x: wallStart.x + unitX * (windowCenterDistance + halfWidth),
            z: wallStart.z + unitZ * (windowCenterDistance + halfWidth)
        };

        const windowStartLeft = {
            x: windowStart.x + normalX * halfThickness,
            z: windowStart.z + normalZ * halfThickness
        };

        const windowStartRight = {
            x: windowStart.x - normalX * halfThickness,
            z: windowStart.z - normalZ * halfThickness
        };

        const windowEndLeft = {
            x: windowEnd.x + normalX * halfThickness,
            z: windowEnd.z + normalZ * halfThickness
        };

        const windowEndRight = {
            x: windowEnd.x - normalX * halfThickness,
            z: windowEnd.z - normalZ * halfThickness
        };


        /* 창문의 위, 아래 끝 지점을 구한다 */
        const windowBottomY = Math.max(
            wallBaseY,
            Math.min(gridY * 0.1, wallTopY - windowHeight)
        );
        const windowTopY = windowBottomY + windowHeight;

        /* 계산된 data 값들을 반환한다 */
        return {
            /* 좌 우는 cube geometry가 바로 적용되지 않는다 */
            leftWall: {
                type: 'miter-segment',
                startLeft: wallData.startLeft,
                startRight: wallData.startRight,
                endLeft: windowStartLeft,
                endRight: windowStartRight,
                baseY: wallData.baseY,
                height: wallHeight
            },
            rightWall: {
                type: 'miter-segment',
                startLeft: windowEndLeft,
                startRight: windowEndRight,
                endLeft: wallData.endLeft,
                endRight: wallData.endRight,
                baseY: wallData.baseY,
                height: wallHeight
            },
            bottomWall: {
                type: 'wall-segment',

                startLeft: windowStartLeft,
                startRight: windowStartRight,
                endLeft: windowEndLeft,
                endRight: windowEndRight,

                baseY: wallData.baseY,
                height: windowBottomY - wallData.baseY
            },
            topWall: {
                type: 'wall-segment',

                startLeft: windowStartLeft,
                startRight: windowStartRight,
                endLeft: windowEndLeft,
                endRight: windowEndRight,

                baseY: windowTopY,
                height: wallTopY - windowTopY
            }
        };
    }


    /* 각각 miter 벽 절편, cube 벽 절편을 수시로 변경하는 함수 */
    function updateMiterWallSegmentMesh(mesh, segmentData) {
        const nextGeometry =
            createMiterWallSegmentGeometry(segmentData);

        mesh.geometry.dispose();
        mesh.geometry = nextGeometry;
        mesh.visible = true;
    }

    function updateWallSegmentMesh(mesh, segmentData) {
        const {
            startLeft, startRight,
            endLeft, endRight,
            baseY, height
        } = segmentData;

        const start = {
            x: (startLeft.x + startRight.x) / 2,
            z: (startLeft.z + startRight.z) / 2
        };

        const end = {
            x: (endLeft.x + endRight.x) / 2,
            z: (endLeft.z + endRight.z) / 2
        };

        const dx = end.x - start.x;
        const dz = end.z - start.z;

        const wallLength = Math.hypot(dx, dz);

        if (wallLength <= 0 || height <= 0) {
            mesh.visible = false;
            return;
        }

        mesh.position.set(
            (start.x + end.x) / 2,
            baseY + height / 2,
            (start.z + end.z) / 2
        );

        mesh.scale.set(wallLength, height, 1);
        mesh.rotation.set(0, -Math.atan2(dz, dx), 0);
        mesh.visible = true;
    }

    /* 창문 위치 기반 벽 절편을 확정하는 함수 */
    function commitWallSegmentation(gridX, gridZ, gridY, object){

        /* 배치 확정할 벽 절편을 만든다 */
        let {
            leftMiterWall: _leftMiterWall,
            rightMiterWall: _rightMiterWall,
            bottomWall: _bottomWall,
            topWall: _topWall  
        } = createBasicWallSegments();

        /* 확정된 grid 기준 벽을 재구성 */
        const wallData = object.userData.id === 'wall-segment'
                ? getWallSegment(object.userData.segmentId)
                : getObject(object.userData.objectId).data;
        
        const confirmedSplitResult = splitWallByWindow(
            wallData,
            gridX,
            gridZ,
            gridY,
            WINDOW_WIDTH,
            WINDOW_HEIGHT
        );

        updateMiterWallSegmentMesh(_leftMiterWall, confirmedSplitResult.leftWall);
        updateMiterWallSegmentMesh(_rightMiterWall, confirmedSplitResult.rightWall);
        updateWallSegmentMesh(_bottomWall, confirmedSplitResult.bottomWall);
        updateWallSegmentMesh(_topWall, confirmedSplitResult.topWall);

        /* 런타임 객체 저장하기 */
        const leftSegmentId =
            addWallSegment(confirmedSplitResult.leftWall);
        const rightSegmentId =
            addWallSegment(confirmedSplitResult.rightWall);
        const bottomSegmentId =
            addWallSegment(confirmedSplitResult.bottomWall);
        const topSegmentId =
            addWallSegment(confirmedSplitResult.topWall);

        /* 부모 ID 기반하여 벽 절편들 데이터를 넣는다 => scene에서 감지 */
        const confirmedSegments = [
            {mesh: _leftMiterWall, segmentId: leftSegmentId},
            {mesh: _rightMiterWall, segmentId: rightSegmentId},
            {mesh: _bottomWall, segmentId: bottomSegmentId},
            {mesh: _topWall, segmentId: topSegmentId}
        ];

        for ( const { mesh, segmentId } of confirmedSegments ){
            mesh.userData = {
                id: 'wall-segment',
                segmentId
            };
        }

        /* 원래 벽을 키지 못하도록 하기 => 원래 벽 지우기 */
        if (previewedWallMesh === object) {
            previewedWallMesh = undefined;
        }
        scene.remove(object);
    }

    /* 벽, 벽 절편인지 판별 */
    function isWallType(object){
        if (object?.userData.id === 'wall-face' ||
            object?.userData.id === 'wall-segment'
         ){
            return true;
        }else{
            return false;
        }
    }

    return {
        updateHoverPoint,
        confirmPoint,
        hide
    }
}

