import { createBuildToolInstance } from '../assets/build-tool-assets.js';
import { createInvisibleInstance } from '../assets/invisible-assets.js';
import { GIZMO_OFFSET } from '../config.js';
import { doPrismTransform } from './roof-tool.js';

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
    let draggingPrismData = undefined;

    let dragPlane;


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
            updatePrismForm(currentSelecteMesh);
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

    /* 마우스 클릭 상태가 끝났을 시 */
    function endDraggingPoint(event){
        if (event.button !== 0) return;

        /* 오브젝트 데이터가 변경 됨 */
        if (draggingArrow && currentSelecteMesh) {
            const objectId = currentSelecteMesh.userData.objectId;
            const object = getObject(objectId);

            object.data = draggingPrismData;
        }

        draggingPrismData = undefined;
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


    /* scene에서 조정될 반환 함수들 */
    function getGizmoTargets() {
        return currentGizmoTargets;
    }

    function isDragging(){
        return draggingArrow !== undefined;
    }

    function getDragPlane(){
        return dragPlane;
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
    function updatePrismForm(mesh) {
        const prismData = draggingPrismData;
        const direction = draggingArrow.userData.direction;

        /* 변형 data 생성하기 => 이에 기반하여 prism 형태 변형하기 */
        resizePrism(prismData, direction, currentHoverPoint);
        doPrismTransform(mesh, prismData);

        /* 변형된 prism에 맞춰 화살표 위치 갱신 */
        updateGizmoPosition(prismData);
    }

    /* 방향에 따른 prism 모형 data 변경하기:
        동 -> 서 -> 남 -> 북 순으로 if 문 */
    function resizePrism(prismData, direction, currentHoverPoint) {
        if (direction.x > 0) {
            const fixedX = prismData.midX - prismData.width / 2;
            const newX = currentHoverPoint.gridX * gridSize;

            prismData.width = newX - fixedX;
            prismData.midX = (fixedX + newX) / 2;
        }

        if (direction.x < 0) {
            const fixedX = prismData.midX + prismData.width / 2;
            const newX = currentHoverPoint.gridX * gridSize;

            prismData.width = fixedX - newX;
            prismData.midX = (fixedX + newX) / 2;
        }

        if (direction.z > 0) {
            const fixedZ = prismData.midZ - prismData.length / 2;
            const newZ = currentHoverPoint.gridZ * gridSize;

            prismData.length = newZ - fixedZ;
            prismData.midZ = (fixedZ + newZ) / 2;
        }

        if (direction.z < 0) {
            const fixedZ = prismData.midZ + prismData.length / 2;
            const newZ = currentHoverPoint.gridZ * gridSize;

            prismData.length = fixedZ - newZ;
            prismData.midZ = (fixedZ + newZ) / 2;
        }
    }

    /* gizmo 위치 재계산 함수 */
    // function updateGizmoPosition(arrow, prismData) {

    //     if (arrow.userData.direction.x > 0) {
    //         arrow.position.x = prismData.midX + prismData.width / 2 + GIZMO_OFFSET;
    //     }

    //     if (arrow.userData.direction.x < 0) {
    //         arrow.position.x = prismData.midX - prismData.width / 2 - GIZMO_OFFSET;
    //     }

    //     if (arrow.userData.direction.z > 0) {
    //         arrow.position.z = prismData.midZ + prismData.length / 2 + GIZMO_OFFSET;
    //     }

    //     if (arrow.userData.direction.z < 0) {
    //         arrow.position.z = prismData.midZ - prismData.length / 2 - GIZMO_OFFSET;
    //     }
    // }




    return {
        updateHoverPoint,
        confirmPoint,
        getGizmoTargets,
        endDraggingPoint,
        isDragging,
        getDragPlane,
        hide
    }
}

