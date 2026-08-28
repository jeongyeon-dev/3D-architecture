import { loadFloor } from "../tools/floor-tool.js";
import { loadPlatform } from "../tools/platform-tool.js";
import { loadWall, loadWallData } from "../tools/wall-tool.js";

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
                loadWall(scene, object.data);
            case "wall-data":
                loadWallData(object.data);
                break;
            default:
                break;
        }
    }
}