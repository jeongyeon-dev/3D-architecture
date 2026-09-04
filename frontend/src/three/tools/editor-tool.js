import * as THREE from 'three';

import { createBuildToolInstance } from '../assets/build-tool-assets.js';

import { doPrismTransform } from './roof-tool.js';

import { 
    createOutline, 
    removeOutline,
    createGizmo,
    removeGizmo,
    createSelectionHighlight,
    removeSelectionHighlight,
    setGizmoArrowScale
} from './utils/selection.js';
import { 
    getObject,
    addObject, 
    addPlatformMesh, 
    getPlatformObjectMeshes 
} from "../project/project-state.js";


export function createEditorTool({
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


    /* 가시적 도구 객체들 호출 */
    const hoverRoofPrism = createBuildToolInstance('hover-roof-prism');
    const hoverRoofDot = createBuildToolInstance('hover-roof-dot');

    hoverRoofPrism.visible = false;
    hoverRoofDot.visible = false;

    scene.add(hoverRoofPrism);
    scene.add(hoverRoofDot);


    /* 마우스 커서 추적 */
    function updateHoverPoint(gridX, gridZ, gridY, object){
        currentHoverPoint = { gridX, gridZ, gridY };

        /* 드래그 하고 있을 경우 => 선택된 mesh 스케일링 하기 */
        if (draggingArrow) {
            /* 해당 object를 기준으로 objectData 가져오기 */
            const objectId = currentSelecteMesh.userData.objectId;
            const _object = getObject(objectId);
            console.log(_object)
            updatePrismForm(_object, currentSelecteMesh);
            return;
        }
        
        /* 커서 가리키는 오브젝트 하이라이트 하기 */
        highlightObject(object)
        
        /* 마우스 커서가 화살표를 가리키지 않는 경우 */
        const arrow = getArrow(object);
        
        if(!arrow){
            if(hoveredArrow){
                setGizmoArrowScale(hoveredArrow, 1);
                hoveredArrow = undefined;    
            }
            return;
        }


        /* 다른 화살표로 이동한 경우 => 기존 scale 원래대로 */
        if(hoveredArrow && hoveredArrow !== arrow){
            setGizmoArrowScale(hoveredArrow, 1);
        }
        
        /* 새 화살표 scale 하기 */
        if(arrow){
            setGizmoArrowScale(arrow, 1.2);
        }

        hoveredArrow = arrow;
    }

    /* 마우스 클릭 시 */
    function confirmPoint(gridX, gridZ, gridY, object){
        currentHoverPoint = { gridX, gridZ, gridY };
        const arrow = getArrow(object);
        
        /* 화살표 클릭 시 => 드래그 시작 */
        if(arrow){
            draggingArrow = arrow;
            dragStartPoint = currentHoverPoint;
            return;
        }
        
        removeOutline(currentSelecteMesh);
        removeSelectionHighlight(currentSelecteMesh);
        removeGizmo();

        currentSelecteMesh = object;

        createOutline(currentSelecteMesh);
        createSelectionHighlight(currentSelecteMesh);
        createGizmo(currentSelecteMesh);
    }

    /* 마우스 클릭 상태가 끝났을 시 */
    function endDraggingPoint(event){
        if (event.button !== 0) return;

        currentStartPoint = null;
        draggingArrow = undefined;
        dragStartPoint = undefined;
    }

    /* 도구 감추기 */
    function hide(){
        hoverRoofPrism.visible = false;
        hoverRoofDot.visible = false;
    }

    /* object에서 화살표만 빼오기 */
    function getArrow(object){
        while (object && !object.userData.isGizmoArrow) {
            object = object.parent;
        }

        if (object?.userData.isGizmoArrow) {
            return object;
        }
    }

    function getGizmoTargets() {
        return currentGizmoTargets;
    }

    function isDragging(){
        return hoveredArrow !== undefined;
    }
    
    /* hover 오브젝트 highlight 하기 */
    function highlightObject(object){
        if(!object){
            if(currentHoveredMesh){
                removeSelectionHighlight(currentHoveredMesh);
                currentHoveredMesh = undefined;
                return;
            }
        }

        if(currentHoveredMesh && currentHoveredMesh !== object){
            removeSelectionHighlight(currentHoveredMesh);
        }

        if(object){
            createSelectionHighlight(object);
        }

        currentHoveredMesh = object;
    }

    /* currentSeletedMesh를 스케일링 하기 */
    function updatePrismForm(object, mesh) {
        const prismData = object.data;

        /* 방향과 delta(작용 정도) 구하기 */
        const direction = draggingArrow.userData.direction;
        
        const deltaX = (currentHoverPoint.gridX - dragStartPoint.gridX) * gridSize;
        const deltaZ = (currentHoverPoint.gridZ - dragStartPoint.gridZ) * gridSize; 
        const delta = direction.x !== 0 ? deltaX * direction.x : deltaZ * direction.z;

        resizePrism(prismData, direction, delta)
        doPrismTransform(mesh, prismData);
    }

    /* 프리즘 사이즈 재정의 */
    function resizePrism(prismData, direction, delta) {
        if (direction.x !== 0) {
            prismData.width += delta;
            prismData.midX += delta * direction.x / 2;
        }

        if (direction.z !== 0) {
            prismData.length += delta;
            prismData.midZ += delta * direction.z / 2;
    }
    }

    return {
        updateHoverPoint,
        confirmPoint,
        getGizmoTargets,
        endDraggingPoint,
        isDragging,
        hide
    }
}

