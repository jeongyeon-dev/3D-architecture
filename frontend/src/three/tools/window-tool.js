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

    /* 도구 감추기 */
    function hide(){
        hoverRoofPrism.visible = false;
        hoverRoofDot.visible = false;
    }


    return {
        updateHoverPoint,
        confirmPoint,
        hide
    }
}

