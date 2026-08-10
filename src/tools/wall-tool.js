import * as THREE from 'three';
import { createBuildToolInstance } from '../assets/build-tool-assets.js';
import { createStructureInstance } from '../assets/structure-assets.js';
import { calculateMiterWalls } from './util/miter-calculator.js';
import { WALL_HEIGHT, GRID_SIZE_M } from '../config.js';

export function createWallTool({
    scene,
    gridSize
}){
    /* 변수 및 객체들 */
    let confirmedPoints = [];
    const confirmedWalls = [];
    let currentBuildParts = [];
    
    let currentStartPoint;
    let hoverPoint;

    /* 다음 객체를 생성한다:
       벽 건설 봉
       벽 건설 면 */
    const hoverWallPole = createBuildToolInstance('hover-wall-pole');
    const hoverWallFace = createBuildToolInstance('hover-wall-face');

    hoverWallPole.visible = false;
    hoverWallFace.visible = false;
    scene.add(hoverWallPole);
    scene.add(hoverWallFace);

    function hide() {
        hoverWallPole.visible = false;
        hoverWallFace.visible = false;
    }

    /* 예측 건설 지점 지속적으로 바꾸기 */
    function updateHoverPoint(gridX, gridZ){

        /* snap 적용 */
        const lastPoint = getLastConfirmedPoint();

        let snappedPoint = {
            gridX,
            gridZ
        };

        if(lastPoint){
            snappedPoint = snapHoverPoint(lastPoint, gridX, gridZ);
        }

        hoverPoint = snappedPoint;
        updateHoverWallPole(snappedPoint.gridX, snappedPoint.gridZ);
        updateHoverWallFace();
    }

    /* 벽 건설 봉을 지속적으로 바꾸기 */
    function updateHoverWallPole(gridX, gridZ){
        hoverWallPole.position.set(
            gridX * gridSize,
            WALL_HEIGHT / 2,
            gridZ * gridSize            
        );

        hoverWallPole.visible = true;
    }

    /* 벽 건설 면을 지속적으로 바꾸기 */
    function updateHoverWallFace(){
        const segment = getCurrentSegment();

        if(!segment){
            hoverWallFace.visible = false;
            return;
        }

        const wallData = createWallData(
            segment.startPoint,
            segment.endPoint
        );

        doWallTransform(hoverWallFace, wallData);
        hoverWallFace.visible = true;
    }


    /* 실제 지점으로 확정하기 */
    function confirmPoint(gridX, gridZ){
        const startPoint = currentStartPoint;  
        const endPoint = hoverPoint
            ? { ...hoverPoint }
            : { gridX, gridZ };
        
        /* 기존에 있는 봉과 겹치는지 확인 */
        const existingPoint = confirmedPoints.find(point =>
            isSamePoint(point, endPoint)
        );
            
        /* 벽 박아놓기 */
        if(startPoint){
            let wall = createBuildToolInstance('hover-wall-face');      
            const wallData = createWallData(startPoint, endPoint);
            
            doWallTransform(wall, wallData);
            
            currentBuildParts.push({
                assetId: 'wall-face',
                data: wallData,
                toolMesh: wall
            });

            scene.add(wall);
        }

        /* 봉이 겹친다면? => 종료 및 실제 벽 생성 */
        if(existingPoint){
            commitCurrentBuildParts();

            currentStartPoint = undefined;
            hoverPoint = undefined;

            hide();
            return { finished: true };
        }

        const marker = createBuildToolInstance('hover-wall-pole');

        marker.position.set(
            endPoint.gridX * gridSize,
            WALL_HEIGHT / 2,
            endPoint.gridZ * gridSize
        );

        confirmedPoints.push(endPoint);
        currentStartPoint = endPoint;
        currentBuildParts.push({
            toolMesh: marker
        });
        scene.add(marker);

        return { finished: false }
    }

    
    /* 바로 이전의 실제 지점 불러오기 */
    function getLastConfirmedPoint() {
        return confirmedPoints.at(-1);
    }

    /* 바로 이전 - 현재 후보 간의 점 간격(segment) 불러오기 */
    function getCurrentSegment() {
        if (!currentStartPoint || !hoverPoint) {
            return undefined;
        }

        return {
            startPoint: currentStartPoint,
            endPoint: hoverPoint
        };
    }

    /* 인자값을 통해 실제 벽 mesh을 변형시키는 함수 */
    function doWallTransform(mesh, wallData){
        /* 해당 mesh에 적용한다 */
        mesh.position.set(
            wallData.midX,
            wallData.height / 2,
            wallData.midZ
        );

        mesh.scale.set(wallData.wallLength, 1, 1);
        mesh.rotation.set(0, wallData.rotationY, 0);

        mesh.visible = true;
    }

    /* 벽 좌표 데이터 생성기*/
    function createWallData(startPoint, endPoint) {
        const startWorldX = startPoint.gridX * gridSize;
        const startWorldZ = startPoint.gridZ * gridSize;
        const endWorldX = endPoint.gridX * gridSize;
        const endWorldZ = endPoint.gridZ * gridSize;

        const dx = endWorldX - startWorldX;
        const dz = endWorldZ - startWorldZ;

        return {
            id: crypto.randomUUID(),

            startPoint: { ...startPoint },
            endPoint: { ...endPoint },

            midX: (startWorldX + endWorldX) / 2,
            midZ: (startWorldZ + endWorldZ) / 2,
            wallLength: Math.hypot(dx, dz),
            rotationY: -Math.atan2(dz, dx),

            height: WALL_HEIGHT,
            materialId: 'default-wall'
        };
    }

    /* 겹치는 봉 위치인지 확인하기 */
    function isSamePoint(a, b) {
        return a.gridX === b.gridX && a.gridZ === b.gridZ;
    }

    /* 스냅을 적용하는 함수(15도 기준) */
    function snapHoverPoint(startPoint, gridX, gridZ){
        const _45Rad = Math.PI / 4;

        const startX = startPoint.gridX;
        const startZ = startPoint.gridZ;

        const dx = gridX - startX;
        const dz = gridZ - startZ;

        /* 1. startPoint 기준 마우스의 각도
           2. snaped된 15도 단위의 각도 */
        const mouseAngle = Math.atan2(dz, dx);
        const snappedAngle = Math.round(mouseAngle / _45Rad) * _45Rad;

        /* snaped 각도를 벡터 형태로 변환 */
        const dX = Math.cos(snappedAngle);
        const dZ = Math.sin(snappedAngle);
        
        const calcData = {
            startX, startZ,
            gridX, gridZ,
            dx, dz,
            dX, dZ
        };

        return diagonal(calcData);
    }

    /* 버그 수정용 함수.. 추후 이해 필요 */
    function diagonal(calcData){
        const { startX, startZ,
                gridX, gridZ,
                dx, dz,
                dX, dZ } = calcData;
        
        const isDiagonal = Math.abs(dX) > 0.5 && Math.abs(dZ) > 0.5;

        if (isDiagonal) {
            const step = Math.round(
                (Math.abs(dx) + Math.abs(dz)) / 2
            );

            return {
                gridX: startX + Math.sign(dX) * step,
                gridZ: startZ + Math.sign(dZ) * step
            };
        }

        if (Math.abs(dX) > Math.abs(dZ)) {
            return {
                gridX,
                gridZ: startZ
            };
        }

        return {
            gridX: startX,
            gridZ
        };        
    }

    /* 실제 구조물로 변환 */
    function commitCurrentBuildParts() {
        /* wall data만 파싱하여 가져오기 */
        const wallDataList = currentBuildParts
            .filter(part => part.assetId === 'wall-face')
            .map(part => part.data);

        const caculatedWallGeometries 
            = calculateMiterWalls(
                wallDataList, 
                GRID_SIZE_M
            )

        for(const wallGeometry of caculatedWallGeometries){
            const mesh = createStructureInstance('wall-face', wallGeometry);   
            confirmedWalls.push(wallGeometry);
            scene.add(mesh);
        }

        /* hover 객체 지우기 */
        for (const part of currentBuildParts) {
            scene.remove(part.toolMesh);
        }
        
        currentBuildParts = [];
    }

    return {
        hide,
        updateHoverPoint,
        confirmPoint,
        getLastConfirmedPoint,
        getCurrentSegment
    }
}
