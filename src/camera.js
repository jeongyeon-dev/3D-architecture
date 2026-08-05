import * as THREE from 'three';

export function createCamera(gameWindow){
    const DEG2RAD = Math.PI / 180.0;

    const LEFT_MOUSE_BUTTON = 0;
    const MIDDLE_MOUSE_BUTTON = 1;
    const RIGHT_MOUSE_BUTTON = 2;

    const MIN_CAMERA_RADIUS = 5;
    const MAX_CAMERA_RADIUS = 30;
    
    const MIN_CAMERA_ELEVATION = 0;
    const MAX_CAMERA_ELEVATION = 89;

    const ROTATION_SENSITIVITY = 0.5;
    const ZOOM_SENSITIVITY = 0.02;
    const WHEEL_ZOOM_SENSITIVITY = 0.01;
    const PAN_SENSITIVITY = -0.01;

    const Y_AXIS = new THREE.Vector3(0, 1, 0);
   
    /* 카메라 초기 설정 */
    const camera = new THREE.PerspectiveCamera(75, gameWindow.offsetWidth / gameWindow.offsetHeight, 0.1, 1000);
    
    /* 카메라 관련 초기 변수들 */
    let cameraOrigin = new THREE.Vector3();

    let cameraRadius = (MIN_CAMERA_RADIUS + MAX_CAMERA_RADIUS) / 2;
    let cameraAzimuth = 135;
    let cameraElevation = 45;

    let isLeftMouseDown = false;
    let isMiddleMouseDown = false;
    let isRightMouseDown = false;

    let prevMouseX = 0;
    let prevMouseY = 0;
    
    updateCameraPosition();

    /* 마우스 event로 카메라를 이동하는 함수들 */
    function onMouseDown(event){    
        if(event.button === LEFT_MOUSE_BUTTON){
            isLeftMouseDown = true;
        }
        if(event.button === MIDDLE_MOUSE_BUTTON){
            isMiddleMouseDown = true;
        }
        if(event.button === RIGHT_MOUSE_BUTTON){
            isRightMouseDown = true;
        }
    }

    function onMouseUp(event){
        if(event.button === LEFT_MOUSE_BUTTON){
            isLeftMouseDown = false;
        }
        if(event.button === MIDDLE_MOUSE_BUTTON){
            isMiddleMouseDown = false;
        }
        if(event.button === RIGHT_MOUSE_BUTTON){
            isRightMouseDown = false;
        }
    }

    function onMouseMove(event){
        /* 공통 변수 */
        const deltaX = event.clientX - prevMouseX;
        const deltaY = event.clientY - prevMouseY;

        /* 카메라 회전 */
        if(isLeftMouseDown){
            cameraAzimuth += -(deltaX * ROTATION_SENSITIVITY);
            cameraElevation += (deltaY * ROTATION_SENSITIVITY);
            cameraElevation = Math.min(MAX_CAMERA_ELEVATION, Math.max(MIN_CAMERA_ELEVATION, cameraElevation));
            updateCameraPosition();
        }

        /* 안 쓰는 녀석 */
        if(isMiddleMouseDown){

        }

        /* 카메라 줌아웃 */
        if(isRightMouseDown){
            const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(Y_AXIS, cameraAzimuth * DEG2RAD);
            const left = new THREE.Vector3(1, 0, 0).applyAxisAngle(Y_AXIS, cameraAzimuth * DEG2RAD);
            
            cameraOrigin.add(forward.multiplyScalar(PAN_SENSITIVITY * deltaY));
            cameraOrigin.add(left.multiplyScalar(PAN_SENSITIVITY * deltaX));
            updateCameraPosition();
        }

        /* 원점 기준 변경 */
        prevMouseX = event.clientX;
        prevMouseY = event.clientY;
    }

    /* 카메라 줌 인아웃 */
    function onWheel(event){
        cameraRadius += event.deltaY * WHEEL_ZOOM_SENSITIVITY;
        cameraRadius = Math.min(MAX_CAMERA_RADIUS, Math.max(MIN_CAMERA_RADIUS, cameraRadius));
        updateCameraPosition();
    }
    
    /* 카메라 위치 변경 함수 */
    function updateCameraPosition(){
        camera.position.x = cameraRadius * Math.sin(cameraAzimuth * DEG2RAD) * Math.cos(cameraElevation * DEG2RAD);
        camera.position.y = cameraRadius * Math.sin(cameraElevation * DEG2RAD);
        camera.position.z = cameraRadius * Math.cos(cameraAzimuth * DEG2RAD) * Math.cos(cameraElevation * DEG2RAD);
        
        camera.position.add(cameraOrigin);      
        camera.lookAt(cameraOrigin);
        camera.updateMatrix();
    }

    /* 카메라 위치 설정 */
    function setOrigin(x, y, z) {
        cameraOrigin.set(x, y, z);
        updateCameraPosition();
    }

    return {
        camera,
        setOrigin,
        onMouseDown,
        onMouseUp,
        onMouseMove,
        onWheel
    }
}