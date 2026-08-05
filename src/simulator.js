import { createScene } from "./scene.js";
import { createLand } from "./land.js";

export function createSimulator(){
    let activeToolId = '';

    const scene = createScene();
    const land = createLand(1);

    scene.initialize(land);

    /* 선택된 오브젝트 건설하기 */
    scene.setOnObjectSelected(({ gridX, gridZ }) => {
        // scene.placeObject(activeToolId, gridX, gridZ);
    });

    /* 좌표 추적하기 */
    scene.setOnGridHovered(({ gridX, gridZ }) => {
        if (activeToolId !== 'wall'){
            scene.hideWallCursor();
            return;
        } 

        scene.updateWallCursor(gridX, gridZ);
        console.log('벽 Grid:', gridX, gridZ);
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