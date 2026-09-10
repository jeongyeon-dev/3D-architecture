import * as THREE from 'three';

/* 삼각형(박공지붕) geometry 생성 함수 */
export function createPrismGeometry() {
    const positions = [];
    const indices = [];

    function addTriangle(a, b, c) {
        const offset = positions.length / 3;

        positions.push(
            a.x, a.y, a.z,
            b.x, b.y, b.z,
            c.x, c.y, c.z
        );

        indices.push(
            offset,
            offset + 1,
            offset + 2
        );
    }

    addTriangle(
        { x: -0.5, y: 0, z: -0.5 },
        { x:  0.0, y: 1, z: -0.5 },
        { x:  0.5, y: 0, z: -0.5 }
    );

    addTriangle(
        { x: -0.5, y: 0, z: 0.5 },
        { x:  0.5, y: 0, z: 0.5 },
        { x:  0.0, y: 1, z: 0.5 }
    );

    addTriangle(
        { x: -0.5, y: 0, z: -0.5 },
        { x:  0.0, y: 1, z:  0.5 },
        { x:  0.0, y: 1, z: -0.5 }
    );

    addTriangle(
        { x: -0.5, y: 0, z: -0.5 },
        { x: -0.5, y: 0, z:  0.5 },
        { x:  0.0, y: 1, z:  0.5 }
    );

    addTriangle(
        { x: 0.5, y: 0, z: -0.5 },
        { x: 0.0, y: 1, z:  0.5 },
        { x: 0.5, y: 0, z:  0.5 }
    );

    addTriangle(
        { x: 0.5, y: 0, z: -0.5 },
        { x: 0.0, y: 1, z: -0.5 },
        { x: 0.0, y: 1, z:  0.5 }
    );

    addTriangle(
        { x: -0.5, y: 0, z: -0.5 },
        { x:  0.5, y: 0, z:  0.5 },
        { x: -0.5, y: 0, z:  0.5 }
    );

    addTriangle(
        { x: -0.5, y: 0, z: -0.5 },
        { x:  0.5, y: 0, z: -0.5 },
        { x:  0.5, y: 0, z:  0.5 }
    );

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
    );

    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}


/* 창문을 생성하는 geometry */
export function createWindowGroupGeometry(
    width = 1.2,
    height = 1.5,
    frameThickness = 0.1,
    depth = 0.1
) {
    const pane = new THREE.BoxGeometry(
        width - frameThickness * 2,
        height - frameThickness * 2,
        depth
    );

    const top = new THREE.BoxGeometry(
        width,
        frameThickness,
        depth
    );

    const bottom = new THREE.BoxGeometry(
        width,
        frameThickness,
        depth
    );

    const left = new THREE.BoxGeometry(
        frameThickness,
        height - frameThickness * 2,
        depth
    );

    const right = new THREE.BoxGeometry(
        frameThickness,
        height - frameThickness * 2,
        depth
    );

    return {
        pane,
        top,
        bottom,
        left,
        right
    };
}