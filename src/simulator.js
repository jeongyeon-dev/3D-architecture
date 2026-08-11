import { createScene } from "./scene.js";
import { createLand } from "./land.js";

export function createSimulator(){
    let activeToolId = '';

    const scene = createScene();
    const land = createLand(1);

    scene.initialize(land);

    /* 좌표 추적하기 */
    scene.setOnGridHovered(({ gridX, gridZ }) => {
        scene.hideToolCursors(activeToolId);
        
        if(activeToolId == 'wall'){
            scene.updateWallHover(gridX, gridZ);       
            console.log('벽 Grid:', gridX, gridZ);
        }

        if(activeToolId == 'platform'){
            scene.updatePlatformHover(gridX, gridZ);
            console.log('플랫폼 Grid ', gridX, gridZ);
        }

    });
    
    /* 좌표 클릭 시 */
    scene.setOnObjectSelected(({ gridX, gridZ }) => {
        let result;

        if(activeToolId == 'wall'){
            result = scene.confirmWallPoint(gridX, gridZ);
        }

        if(activeToolId == 'platform'){
            result = scene.confirmPlatformPoint(gridX, gridZ);
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
        update(){
            // land.update();
            // scene.update(land);
        },
        setActiveToolId(toolId){
            activeToolId = toolId;
            console.log(activeToolId);
        }
    }

    setInterval(() => {
        simulator.update();
    }, 1000)

    scene.start();

    return simulator;
}