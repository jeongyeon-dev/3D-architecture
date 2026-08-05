import * as THREE from 'three';

const WALL_HEIGHT = 2;
const wallGeometry = new THREE.BoxGeometry(0.08, WALL_HEIGHT, 0.08);

const assets = {
    'wall-tool': () => {
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff,
            transparent: true,
            opacity: 0.5,
            depthWrite: false 
        });
        const mesh = new THREE.Mesh(wallGeometry, material);
        mesh.userData = { id: 'wall-tool' };
        return mesh;
    }
}

export function createBuildToolInstance(assetId){
    if(assetId in assets){
        return assets[assetId]();
    }else{
        console.warn(`해당 에셋 ID ${assetId}를 찾지 못했습니다.`);
        return undefined;
    }
}