import * as THREE from 'three';
import { createBuildToolInstance } from '../assets/build-tool.js';

export function createWallTool({
    scene,
    gridSize,
    toolId
}){
    const height = 2;

    /* 벽 건설 봉을 불러와서 화면에 넣는다 */
    const wallMarker = createBuildToolInstance(toolId);
    wallMarker.visible = false;
    scene.add(wallMarker);

    /* 건설 봉의 위치를 지속적으로 바꾸기 */
    function updatePosition(gridX, gridZ){
        wallMarker.position.set(
            gridX * gridSize,
            height / 2,
            gridZ * gridSize            
        );

        wallMarker.visible = true;
    }

    function hide() {
        wallMarker.visible = false;
    }

    return {
        updatePosition,
        hide
    }
}