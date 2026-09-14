import { createBuildToolInstance } from '../assets/build-tool-assets.js';
import { createInvisibleInstance } from '../assets/invisible-assets.js';

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
    function updateHoverPoint(gridX, gridZ, gridY, object){
        currentHoverPoint = { gridX, gridZ, gridY };
        updateHoverWindowGroup(gridX, gridZ, gridY);
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
    function updateHoverWindowGroup(gridX, gridZ, gridY){
        hoverWindowGroup.position.set(
            gridX * gridSize,
            (gridY * 0.1) + 2,
            gridZ * gridSize            
        );

        hoverWindowGroup.visible = true;
    }


    return {
        updateHoverPoint,
        confirmPoint,
        hide
    }
}

