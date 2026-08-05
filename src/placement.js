import * as THREE from 'three';
import { createAssetInstance } from './assets/basic-assets.js';

export function createPlacementController({
    scene,
    renderer,
    camera,
    plate,
    gridSize,
    onGridSelected,
    onGridHovered
}) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    /* 마우스 클릭 시 => raycast로 특정 좌표 감지 */
    function onMouseDown(event) {
        const rect = renderer.domElement.getBoundingClientRect();

        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const hit = raycaster.intersectObject(plate, false)[0];
        if (!hit) return;

        const gridX = Math.round(hit.point.x / gridSize);
        const gridZ = Math.round(hit.point.z / gridSize);

        onGridSelected?.({ gridX, gridZ });

        const snappedX = gridX * gridSize;
        const snappedZ = gridZ * gridSize;
    }

    function onMouseMove(event){
        const currGridPoint = getGridPoint(event);
        if (!currGridPoint) return;

        onGridHovered?.(currGridPoint);
    }

    /* 마우스 커서(event)를 grid 좌표로 반환하는 함수 */
    function getGridPoint(event){
        const rect = renderer.domElement.getBoundingClientRect();

        /* 마우스 좌표를 기준으로 raycast 실행 */
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const hit= raycaster.intersectObject(plate, false)[0];
        if (!hit) return undefined;

        return {
            gridX: Math.round(hit.point.x / gridSize),
            gridZ: Math.round(hit.point.z / gridSize)
        };
    }

    /* 오브젝트를 배치하는 함수 */
    function placeObject(assetId, gridX, gridZ){
        if(!assetId || assetId === 'bulldoze') return;

        const worldX = gridX * gridSize;
        const worldZ = gridZ * gridSize;

        /* 여기서 ID 기반 mesh 생성 */
        const deployedMesh = createAssetInstance(
            assetId,
            worldX,
            worldZ
        );

        if(!deployedMesh) return;

        deployedMesh.userData.gridX = gridX;
        deployedMesh.userData.gridZ = gridZ;

        scene.add(deployedMesh);

        return deployedMesh;
    }

    return {
        onMouseDown,
        onMouseMove,
        placeObject
    };
}