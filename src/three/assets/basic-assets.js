import * as THREE from 'three';
import { LAND_SIZE_M } from '../config.js';

const geometry = new THREE.BoxGeometry(1, 1, 1);
const miniGemetry = new THREE.BoxGeometry(0.1, 1, 0.1);
const plateGeometry = new THREE.BoxGeometry(LAND_SIZE_M, 0.2, LAND_SIZE_M);

const assets = {
    'bedrock': (x, y) => {
        const material = new THREE.MeshLambertMaterial({ color:0x339933 });
        const mesh = new THREE.Mesh(plateGeometry, material);
        mesh.userData = { id: 'bedrock', x, y };
        mesh.position.set(x, -0.1, y);
        mesh.receiveShadow = true;
        return mesh;
    },
    'wall': (x, y) => {
        const material = new THREE.MeshLambertMaterial({ color: '#e8e8e8' });
        const mesh = new THREE.Mesh(miniGemetry, material);
        mesh.userData = { id: 'wall', x, y };
        mesh.position.set(x, 0.5, y);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        return mesh;
    },
    'floor': (x, y) => {
        const material = new THREE.MeshLambertMaterial({ color: '#b5b5b5' });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { id: 'floor', x, y };
        mesh.scale.set(1, 0.1, 1);
        mesh.position.set(x, 0.05, y);
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        return mesh;
    }
}

export function createAssetInstance(assetId, x, y){
    if(assetId in assets){
        return assets[assetId](x, y);
    }else{
        console.warn(`해당 에셋 ID ${assetId}를 찾지 못했습니다.`);
        return undefined;
    }
}