import { createBuildToolInstance } from '../assets/build-tool-assets.js';
import { createStructureInstance } from '../assets/structure-assets.js';
import { WALL_HEIGHT, GRID_SIZE_M, WALL_THICKNESS } from '../config.js';
import { calculateMiterWalls } from './utils/miter-calculator.js';
import { snapHoverPoint } from './utils/snapper.js';

export function createWallTool({
    scene,
    gridSize
}){
    /* 변수 및 객체들 */
    let confirmedPoints = [];
    const confirmedWalls = [];
    let currentBuildParts = [];
    let confirmedWallData = [];
    
    let currentStartPoint;
    let currentHoverPoint;

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
    function updateHoverPoint(gridX, gridZ, gridY){
        /* snap 적용 */
        const lastPoint = currentStartPoint;

        let snappedPoint = {
            gridX,
            gridZ,
            gridY
        };

        if(lastPoint){
            snappedPoint = snapHoverPoint(lastPoint, gridX, gridZ, gridY);
        }

        currentHoverPoint = snappedPoint;
        updateHoverWallPole(
            snappedPoint.gridX, 
            snappedPoint.gridZ, 
            snappedPoint.gridY
        );
        updateHoverWallFace(snappedPoint.gridY);
    }

    /* 벽 건설 봉을 지속적으로 바꾸기 */
    function updateHoverWallPole(gridX, gridZ, gridY){
        hoverWallPole.position.set(
            gridX * gridSize,
            (WALL_HEIGHT / 2) + (gridY * 0.1),
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
    function confirmPoint(gridX, gridZ, gridY){
        const startPoint = currentStartPoint;  
        const endPoint = currentHoverPoint
            ? { ...currentHoverPoint }
            : { gridX, gridZ, gridY };
        
        /* 기존에 있는 봉과 겹치는지 확인 */
        const existingPoint = confirmedPoints.find(point =>
            isSamePoint(point, endPoint)
        );

        /* 임시 코드 */
        if (existingPoint && !startPoint) {
            currentStartPoint = existingPoint;
            currentHoverPoint = { ...existingPoint };

            return { finished: false };
        }
            
        /* 벽 박아놓기 */
        if(startPoint && !isSamePoint(startPoint, endPoint)){
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
            currentHoverPoint = undefined;

            hide();
            return { finished: true };
        }

        const marker = createBuildToolInstance('hover-wall-pole');

        marker.position.set(
            endPoint.gridX * gridSize,
            (WALL_HEIGHT / 2) + (endPoint.gridY * 0.1),
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
        if (!currentStartPoint || !currentHoverPoint) {
            return undefined;
        }

        return {
            startPoint: currentStartPoint,
            endPoint: currentHoverPoint
        };
    }

    /* 인자값을 통해 실제 벽 mesh을 변형시키는 함수 */
    function doWallTransform(mesh, wallData){
        /* 해당 mesh에 적용한다 */
        mesh.position.set(
            wallData.midX,
            (wallData.height / 2) + wallData.midY,
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
        const startWorldY = startPoint.gridY * 0.1;
        
        const endWorldX = endPoint.gridX * gridSize;
        const endWorldZ = endPoint.gridZ * gridSize;
        const endWorldY = endPoint.gridY * 0.1;

        const dx = endWorldX - startWorldX;
        const dz = endWorldZ - startWorldZ;

        return {
            id: crypto.randomUUID(),

            startPoint: { ...startPoint },
            endPoint: { ...endPoint },

            midX: (startWorldX + endWorldX) / 2,
            midZ: (startWorldZ + endWorldZ) / 2,
            midY: (startWorldY + endWorldY) / 2,

            wallLength: Math.hypot(dx, dz),
            rotationY: -Math.atan2(dz, dx),

            height: WALL_HEIGHT,
            materialId: 'default-wall'
        };
    }

    /* 겹치는 봉 위치인지 확인하기 */
    function isSamePoint(a, b) {
        return (
            a.gridX === b.gridX &&
            a.gridZ === b.gridZ &&
            a.gridY === b.gridY
        );
    }

    /* 실제 구조물로 만듦 */
    function commitCurrentBuildParts() {
        /* 임시 wall data만 파싱하여 가져오기 */
        const wallDataList = currentBuildParts
            .filter(part => part.assetId === 'wall-face')
            .map(part => part.data);

        const caculatedWallGeometries 
            = calculateMiterWalls(
                wallDataList, 
                GRID_SIZE_M,
                WALL_THICKNESS
            );

        for(const wallGeometry of caculatedWallGeometries){
            const mesh = createStructureInstance('wall-face', wallGeometry);   
            confirmedWalls.push(wallGeometry);
            scene.add(mesh);
        }

        /* hover 객체 지우기 */
        for (const part of currentBuildParts) {
            scene.remove(part.toolMesh);
        }

        confirmedWallData.push(...wallDataList);
        currentBuildParts = [];
    }

    
    /* 내부 데이터 가져오기 함수 */
    function getWallData(){
        return confirmedWallData;
    }

    return {
        hide,
        updateHoverPoint,
        confirmPoint,
        getLastConfirmedPoint,
        getCurrentSegment,
        getWallData
    }
}
