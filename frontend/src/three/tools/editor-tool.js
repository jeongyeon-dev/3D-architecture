import * as THREE from 'three';

import { createBuildToolInstance } from '../assets/build-tool-assets.js';
import { createStructureInstance } from '../assets/structure-assets.js';
import { HOVER_ROOF_SPHERE_RADIUS, ROOF_ANGLE } from '../config.js';

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
        highlightObject(object)
        
        const arrow = getArrow(object);

        /* 마우스 커서가 화살표를 가리키지 않는 경우 */
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
        if(arrow) return;
        
        removeOutline(currentSelecteMesh);
        removeSelectionHighlight(currentSelecteMesh);
        removeGizmo();

        currentSelecteMesh = object;

        createOutline(currentSelecteMesh);
        createSelectionHighlight(currentSelecteMesh);
        createGizmo(currentSelecteMesh);
    }

    /* 마우스 클릭 + 드래그 시 */
    function holding(event){

    }

    /* 도구 감추기 */
    function hide(){
        hoverRoofPrism.visible = false;
        hoverRoofDot.visible = false;
    }

    function getGizmoTargets() {
        return currentGizmoTargets;
    }

    function getArrow(object){
        while (object && !object.userData.isGizmoArrow) {
            object = object.parent;
        }

        if (object?.userData.isGizmoArrow) {
            return object;
        }
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


    function updateHoverRoofDot(gridX, gridZ, gridY){
        hoverRoofDot.position.set(
            gridX * gridSize,
            (gridY * 0.1) + HOVER_ROOF_SPHERE_RADIUS,
            gridZ * gridSize            
        );

        hoverRoofDot.visible = true;
    }

    function updateHoverRoofPrism(){
        const prismData 
            = createPrismData(currentStartPoint, currentHoverPoint);

        doPrismTransform(hoverRoofPrism, prismData);
        hoverRoofPrism.visible = true;
    }

    function createPrismData(startPoint, endPoint){
        const startWorldX = startPoint.gridX * gridSize;
        const startWorldZ = startPoint.gridZ * gridSize;
        
        const endWorldX = endPoint.gridX * gridSize;
        const endWorldZ = endPoint.gridZ * gridSize;

        const width = Math.abs(startWorldX - endWorldX);
        const length = Math.abs(startWorldZ - endWorldZ);

        return {
            id: crypto.randomUUID(),

            startPoint: { ...startPoint },
            endPoint: { ...endPoint },

            midX: (startWorldX + endWorldX) / 2,
            midZ: (startWorldZ + endWorldZ) / 2,
            baseY: startPoint.gridY * 0.1,

            width,
            length,

            materialId: 'default-roof'
        };
    }

    /* 건설 확정: hover 객체 없애고 실제 모형 넣기 */
    function commitCurrentBuildParts(){
        const prismData =
            createPrismData(currentStartPoint, currentHoverPoint);

        const mesh = createStructureInstance('roof-prism');

        doPrismTransform(mesh, prismData);

        confirmedRoofs.push(mesh);
        scene.add(mesh);

        hoverRoofPrism.visible = false;
        currentStartPoint = null;
        currentHoverPoint = null;

        const id = addObject({
            type: "roof",
            data: prismData
        });

        mesh.userData.objectId = id;

        return {
            mesh,
            prismData
        };
    }

    function getPlatformMeshes() {
        return getPlatformObjectMeshes();
    }

    return {
        updateHoverPoint,
        confirmPoint,
        getGizmoTargets,
        holding,
        hide
    }
}


export function loadRoof(scene, data){
    const mesh = createStructureInstance('roof-prism');
    doPrismTransform(mesh, data);
    
    mesh.userData.objectId = addObject({
        type: "roof",
        data: data
    });

    addPlatformMesh(mesh);
    scene.add(mesh);
}


/* 공통 함수 */
function doPrismTransform(mesh, prismData){
    /* 각도 기준 높이 설정 */
    const roofHeight = getRoofHeight(prismData.width);

    mesh.position.set(
        prismData.midX,
        prismData.baseY,
        prismData.midZ
    );

    mesh.scale.set(
        prismData.width, 
        roofHeight, 
        prismData.length
    );
    mesh.visible = true;
}

function getRoofHeight(width) {
    const angle = THREE.MathUtils.degToRad(ROOF_ANGLE);

    return (width / 2) * Math.tan(angle);
}