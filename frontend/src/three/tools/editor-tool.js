import * as THREE from 'three';

import { createBuildToolInstance } from '../assets/build-tool-assets.js';
import { createStructureInstance } from '../assets/structure-assets.js';
import { HOVER_ROOF_SPHERE_RADIUS, ROOF_ANGLE } from '../config.js';

import { 
    createOutline, 
    removeOutline,
    createGizmo,
    removeGizmo
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


    /* 가시적 도구 객체들 호출 */
    const hoverRoofPrism = createBuildToolInstance('hover-roof-prism');
    const hoverRoofDot = createBuildToolInstance('hover-roof-dot');

    hoverRoofPrism.visible = false;
    hoverRoofDot.visible = false;

    scene.add(hoverRoofPrism);
    scene.add(hoverRoofDot);


    /* 실시간 좌표 갱신 */
    function updateHoverPoint(gridX, gridZ, gridY){
        currentHoverPoint = { gridX, gridZ, gridY };
        // updateHoverRoofDot(gridX, gridZ, gridY);        
    }

    /* 클릭시 => 해당 mesh에 outline 그린다 */
    function confirmPoint(gridX, gridZ, gridY, object){
        currentHoverPoint = { gridX, gridZ, gridY };
        let arrow = object;

        
        while (arrow && !arrow.userData.isGizmoArrow) {
            arrow = arrow.parent;
        }

        if (arrow?.userData.isGizmoArrow) {
            console.log("화살표", arrow.userData.direction);
            return;
        }

        removeOutline(currentSelecteMesh);
        removeGizmo();

        currentSelecteMesh = object;

        createOutline(currentSelecteMesh);
        currentGizmoTargets = createGizmo(currentSelecteMesh);


        // if(!currentStartPoint){
        //     currentStartPoint = currentHoverPoint;
        //     hoverRoofDot.visible = false;
        //     return;
        // }

    }

    /* 도구 감추기 */
    function hide(){
        hoverRoofPrism.visible = false;
        hoverRoofDot.visible = false;
    }

    function getGizmoTargets() {
        return currentGizmoTargets;
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