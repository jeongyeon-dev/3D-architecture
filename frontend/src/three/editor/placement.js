import * as THREE from 'three';

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
    let raycastTargets = [plate];

    /* 어떤 오브젝트가 감지되어야 하는지 설정 */
    function setRaycastTargets(targets) {
        raycastTargets = targets;
    }

    /* 왼쪽 마우스 클릭 시 => raycast로 특정 좌표 감지 */
    function onMouseDown(event) {
        if (event.button !== 0) return;
        
        const rect = renderer.domElement.getBoundingClientRect();

        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const hit = raycaster.intersectObjects(raycastTargets, false)[0];
        if (!hit) return;

        const gridX = Math.round(hit.point.x / gridSize);
        const gridZ = Math.round(hit.point.z / gridSize);
        const gridY = Math.round(hit.point.y / 0.1 );

        onGridSelected?.({ gridX, gridZ, gridY, object: hit.object });
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

        const hit= raycaster.intersectObjects(raycastTargets, false)[0];
        if (!hit) return undefined;
 
        return {
            gridX: Math.round(hit.point.x / gridSize),
            gridZ: Math.round(hit.point.z / gridSize),
            gridY: Math.round(hit.point.y / 0.1 ),
            object: hit.object
        };
    }

    return {
        onMouseDown,
        onMouseMove,
        setRaycastTargets
    };
}