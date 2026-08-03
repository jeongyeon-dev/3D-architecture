import * as THREE from 'three';
import { createCamera } from './camera.js';

export function createScene(){
    /* 화면 생성 + 카메라 불러오기 */
    const gameWindow = document.getElementById('render-target');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x777777);

    const camera = createCamera(gameWindow);

    /* 화면 그려주는 객체(renderer) 자체 */
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
    gameWindow.appendChild(renderer.domElement);


    let meshes = [];

    /* 땅 지형 초기화 */
    function initialize(land){
        scene.clear();
        meshes = [];

        /* 카메라 위치 설정 */
        const center = (land.size - 1) / 2;
        camera.setOrigin(center, 0, center);

        for(let x = 0; x < land.size; x++){
            const column = [];
            for(let y = 0; y < land.size; y++){
                /* 해당 x, y 좌표에 적절한 mesh를 놓고 => scene, meshes에 넣어야 함 */
                const geomotry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshLambertMaterial({color: 0x00aa00});
                const mesh = new THREE.Mesh(geomotry, material);
                mesh.position.set(x, 0, y);
                
                scene.add(mesh);
                column.push(mesh);
            }
            meshes.push(column);
        }

        setupLights();
    }

    function draw(){
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
    }

    function onMouseUp(event){
        camera.onMouseUp(event);
    }

    function onMouseMove(event){
        camera.onMouseMove(event);
    }

    function setupLights(){
        const lights = [
            new THREE.AmbientLight(0xffffff, 0.2),
            new THREE.DirectionalLight(0xffffff, 0.3),
            new THREE.DirectionalLight(0xffffff, 0.3),
            new THREE.DirectionalLight(0xffffff, 0.3)
        ];

        lights[1].position.set(0, 1, 0);
        lights[2].position.set(1, 1, 0);
        lights[3].position.set(0, 1, 1);

        scene.add(...lights);
    }

    return {
        initialize,
        start,
        stop,
        onMouseDown,
        onMouseUp,
        onMouseMove
    }
}