import * as THREE from 'three';

import { 
    createBuildToolInstance
} from '../assets/build-tool-assets.js';

import { 
    createStructureInstance
} from '../assets/structure-assets.js';

import {
    splitWallByWindow,
    updateMiterWallSegmentMesh,
    updateWallSegmentMesh
} from './utils/wall-segmentor.js';
import { 
    GRID_SIZE_M,
    WALL_HEIGHT,
    WINDOW_HEIGHT, 
    WINDOW_WIDTH,
    WALL_THICKNESS
} from '../config.js';

import { 
    getObject, 
    addWallSegment,
    getWallSegment,
    addWindow
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
    } = createBasicWallSegments(scene);


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
        commitWallSegmentation(
            gridX, 
            gridZ, 
            gridY, 
            object, 
            false,
            scene,
            rotationY
        );

        if (previewedWallMesh === object) {
            previewedWallMesh = undefined;
        }
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
            gridSize,
            WINDOW_WIDTH,
            WINDOW_HEIGHT
        );

        /* 벽 절편 geometry 변경 개시 */
        updateMiterWallSegmentMesh(hoverLeftMiterWall, splitResult.leftWall);
        updateMiterWallSegmentMesh(hoverRightMiterWall, splitResult.rightWall);
        updateWallSegmentMesh(hoverBottomWall, splitResult.bottomWall);
        updateWallSegmentMesh(hoverTopWall, splitResult.topWall);
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


/* 저장된 wall data에서 창문을 불러오는 함수 */
export function loadWindow(scene, object, windows){
    let candidateSegments = [object];

    /* 창문을 하나씩 불러온다 */
    for (const windowData of windows){
        const windowGroup = createStructureInstance('window-group');
        const {
            gridX, gridZ, gridY,
            rotation, width, height
        } = windowData;

        /* 해당 창문을 배치한다 */
        windowGroup.position.set(
            gridX * GRID_SIZE_M,
            (gridY * 0.1) + (WINDOW_HEIGHT / 2),
            gridZ * GRID_SIZE_M            
        );

        /* 절편화 대상을 탐색한다 */
        const target = findWindowSegment(
            candidateSegments,
            windowData
        );
        
        const createdSegments =  commitWallSegmentation(
                gridX, 
                gridZ,
                gridY,
                target,
                true,
                scene,
                rotation
            );

        /* 쪼갠 대상은 빼고, 새로 생성된 4개를 후보로 추가 */
        candidateSegments = [
            ...candidateSegments.filter(mesh => mesh !== target),
            ...createdSegments
        ];

        windowGroup.rotation.y = rotation; 
        scene.add(windowGroup);
    }
}


/* 공통 사용 함수들
   창문 위치 기반 벽 절편을 확정하는 함수 */
function commitWallSegmentation(
    gridX, 
    gridZ, 
    gridY, 
    object, 
    isLoader,
    scene,
    rotation
){

    /* 배치 확정할 벽 절편을 만든다 */
    let {
        leftMiterWall: _leftMiterWall,
        rightMiterWall: _rightMiterWall,
        bottomWall: _bottomWall,
        topWall: _topWall  
    } = createBasicWallSegments(scene);

    const wallData = object.userData.id === 'wall-segment'
            ? getWallSegment(object.userData.segmentId)
            : getObject(object.userData.objectId).data;     
    const parentWallId = object.userData.id === 'wall-segment'
            ? object.userData.parentWallId
            : object.userData.objectId;
    

    /* 확정된 grid 기준 벽을 재구성 */
    const confirmedSplitResult = splitWallByWindow(
        wallData,
        gridX,
        gridZ,
        gridY,
        GRID_SIZE_M,
        WINDOW_WIDTH,
        WINDOW_HEIGHT
    );

    updateMiterWallSegmentMesh(_leftMiterWall, confirmedSplitResult.leftWall);
    updateMiterWallSegmentMesh(_rightMiterWall, confirmedSplitResult.rightWall);
    updateWallSegmentMesh(_bottomWall, confirmedSplitResult.bottomWall);
    updateWallSegmentMesh(_topWall, confirmedSplitResult.topWall);

    /* 런타임 객체 저장하기 */
    const leftSegmentId = addWallSegment(confirmedSplitResult.leftWall);
    const rightSegmentId = addWallSegment(confirmedSplitResult.rightWall);
    const bottomSegmentId = addWallSegment(confirmedSplitResult.bottomWall);
    const topSegmentId = addWallSegment(confirmedSplitResult.topWall);

    /* 부모 ID 기반하여 벽 절편들 데이터를 넣는다 => scene에서 감지 */
    const confirmedSegments = [
        {mesh: _leftMiterWall, segmentId: leftSegmentId},
        {mesh: _rightMiterWall, segmentId: rightSegmentId},
        {mesh: _bottomWall, segmentId: bottomSegmentId},
        {mesh: _topWall, segmentId: topSegmentId}
    ];

    for ( const { mesh, segmentId } of confirmedSegments ){
        mesh.castShadow = true;
        mesh.receiveShadow = true;
    
        mesh.userData = {
            id: 'wall-segment',
            segmentId,
            parentWallId: parentWallId
        };
    }

    /* 창문 객체 데이터를 저장하기(처음이라면) */
    if(!isLoader){
        addWindow(parentWallId, {
            gridX,
            gridZ,
            gridY,
            rotation,
            width: WINDOW_WIDTH,
            height: WINDOW_HEIGHT
        });
    }
    scene.remove(object);

    return [
        _leftMiterWall,
        _rightMiterWall,
        _bottomWall,
        _topWall        
    ];
}

/* 초기 벽 절편 생성 함수 */
function createBasicWallSegments(scene) {
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


/* 쪼개져야 할 벽 절편을 찾는 함수 */
function findWindowSegment(candidateSegments, windowData) {
    return candidateSegments.find((mesh) => {
        const segmentData =
            mesh.userData.id === 'wall-segment'
                ? getWallSegment(mesh.userData.segmentId)
                : getObject(mesh.userData.objectId).data;

        return isWindowInsideSegment(segmentData, windowData);
    });
}

function isWindowInsideSegment(segmentData, windowData) {
    const startX = (segmentData.startLeft.x + segmentData.startRight.x) / 2;
    const startZ = (segmentData.startLeft.z + segmentData.startRight.z) / 2;

    const endX = (segmentData.endLeft.x + segmentData.endRight.x) / 2;
    const endZ = (segmentData.endLeft.z + segmentData.endRight.z) / 2;

    const dx = endX - startX;
    const dz = endZ - startZ;

    const pointX = windowData.gridX * GRID_SIZE_M;
    const pointZ = windowData.gridZ * GRID_SIZE_M;
    const pointY = windowData.gridY * 0.1;
   
    const dot = (pointX - startX) * dx +
                (pointZ - startZ) * dz;

    const wallLengthSquared = dx * dx + dz * dz;
    const segmentHeight = segmentData.height ?? WALL_HEIGHT;

    return (
        dot >= 0 &&
        dot <= wallLengthSquared &&
        pointY >= segmentData.baseY &&
        pointY <= segmentData.baseY + segmentHeight
    );
}

