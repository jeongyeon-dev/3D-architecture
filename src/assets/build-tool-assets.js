import * as THREE from 'three';
import { WALL_HEIGHT } from '../config.js';

const hoverWallPoleGeometry = new THREE.CylinderGeometry(0.08, 0.08, WALL_HEIGHT);
const hoverWallFaceGeometry = new THREE.BoxGeometry(1, WALL_HEIGHT, 0.16);

const assets = {
    'hover-wall-pole': () => {
        const material = new THREE.MeshBasicMaterial({ 
            color: '#ffffff',
            transparent: true,
            opacity: 1,
            depthWrite: false 
        });
        const mesh = new THREE.Mesh(hoverWallPoleGeometry, material);
        mesh.userData = { id: 'hover-wall-pole' };
        return mesh;
    },
    'hover-wall-face': () => {
        const material = new THREE.MeshBasicMaterial({ 
            color: '#ffffff',
            transparent: true,
            opacity: 0.6,
            depthWrite: false 
        });
        const mesh = new THREE.Mesh(hoverWallFaceGeometry, material);
        mesh.userData = { id: 'hover-wall-face' };
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