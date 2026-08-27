import { createBuildToolInstance } from '../assets/build-tool-assets.js';
import { createStructureInstance } from '../assets/structure-assets.js';
import { PLATFORM_HEIGHT } from '../config.js';

import { addObject } from "../project/project-state.js";


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
        currentHoverPoint = { gridX, gridZ };

        if(!currentStartPoint){
            updateHoverPlatformPole(gridX, gridZ);
            return;
        }      

        /* 두 번째 클릭 시 => 큐브 생성 */
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
        return commitCurrentBuildParts();
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

    /* 실시간 플랫폼 육면체 변화 수행
       : 시작 및 끝점으로 육면체 데이터 생성 => mesh에 적용하기 */
    function updateHoverPlatformCube(){
        const cubeData 
            = createCubeData(currentStartPoint, currentHoverPoint);

        doCubeTransform(hoverPlatformCube, cubeData);
        hoverPlatformCube.visible = true;
    }

    function createCubeData(startPoint, endPoint){
        const startWorldX = startPoint.gridX * gridSize;
        const startWorldZ = startPoint.gridZ * gridSize;
        const endWorldX = endPoint.gridX * gridSize;
        const endWorldZ = endPoint.gridZ * gridSize;

        return {
            id: crypto.randomUUID(),

            startPoint: { ...startPoint },
            endPoint: { ...endPoint },

            midX: (startWorldX + endWorldX) / 2,
            midZ: (startWorldZ + endWorldZ) / 2,

            width: Math.abs(startWorldX - endWorldX),
            length: Math.abs(startWorldZ - endWorldZ),
            height: PLATFORM_HEIGHT,
            
            materialId: 'default-platform'
        };
    }

    function doCubeTransform(mesh, cubeData){
        mesh.position.set(
            cubeData.midX,
            cubeData.height / 2,
            cubeData.midZ
        );

        mesh.scale.set(cubeData.width, 1, cubeData.length);
        mesh.visible = true;
    }

    /* 건설 확정: hover 객체 없애고 실제 모형 넣기 */
    function commitCurrentBuildParts(){
        const cubeData = createCubeData(currentStartPoint, currentHoverPoint);
        const mesh = createStructureInstance('platform-cube');

        doCubeTransform(mesh, cubeData);
        confirmedPlatforms.push(mesh);
        scene.add(mesh);

        hoverPlatformCube.visible = false;
        currentStartPoint = null;
        currentHoverPoint = null;


        /* 실제 모형 데이터 양식 작성 => 저장*/
        const id = addObject({
            type: "platform",
            data: cubeData
        });

        mesh.userData.objectId = id;

        return {
            mesh,
            cubeData
        };
    }

    function getPlatformMeshes() {
        return confirmedPlatforms;
    }

    return {
        updateHoverPoint,
        confirmPoint,
        hide,
        getPlatformMeshes
    }
}
