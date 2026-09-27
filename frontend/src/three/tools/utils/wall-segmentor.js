import { WALL_HEIGHT, WALL_THICKNESS } from '../../config.js';
import {
    createMiterWallSegmentGeometry
} from '../../assets/util/geometry-calculator.js';

export function splitWallByWindow(
    wallData,
    gridX,
    gridZ,
    gridY,
    gridSize,
    windowWidth,
    windowHeight
) {
    const wallStart = {
        x: (wallData.startLeft.x + wallData.startRight.x) / 2,
        z: (wallData.startLeft.z + wallData.startRight.z) / 2
    };
    const wallEnd = {
        x: (wallData.endLeft.x + wallData.endRight.x) / 2,
        z: (wallData.endLeft.z + wallData.endRight.z) / 2
    };
    const wallBaseY = wallData.baseY;
    const wallHeight = wallData.height ?? WALL_HEIGHT;
    const wallTopY = wallBaseY + wallHeight;
    const directionX = wallEnd.x - wallStart.x;
    const directionZ = wallEnd.z - wallStart.z;
    const wallLength = Math.hypot(directionX, directionZ);

    if (wallLength === 0) {
        throw new Error('길이가 0인 벽은 창문으로 분할할 수 없습니다.');
    }

    const unitX = directionX / wallLength;
    const unitZ = directionZ / wallLength;
    const cursorX = gridX * gridSize;
    const cursorZ = gridZ * gridSize;
    const cursorDistance =
        (cursorX - wallStart.x) * unitX +
        (cursorZ - wallStart.z) * unitZ;
    const halfWidth = windowWidth / 2;
    const windowCenterDistance = Math.max(
        halfWidth,
        Math.min(cursorDistance, wallLength - halfWidth)
    );

    const normalX = -unitZ;
    const normalZ = unitX;
    const halfThickness = WALL_THICKNESS / 2;
    const windowStart = {
        x: wallStart.x + unitX * (windowCenterDistance - halfWidth),
        z: wallStart.z + unitZ * (windowCenterDistance - halfWidth)
    };
    const windowEnd = {
        x: wallStart.x + unitX * (windowCenterDistance + halfWidth),
        z: wallStart.z + unitZ * (windowCenterDistance + halfWidth)
    };
    const windowStartLeft = {
        x: windowStart.x + normalX * halfThickness,
        z: windowStart.z + normalZ * halfThickness
    };
    const windowStartRight = {
        x: windowStart.x - normalX * halfThickness,
        z: windowStart.z - normalZ * halfThickness
    };
    const windowEndLeft = {
        x: windowEnd.x + normalX * halfThickness,
        z: windowEnd.z + normalZ * halfThickness
    };
    const windowEndRight = {
        x: windowEnd.x - normalX * halfThickness,
        z: windowEnd.z - normalZ * halfThickness
    };

    const windowBottomY = Math.max(
        wallBaseY,
        Math.min(gridY * 0.1, wallTopY - windowHeight)
    );
    const windowTopY = windowBottomY + windowHeight;

    return {
        leftWall: {
            type: 'miter-segment',
            startLeft: wallData.startLeft,
            startRight: wallData.startRight,
            endLeft: windowStartLeft,
            endRight: windowStartRight,
            baseY: wallBaseY,
            height: wallHeight
        },
        rightWall: {
            type: 'miter-segment',
            startLeft: windowEndLeft,
            startRight: windowEndRight,
            endLeft: wallData.endLeft,
            endRight: wallData.endRight,
            baseY: wallBaseY,
            height: wallHeight
        },
        bottomWall: {
            type: 'wall-segment',
            startLeft: windowStartLeft,
            startRight: windowStartRight,
            endLeft: windowEndLeft,
            endRight: windowEndRight,
            baseY: wallBaseY,
            height: windowBottomY - wallBaseY
        },
        topWall: {
            type: 'wall-segment',
            startLeft: windowStartLeft,
            startRight: windowStartRight,
            endLeft: windowEndLeft,
            endRight: windowEndRight,
            baseY: windowTopY,
            height: wallTopY - windowTopY
        }
    };
}

export function updateMiterWallSegmentMesh(mesh, segmentData) {
    const nextGeometry = createMiterWallSegmentGeometry(segmentData);

    mesh.geometry.dispose();
    mesh.geometry = nextGeometry;
    mesh.visible = true;
}

export function updateWallSegmentMesh(mesh, segmentData) {
    const {
        startLeft, startRight,
        endLeft, endRight,
        baseY, height
    } = segmentData;
    const start = {
        x: (startLeft.x + startRight.x) / 2,
        z: (startLeft.z + startRight.z) / 2
    };
    const end = {
        x: (endLeft.x + endRight.x) / 2,
        z: (endLeft.z + endRight.z) / 2
    };
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const wallLength = Math.hypot(dx, dz);

    if (wallLength <= 0 || height <= 0) {
        mesh.visible = false;
        return;
    }

    mesh.position.set(
        (start.x + end.x) / 2,
        baseY + height / 2,
        (start.z + end.z) / 2
    );
    mesh.scale.set(wallLength, height, 1);
    mesh.rotation.set(0, -Math.atan2(dz, dx), 0);
    mesh.visible = true;
}
