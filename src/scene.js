import * as THREE from 'three';
import { createCamera } from './camera.js';
import { createAssetInstance } from './assets/basic-assets.js';
import { LAND_SIZE_M, GRID_SIZE_M } from './config.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js'
import { createGrid } from './grid.js';
import { createPlacementController } from './placement.js';

import { createWallTool } from './tools/wall-tool.js';
import { createPlatformTool } from './tools/platform-tool.js';

export function createScene(){
    /* 화면 생성 + 카메라 불러오기 */
    const gameWindow = document.getElementById('render-target');
    const scene = new THREE.Scene();

    const camera = createCamera(gameWindow);

    /* 화면 그려주는 객체(renderer) 자체 */
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
    renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2) );
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    gameWindow.appendChild(renderer.domElement);


    /* sky box 생성 및 설정 */
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.6;

    new EXRLoader().load(
        './public/skybox/sunflowers_puresky_1k.exr',
        (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;

            scene.background = texture;
            scene.environment = texture;
        },      
        undefined,
        (error) => {
            console.error('EXR 로딩 실패:', error);
        }
    )

    /* 구조체 */
    const hideTools = {
        wall: () => wallTool?.hide(),
        platform: () => platformTool?.hide()
    }

    /* raycasting 및 건설 오브젝트 추가하는 부분들 */
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    let selectedObject = undefined;
    let onObjectSelected = undefined;
    
    let plate;
    let placement
    
    let grid;
    let onGridHoveredCallback;
    
    let wallTool;
    let platformTool;

    /* 땅 지형 초기화 */
    function initialize(land){
        scene.clear();

        /* 카메라 위치 설정 */
        const center = LAND_SIZE_M / 2;
        camera.setOrigin(center, 0, center);

        /* 바닥 넣기 */
        plate = createAssetInstance('bedrock', center, center);           
        scene.add(plate);

        /* grid 불러오기 */
        grid = createGrid(LAND_SIZE_M, GRID_SIZE_M, center, center);
        scene.add(grid);

        /* raycast을 비롯한 오브젝트 생성체 가져오기 */
        placement = createPlacementController({
            scene,
            renderer,
            camera: camera.camera,
            plate,
            gridSize: GRID_SIZE_M,

            onGridSelected({ gridX, gridZ }) {
                onObjectSelected?.({ gridX, gridZ });
            },
            onGridHovered({ gridX, gridZ }) {
                onGridHoveredCallback?.({ gridX, gridZ });
            }
        });

        /* 벽 도구 객체 생성하기 */
        wallTool = createWallTool({
            scene,
            gridSize: GRID_SIZE_M
        });

        /* 플랫폼 도구 객체 생성하기 */
        platformTool = createPlatformTool({
            scene,
            gridSize: GRID_SIZE_M
        });

        setupLights();
    }

    /* ===== 위임 함수들 ===== */

    /* 실시간 */
    function update(land){

    }

    /* 레이케스팅 된 오브젝트 설정 */
    function setOnObjectSelected(callback) {
        onObjectSelected = callback;
    }

    /* 실시간 좌표 추적기 */
    function setOnGridHovered(callback) {
        onGridHoveredCallback = callback;
    }

    /* 하나를 제외한 도구를 숨기는 함수 */
    function hideToolCursors(activeToolId) {
        for(const [toolId, hide] of Object.entries(hideTools)){
            if( activeToolId !== toolId){
                hide();
            }
        }
    }


    /* 벽 도구 호출 함수들 */
    function updateWallHover(gridX, gridZ) {
        wallTool?.updateHoverPoint(gridX, gridZ);
    }

    function confirmWallPoint(gridX, gridZ) {
        return wallTool?.confirmPoint(gridX, gridZ);
    }

    
    /* 플랫폼 도구 호출 함수들 */
    function updatePlatformHover(gridX, gridZ){
        platformTool?.updateHoverPoint(gridX, gridZ);
    }

    function confirmPlatformPoint(gridX, gridZ){
        return platformTool?.confirmPoint(gridX, gridZ);
    }



    /* 오브젝트 배치 함수 */
    function placeObject(assetId, gridX, gridZ){
        return placement?.placeObject(assetId, gridX, gridZ);
    }

    /* 실시간 연산 함수 */
    function draw(){
        const center = new THREE.Vector3(LAND_SIZE_M / 2, 0, LAND_SIZE_M / 2);
        const cameraDistance = camera.camera.position.distanceTo(center);
        grid?.updateOpacity(cameraDistance);
        
        renderer.render(scene, camera.camera);
    }

    function start(){
        renderer.setAnimationLoop(draw);
    }

    function stop(){
        renderer.setAnimationLoop(null);
    }

    function onMouseDown(event){
        camera.onMouseDown(event);
        placement.onMouseDown(event);
    }

    function onMouseUp(event){
        camera.onMouseUp(event);
    }

    function onMouseMove(event){
        camera.onMouseMove(event);
        placement.onMouseMove(event);
    }

    function onWheel(event){
        event.preventDefault();
        camera.onWheel(event);     
    }

    function setupLights(){
        const sun = new THREE.DirectionalLight(0xffffff, 1);
        
        sun.position.set(20, 20, 20);
        sun.castShadow = true;

        sun.shadow.camera.left = -16;
        sun.shadow.camera.right = 16;
        sun.shadow.camera.top = 16;
        sun.shadow.camera.bottom = -16;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 50;

        sun.shadow.camera.updateProjectionMatrix();

        scene.add(sun);
        scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    }

    return {
        initialize,
        update,
        start,
        stop,
        setOnObjectSelected,
        setOnGridHovered,
        hideToolCursors,
        placeObject,
        onMouseDown,
        onMouseUp,
        onMouseMove,
        onWheel,
        updateWallHover,
        confirmWallPoint,
        updatePlatformHover,
        confirmPlatformPoint
    }
}