import * as THREE from 'three';

export function clipGrid(grid, polygons){
    for(const eachGrid of grid.children){
        const position = eachGrid.geometry.getAttribute('position');
        const positions = [];
        const distances = [];

        for (let i = 0; i < position.count; i += 2) {
            /* 선분 좌표만 가져옴 */
            const start = {
                x: position.getX(i) + grid.position.x,
                z: position.getZ(i) + grid.position.z
            };

            const end = {
                x: position.getX(i + 1) + grid.position.x,
                z: position.getZ(i + 1) + grid.position.z
            };

            for (const polygon of polygons) {
                /* 각 도형(polygon)과 선분과의 내부 구간 */
                const segments =
                    clipSegmentToPolygon(start, end, polygon);

                const lineLength = Math.hypot(
                    end.x - start.x,
                    end.z - start.z
                );

                /* 내부 구간을 점으로 정보 저장하기 */
                for (const segment of segments) {
                    positions.push(
                        segment.start.x - grid.position.x,
                        position.getY(i),
                        segment.start.z - grid.position.z,

                        segment.end.x - grid.position.x,
                        position.getY(i + 1),
                        segment.end.z - grid.position.z
                    );

                    distances.push(
                        lineLength * segment.startT,
                        lineLength * segment.endT
                    );
                }
            }
        }

        eachGrid.geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
        );

        eachGrid.geometry.setAttribute(
            'lineDistance',
            new THREE.Float32BufferAttribute(distances, 1)
        );

        eachGrid.geometry.computeBoundingSphere();
    }
}

function clipSegmentToPolygon(start, end, polygon) {
    const values = [0, 1];

    for (let i = 0; i < polygon.length; i++) {
        const edgeStart = polygon[i];
        const edgeEnd = polygon[(i + 1) % polygon.length];

        const t = getIntersectionT(
            start,
            end,
            edgeStart,
            edgeEnd
        );

        if (t !== null) {
            values.push(t);
        }
    }

    const sortedValues = values
        .sort((a, b) => a - b)
        .filter((value, index, array) =>
            index === 0 ||
            Math.abs(value - array[index - 1]) > 0.000001
        );

    const segments = [];

    for (let i = 0; i < sortedValues.length - 1; i++) {
        const startT = sortedValues[i];
        const endT = sortedValues[i + 1];
        const middle =
            getPointOnSegment(start, end, (startT + endT) / 2);

        if (!containsPoint(middle, polygon)) {
            continue;
        }

        segments.push({
            start: getPointOnSegment(start, end, startT),
            end: getPointOnSegment(start, end, endT),
            startT,
            endT
        });
    }

    return segments;
}


function getIntersectionT(a, b, c, d) {
    const abX = b.x - a.x;
    const abZ = b.z - a.z;

    const cdX = d.x - c.x;
    const cdZ = d.z - c.z;

    const denominator = abX * cdZ - abZ * cdX;

    if (Math.abs(denominator) < 0.000001) {
        return null;
    }

    const acX = c.x - a.x;
    const acZ = c.z - a.z;

    const t = (acX * cdZ - acZ * cdX) / denominator;
    const u = (acX * abZ - acZ * abX) / denominator;

    if (t < 0 || t > 1 || u < 0 || u > 1) {
        return null;
    }

    return t;
}


function getPointOnSegment(start, end, t) {
    return {
        x: start.x + (end.x - start.x) * t,
        z: start.z + (end.z - start.z) * t
    };
}

function containsPoint(point, polygon) {
    let inside = false;

    for (let i = 0, j = polygon.length - 1;
        i < polygon.length;
        j = i++) {

        const a = polygon[i];
        const b = polygon[j];

    const intersect =
        ((a.z > point.z) !== (b.z > point.z)) &&
        (point.x <
            (b.x - a.x) *
            (point.z - a.z) /
            (b.z - a.z) +
            a.x);

        if (intersect) {
            inside = !inside;
        }
    }

    return inside;
} 