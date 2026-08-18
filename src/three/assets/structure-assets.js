import * as THREE from 'three';
import { GRID_SIZE_M, WALL_HEIGHT, PLATFORM_HEIGHT, FLOOR_THICKENSS } from '../config.js';

const platformCubeGeometry = new THREE.BoxGeometry(1, PLATFORM_HEIGHT, 1);

const assets = {
    'wall-face': (wallData) => {
        const material = new THREE.MeshStandardMaterial({ 
            color: '#f1f1f1',
            roughness: 0.85,
            metalness: 0.1
        });
        const geometry = createWallGeometry(wallData);
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { id: 'wall-face' };
        return mesh;
    },
    'platform-cube': () => {
        const material = new THREE.MeshStandardMaterial({ 
            color: '#a0a0a0',
            roughness: 0.85,
            metalness: 0.1
        });
        const mesh = new THREE.Mesh(platformCubeGeometry, material);
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { id: 'platform-cube' };
        return mesh;
    },
    'floor-polygon': (floorData) => {
        const material = new THREE.MeshStandardMaterial({ 
            color: '#666666',
            roughness: 0.85,
            metalness: 0.1
        });
        const geometry = createFloorGeometry(floorData);
        const mesh = new THREE.Mesh(geometry, material);
        const y = floorData[0].gridY * 0.1;
        
        mesh.rotation.x = Math.PI / 2;
        mesh.position.y = y + 0.002;
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { id: 'floor-polygon' };
        return mesh;       
    }
}

export function createStructureInstance(assetId, wallData) {
    return assets[assetId](wallData);
}

/* 벽 geometry 계산 함수 */
function createWallGeometry(wallData) {
    const {
        startLeft,
        startRight,
        endLeft,
        endRight,
        baseY
    } = wallData;

    const wallGeometry = new THREE.BufferGeometry();
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

    const SL0 = { x: startLeft.x,  y: baseY, z: startLeft.z };
    const SR0 = { x: startRight.x, y: baseY, z: startRight.z };
    const EL0 = { x: endLeft.x,    y: baseY, z: endLeft.z };
    const ER0 = { x: endRight.x,   y: baseY, z: endRight.z };

    const SLH = { x: startLeft.x,  y: baseY + WALL_HEIGHT, z: startLeft.z };
    const SRH = { x: startRight.x, y: baseY + WALL_HEIGHT, z: startRight.z };
    const ELH = { x: endLeft.x,    y: baseY + WALL_HEIGHT, z: endLeft.z };
    const ERH = { x: endRight.x,   y: baseY + WALL_HEIGHT, z: endRight.z };

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

/* 바닥 geometry 계산 함수 */
function createFloorGeometry(floorData){
    const shape = new THREE.Shape();

    floorData.forEach((point, index) => {
        const x = point.gridX * GRID_SIZE_M;
        const z = point.gridZ * GRID_SIZE_M;

        if (index === 0) {
            shape.moveTo(x, z);
        } else {
            shape.lineTo(x, z);
        }
    });

    shape.closePath();

    const floorGeometry = new THREE.ExtrudeGeometry(shape, {
        depth: FLOOR_THICKENSS,
        bevelEnabled: false
    });

    return floorGeometry;
}