import { WALL_THICKNESS } from '../../config.js';

/* 최종 반환값 형태는 다음과 같다:
   [
       {
           wallId: '벽 ID',

           startLeft:  { x, z },
           startRight: { x, z },

           endLeft:    { x, z },
           endRight:   { x, z }
       }
   ] */
export function calculateMiterWalls(
    wallDataList,
    gridSize
) {
    const wallThickness = WALL_THICKNESS;

    /* 계산된 좌표를 반환하는 빈 객체 */
    const calculatedWalls = [];

    if (wallDataList.length === 0) {
        return calculatedWalls;
    }

    /* 벽 둘래가 닫혀 있다면? => 각 끝의 벽들도 접하고 있음 */
    const firstWall = wallDataList[0];
    const lastWall = wallDataList.at(-1);

    const isClosed = isSamePoint(
        firstWall.startPoint,
        lastWall.endPoint
    );
    
    /* 순회하면서 각각 계산 */
    for (let index = 0; index < wallDataList.length; index++) {
        const wallData = wallDataList[index];

        let previousWall;
        let nextWall;

        if (index > 0) {
            previousWall = wallDataList[index - 1];
        } else if (isClosed) {
            previousWall = lastWall;
        }

        if (index < wallDataList.length - 1) {
            nextWall = wallDataList[index + 1];
        } else if (isClosed) {
            nextWall = firstWall;
        }

        const startJoin = previousWall
            ? calculateMiterJoin(
                previousWall,
                wallData,
                wallData.startPoint,
                gridSize,
                wallThickness
            )
            : calculateStraightEnd(
                wallData,
                wallData.startPoint,
                gridSize,
                wallThickness
            );

        const endJoin = nextWall
            ? calculateMiterJoin(
                wallData,
                nextWall,
                wallData.endPoint,
                gridSize,
                wallThickness
            )
            : calculateStraightEnd(
                wallData,
                wallData.endPoint,
                gridSize,
                wallThickness
            );

        /* 계산된 한 벽의 좌표 객체를 push */
        const calculatedWall = {
            wallId: wallData.id,

            startLeft: startJoin.leftPoint,
            startRight: startJoin.rightPoint,

            endLeft: endJoin.leftPoint,
            endRight: endJoin.rightPoint
        };

        calculatedWalls.push(calculatedWall);
    }

    return calculatedWalls;
}


/* 보조 함수들 */
function calculateStraightEnd(
    wallData,
    point,
    gridSize,
    wallThickness
) {
    const direction = getWallDirection(
        wallData,
        gridSize
    );

    const normal = getWallNormal(direction);
    const halfThickness = wallThickness / 2;

    const worldPoint = {
        x: point.gridX * gridSize,
        z: point.gridZ * gridSize
    };

    return {
        leftPoint: {
            x: worldPoint.x + normal.x * halfThickness,
            z: worldPoint.z + normal.z * halfThickness
        },

        rightPoint: {
            x: worldPoint.x - normal.x * halfThickness,
            z: worldPoint.z - normal.z * halfThickness
        }
    };
}

/* 두 벽 간의 교차점을 구하는 함수 */
function calculateMiterJoin(
    wallA,
    wallB,
    jointPoint,
    gridSize,
    wallThickness
) {
    const halfThickness = wallThickness / 2;

    const directionA = getWallDirection(wallA, gridSize);
    const directionB = getWallDirection(wallB, gridSize);

    const normalA = getWallNormal(directionA);
    const normalB = getWallNormal(directionB);

    const jointWorld = {
        x: jointPoint.gridX * gridSize,
        z: jointPoint.gridZ * gridSize
    };

    const leftLineA = {
        x: jointWorld.x + normalA.x * halfThickness,
        z: jointWorld.z + normalA.z * halfThickness
    };

    const leftLineB = {
        x: jointWorld.x + normalB.x * halfThickness,
        z: jointWorld.z + normalB.z * halfThickness
    };

    const rightLineA = {
        x: jointWorld.x - normalA.x * halfThickness,
        z: jointWorld.z - normalA.z * halfThickness
    };

    const rightLineB = {
        x: jointWorld.x - normalB.x * halfThickness,
        z: jointWorld.z - normalB.z * halfThickness
    };

    const leftPoint = intersectLines(
        leftLineA,
        directionA,
        leftLineB,
        directionB
    );

    const rightPoint = intersectLines(
        rightLineA,
        directionA,
        rightLineB,
        directionB
    );

    /* 두 벽이 직선이라면? => 교차점 없음 */
    if (!leftPoint || !rightPoint) {
        return {
            leftPoint: leftLineA,
            rightPoint: rightLineA
        };
    }

    return {
        leftPoint,
        rightPoint
    };
}

function intersectLines(
    pointA,
    directionA,
    pointB,
    directionB
) {
    const denominator =
        directionA.x * directionB.z -
        directionA.z * directionB.x;

    if (Math.abs(denominator) < 0.000001) {
        return undefined;
    }

    const differenceX = pointB.x - pointA.x;
    const differenceZ = pointB.z - pointA.z;

    const distance =
        (
            differenceX * directionB.z -
            differenceZ * directionB.x
        ) / denominator;

    return {
        x: pointA.x + directionA.x * distance,
        z: pointA.z + directionA.z * distance
    };
}

function getWallDirection(wallData, gridSize) {
    const dx =
        (wallData.endPoint.gridX -
         wallData.startPoint.gridX) * gridSize;

    const dz =
        (wallData.endPoint.gridZ -
         wallData.startPoint.gridZ) * gridSize;

    const length = Math.hypot(dx, dz);

    if (length === 0) {
        throw new Error('길이가 0인 벽입니다.');
    }

    return {
        x: dx / length,
        z: dz / length
    };
}

function getWallNormal(direction) {
    return {
        x: -direction.z,
        z: direction.x
    };
}

function isSamePoint(pointA, pointB) {
    return (
        pointA.gridX === pointB.gridX &&
        pointA.gridZ === pointB.gridZ
    );
}
