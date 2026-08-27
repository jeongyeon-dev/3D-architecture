import { createBuildToolInstance } from '../assets/build-tool-assets.js';
import { createStructureInstance } from '../assets/structure-assets.js';
import { GRID_SIZE_M, HOVER_FLOOR_SPHERE_RADIUS } from '../config.js';
import { snapHoverPoint } from './utils/snapper.js';

import { addObject } from "../project/project-state.js";


export function createFloorTool({
    scene,
    gridSize
}){
    /* 변수 및 객체들 */
    let confirmedPoints = [];
    let confirmedBuildParts = [];
    let currentBuildParts = [];

    let currentStartPoint;
    let currentHoverPoint;

    /* 다음 객체를 생성한다:
       벽 건설 봉
       벽 건설 면 */
    const hoverFloorDot = createBuildToolInstance('hover-floor-dot');
    const hoverFloorLine = createBuildToolInstance('hover-floor-line');

    hoverFloorDot.visible = false;
    hoverFloorLine.visible = false;
    
    scene.add(hoverFloorDot);
    scene.add(hoverFloorLine);

    function hide() {
        hoverFloorDot.visible = false;
        hoverFloorLine.visible = false;
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
        updateHoverFloorDot(
            snappedPoint.gridX, 
            snappedPoint.gridZ, 
            snappedPoint.gridY
        );
        updateHoverFloorLine(snappedPoint);
    }

    /* 실제 지점으로 확정하기 */
    function confirmPoint(gridX, gridZ, gridY){
        const startPoint = currentStartPoint;  
        const endPoint = currentHoverPoint
            ? { ...currentHoverPoint }
            : { gridX, gridZ, gridY };
        
        /* 기존에 있는 점과 겹치는지 확인 */
        const existingPoint = confirmedPoints.find(point =>
            isSamePoint(point, endPoint)
        );

        /* 임시 코드 */
        if (existingPoint && !startPoint) {
            currentStartPoint = existingPoint;
            currentHoverPoint = { ...existingPoint };

            return { finished: false };
        }
            
        /* 선 박아놓기 */
        if(startPoint && !isSamePoint(startPoint, endPoint)){
            let line = createBuildToolInstance('hover-floor-line');      
            
            doLineTransform(line, startPoint, endPoint);
            currentBuildParts.push({ toolMesh: line });
            
            scene.add(line);
        }

        /* 점이 겹친다면? => 종료 및 실제 바닥 생성 */
        if(existingPoint){
            commitCurrentBuildParts();

            currentStartPoint = undefined;
            currentHoverPoint = undefined;

            hide();
            return { finished: true };
        }

        const marker = createBuildToolInstance('hover-floor-dot');

        marker.position.set(
            endPoint.gridX * gridSize,
            (gridY * 0.1) + HOVER_FLOOR_SPHERE_RADIUS,
            endPoint.gridZ * gridSize
        );

        confirmedPoints.push(endPoint);
        currentStartPoint = endPoint;
        currentBuildParts.push({ toolMesh: marker });
        
        scene.add(marker);
        return { finished: false }
    }


    /* 벽 건설 봉을 지속적으로 바꾸기 */
    function updateHoverFloorDot(gridX, gridZ, gridY){
        hoverFloorDot.position.set(
            gridX * gridSize,
            (gridY * 0.1) + HOVER_FLOOR_SPHERE_RADIUS,
            gridZ * gridSize            
        );

        hoverFloorDot.visible = true;
    }

    /* 벽 건설 면을 지속적으로 바꾸기 */
    function updateHoverFloorLine(snappedPoint){
        const segment = getCurrentSegment();

        if(!segment){
            hoverFloorLine.visible = false;
            return;
        }

        doLineTransform(hoverFloorLine, segment.startPoint, snappedPoint);
        hoverFloorLine.visible = true;
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

    /* 인자값을 통해 실제 선을 변형시키는 함수 */
    function doLineTransform(line, startPoint, endPoint){
        const position = line.geometry.getAttribute('position');

        position.setXYZ(
            0,
            startPoint.gridX * GRID_SIZE_M,
            (startPoint.gridY * 0.1) + HOVER_FLOOR_SPHERE_RADIUS,
            startPoint.gridZ * GRID_SIZE_M
        );

        position.setXYZ(
            1,
            endPoint.gridX * GRID_SIZE_M,
            (endPoint.gridY * 0.1) + HOVER_FLOOR_SPHERE_RADIUS,
            endPoint.gridZ * GRID_SIZE_M
        );

        position.needsUpdate = true;

        line.visible = true;
    }

    /* 실제 구조물로 만듦 */
    function commitCurrentBuildParts() {
        const mesh = createStructureInstance('floor-polygon', confirmedPoints);
        const id = addObject({
            type: "floor",
            data: confirmedPoints
        });

        mesh.userData.objectId = id;    
        confirmedBuildParts.push(mesh);
        scene.add(mesh);

        /* hover 객체들 지우기 */
        for (const part of currentBuildParts) {
            scene.remove(part.toolMesh);
            part.toolMesh.geometry?.dispose();
            part.toolMesh.material?.dispose();
        }

        currentBuildParts = [];
        confirmedPoints = [];
    }

    /* 겹치는 봉 위치인지 확인하기 */
    function isSamePoint(a, b) {
        return (
            a.gridX === b.gridX &&
            a.gridZ === b.gridZ &&
            a.gridY === b.gridY
        );
    }

    return {
        updateHoverPoint,
        confirmPoint,
        hide
    }
}