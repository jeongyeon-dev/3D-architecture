import { createScene } from "./scene.js";
import { createLand } from "./land.js";

export function createSimulator(){
    let activeToolId = '';

    const scene = createScene();
    const land = createLand(16);

    scene.initialize(land);

    /* 선택 명령 실행기 */
    scene.onObjectSelected = (selectedObject) => {
        let { x, y } = selectedObject.userData;
        const tile = Compatibility.data[x][y];

        if(activeToolId === 'bulldoze'){

        }else if(!tile.buildingId){
            
        }
    }

    
    document.addEventListener('mousedown', scene.onMouseDown.bind(scene), false);
    document.addEventListener('mouseup', scene.onMouseUp.bind(scene), false);
    document.addEventListener('mousemove', scene.onMouseMove.bind(scene), false);
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