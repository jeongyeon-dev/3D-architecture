import * as THREE from 'three';
import { WALL_HEIGHT } from '../config.js';

const wallGeometry = new THREE.BufferGeometry();

const assets = {
    'wall-face': (wallData) => {
        const material = new THREE.MeshStandardMaterial({ 
            color: '#e8e8e8',
            roughness: 0.85,
            metalness: 0
        });
        const geometry = createWallGeometry(wallData);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.userData = { id: 'wall-face' };
        return mesh;
    }
}

export function createStructureInstance(assetId, wallData) {
    return assets[assetId](wallData);
}

/* geometry 계산 함수 */
function createWallGeometry(wallData) {
    const {
        startLeft,
        startRight,
        endLeft,
        endRight
    } = wallData;

    const positions = [];
    const uvs = [];
    const indices = [];

    function addQuad(a, b, c, d) {
        const offset = positions.length / 3;

        positions.push(
            a.x, a.y, a.z,
            b.x, b.y, b.z,
            c.x, c.y, c.z,
            d.x, d.y, d.z
        );

        uvs.push(
            0, 0,
            1, 0,
            1, 1,
            0, 1
        );

        indices.push(
            offset, offset + 1, offset + 2,
            offset, offset + 2, offset + 3
        );
    }

    const SL0 = { x: startLeft.x,  y: 0,      z: startLeft.z };
    const SR0 = { x: startRight.x, y: 0,      z: startRight.z };
    const EL0 = { x: endLeft.x,    y: 0,      z: endLeft.z };
    const ER0 = { x: endRight.x,   y: 0,      z: endRight.z };

    const SLH = { x: startLeft.x,  y: WALL_HEIGHT, z: startLeft.z };
    const SRH = { x: startRight.x, y: WALL_HEIGHT, z: startRight.z };
    const ELH = { x: endLeft.x,    y: WALL_HEIGHT, z: endLeft.z };
    const ERH = { x: endRight.x,   y: WALL_HEIGHT, z: endRight.z };

    addQuad(SL0, EL0, ELH, SLH);
    addQuad(ER0, SR0, SRH, ERH);

    addQuad(SR0, SL0, SLH, SRH);
    addQuad(EL0, ER0, ERH, ELH);

    addQuad(SLH, ELH, ERH, SRH);
    addQuad(SL0, SR0, ER0, EL0);

    

    wallGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
    );

    wallGeometry.setAttribute(
        'uv',
        new THREE.Float32BufferAttribute(uvs, 2)
    );

    wallGeometry.setIndex(indices);
    wallGeometry.computeVertexNormals();

    return wallGeometry;
}
