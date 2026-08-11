import * as THREE from 'three';
import { createBuildToolInstance } from '../assets/build-tool-assets.js';
import { createStructureInstance } from '../assets/structure-assets.js';
import { PLATFORM_HEIGHT, GRID_SIZE_M } from '../config.js';

export function createPlatformTool({
    scene,
    gridSize
}){
    /* 빈 변수들 */
    const confirmedPlatforms = [];
    let currentStartPoint;
    let currentHoverPoint;


    /* 가시적 도구 객체들 호출 */
    const hoverPlatformCube = createBuildToolInstance('hover-platform-cube');
    const hoverPlatformPole = createBuildToolInstance('hover-platform-pole');

    hoverPlatformCube.visible = false;
    hoverPlatformPole.visible = false;

    scene.add(hoverPlatformCube);
    scene.add(hoverPlatformPole);


    /* 실시간 좌표 갱신 */
    function updateHoverPoint(gridX, gridZ){
        if(!currentStartPoint){
            updateHoverPlatformPole(gridX, gridZ);
            return;
        }      

        updateHoverPlatformCube();
    }

    /* 클릭하여 hoverPoint 확정 했을 때 */
    function confirmPoint(gridX, gridZ){
        currentHoverPoint = { gridX, gridZ };

        if(!currentStartPoint){
            currentStartPoint = currentHoverPoint;
            hoverPlatformPole.visible = false;
            return;
        }
        
        /* 이미 startPoint가 있으면 플랫폼 형태를 확정한다 */
    }

    /* 도구 감추기 */
    function hide(){
        hoverPlatformCube.visible = false;
        hoverPlatformPole.visible = false;
    }


    /* 플랫폼 봉 실시간 위치하기 */
    function updateHoverPlatformPole(gridX, gridZ){
        hoverPlatformPole.position.set(
            gridX * gridSize,
            PLATFORM_HEIGHT / 2,
            gridZ * gridSize            
        );

        hoverPlatformPole.visible = true;
    }

    return {
        updateHoverPoint,
        confirmPoint,
        hide
    }
}