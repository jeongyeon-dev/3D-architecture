import { createScene } from "./scene.js";
import { createLand } from "./components/land.js";

export function createSimulator({ projectObjects = [] } = {}){
    let activeToolId = '';

    const scene = createScene();
    const land = createLand(1);

    scene.initialize(projectObjects);

    /* 좌표 추적하기 */
    scene.setOnGridHovered(({ gridX, gridZ, gridY }) => {
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
            default:
                return;
        }        
    });
    
    /* 좌표 클릭 시 */
    scene.setOnObjectSelected(({ gridX, gridZ, gridY }) => {
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
        }
    }

    setInterval(() => {
        simulator.update();
    }, 1000)

    scene.start();

    return simulator;
}