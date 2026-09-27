import { loadFloor } from "../tools/floor-tool.js";
import { loadPlatform } from "../tools/platform-tool.js";
import { loadWall, loadWallData } from "../tools/wall-tool.js";
import { loadRoof } from "../tools/roof-tool.js";
import { loadWindow } from "../tools/window-tool.js";

export function loadProject(objects, scene) {
    if (!Array.isArray(objects)) {
        return;
    }

    for (const object of objects) {
        switch (object.type) {
            case "floor":
                loadFloor(scene, object.data);
                break;
            case "platform":
                loadPlatform(scene, object.data);
                break;
            case "wall-face":
                const { windows } = loadWall(scene, object);

                /* 창문이 있을 경우 창문 불러오기를 진행한다 */
                if (windows.length > 0) {
                    loadWindow(scene, windows);
                }
                break;
            case "roof":
                loadRoof(scene, object.data);
                break;
            case "wall-data":
                loadWallData(object.data);
                break;
            default:
                break;
        }
    }
}