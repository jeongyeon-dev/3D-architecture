import { createScene } from "./scene.js";
import { createLand } from "./components/land.js";

export function createSimulator({
    projectObjects = [],
    onCursorGridChange,
} = {}) {
    /* 가변 속성 */
    let activeToolId = '';
    let previousGridPosition = null;

    /* 생성 => 초기화 */
    const scene = createScene();
    scene.initialize(projectObjects);

    const land = createLand(1);

    /* 좌표 추적하기 */
    scene.setOnGridHovered(({ gridX, gridZ, gridY, object, normal }) => {
        /* 좌표를 소켓에 보내는 로직 부분: 다를 경우에만 전송.. 콜백 */
        const position = { gridX, gridZ, gridY };
        const isSamePosition =
            previousGridPosition?.gridX === gridX &&
            previousGridPosition?.gridZ === gridZ &&
            previousGridPosition?.gridY === gridY;

        if(!isSamePosition) {
            previousGridPosition = position;
            onCursorGridChange?.(position);
        }

        
        scene.hideToolCursors(activeToolId);
        switch(activeToolId){
            case 'wall':
                scene.updateWallHover(gridX, gridZ, gridY); 
                break;
            case 'platform':
                scene.updatePlatformHover(gridX, gridZ);
                break;
            case 'floor':
                scene.updateFloorHover(gridX, gridZ, gridY);
                break;
            case 'roof':
                scene.updateRoofHover(gridX, gridZ, gridY);
                break;
            case 'window':
                scene.updateWindowHover(gridX, gridZ, gridY, object, normal);
                break;
            case 'editor':
                scene.updateEditorHover(gridX, gridZ, gridY, object);
                break;
            default:
                return;
        }        
    });
    
    /* 좌표 클릭 시 */
    scene.setOnObjectSelected(({ gridX, gridZ, gridY, object }) => {
        let result;

        switch (activeToolId) {
            case 'wall':
                result = scene.confirmWallPoint(gridX, gridZ, gridY);
                break;
            case 'platform':
                result = scene.confirmPlatformPoint(gridX, gridZ);
                break;
            case 'floor':
                result = scene.confirmFloorPoint(gridX, gridZ, gridY);
                break;
            case 'roof':
                result = scene.confirmRoofPoint(gridX, gridZ, gridY);
                break;
            case 'window':
                result = scene.confirmWindowPoint(gridX, gridZ, gridY, object);
                break;
            case 'editor':
                result = scene.confirmEditorPoint(gridX, gridZ, gridY, object);
                break;
            default:
                return;
        }

        /* 종료 되었을 경우 생성 중지하기 */
        if (result?.finished) {
            activeToolId = '';
            scene.hideToolCursors();
        }
    });

    document.addEventListener('mousedown', scene.onMouseDown.bind(scene), false);
    document.addEventListener('mouseup', scene.onMouseUp.bind(scene), false);
    document.addEventListener('mousemove', scene.onMouseMove, false);
    document.addEventListener('wheel', scene.onWheel, { passive: false });
    document.addEventListener('contextmenu', (event) => event.preventDefault(), false);

    /* 시뮬레이터(반환 객체)에 각종 기능 삽입 */
    const simulator = {
        threeScene: scene.threeScene,
        update(){
            // land.update();
            // scene.update(land);
        },
        setActiveToolId(toolId){
            activeToolId = toolId;
            scene.setRaycastTarget(toolId);
        },
        setFloor(floor) {
            scene.setFloor(floor);
        },

        /* 상대 커서 받아서 처리하는 곳 */
        updateRemoteCursor(message) {
            scene.updateRemoteCursor(message);
        },
        addRemoteCursor(message) {
            scene.addRemoteCursor(message);
        },        
        removeRemoteCursor(message) {
            scene.removeRemoteCursor(message);
        }
    }

    setInterval(() => {
        simulator.update();
    }, 1000)

    scene.start();

    return simulator;
}