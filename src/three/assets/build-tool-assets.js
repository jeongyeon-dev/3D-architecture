import * as THREE from 'three';
import { WALL_HEIGHT, PLATFORM_HEIGHT } from '../config.js';

const hoverWallPoleGeometry = new THREE.CylinderGeometry(0.08, 0.08, WALL_HEIGHT);
const hoverWallFaceGeometry = new THREE.BoxGeometry(1, WALL_HEIGHT, 0.16);

const hoverPlatformPoleGeometry = new THREE.CylinderGeometry(0.08, 0.08, PLATFORM_HEIGHT);
const hoverPlatformCubeGeometry = new THREE.BoxGeometry(1, PLATFORM_HEIGHT, 1);

const assets = {
    'hover-wall-pole': () => {
        const material = new THREE.MeshBasicMaterial({ 
            color: '#ffffff',
            toneMapped: false,
            fog: false,
            transparent: true,
            opacity: 1,
            depthWrite: false 
        });
        const mesh = new THREE.Mesh(hoverWallPoleGeometry, material);
        
        mesh.userData = { id: 'hover-wall-pole' };
        mesh.renderOrder = 2;
        return mesh;
    },
    'hover-wall-face': () => {
        const material = new THREE.MeshBasicMaterial({ 
            color: '#ffffff',
            transparent: true,
            opacity: 0.6,
            depthWrite: false 
        });
        const outline = new THREE.LineSegments(
            new THREE.EdgesGeometry(hoverWallFaceGeometry),
            new THREE.LineBasicMaterial({
                color: '#ffffff',
                toneMapped: false,
                fog: false,
                transparent: true,
                opacity: 1,
                depthTest: false,
                depthWrite: false
            })
        );
        const mesh = new THREE.Mesh(hoverWallFaceGeometry, material);
        outline.renderOrder = 3;

        mesh.userData = { id: 'hover-wall-face' };
        mesh.renderOrder = 1;
        mesh.add(outline);
        return mesh;
    },
    'hover-platform-cube': () => {
        const material = new THREE.MeshBasicMaterial({ 
            color: '#ffffff',
            transparent: true,
            opacity: 0.6,
            depthWrite: false 
        });
        const outline = new THREE.LineSegments(
            new THREE.EdgesGeometry(hoverPlatformCubeGeometry),
            new THREE.LineBasicMaterial({
                color: '#ffffff',
                toneMapped: false,
                fog: false,
                transparent: true,
                opacity: 1,
                depthTest: false,
                depthWrite: false
            })
        );
        const mesh = new THREE.Mesh(hoverPlatformCubeGeometry, material);
        
        mesh.userData = { id: 'hover-platform-cube' };
        mesh.add(outline);
        return mesh;
    },
    'hover-platform-pole': () => {
        const material = new THREE.MeshBasicMaterial({ 
            color: '#ffffff',
            toneMapped: false,
            fog: false,
            transparent: true,
            opacity: 1,
            depthWrite: false 
        });
        const mesh = new THREE.Mesh(hoverPlatformPoleGeometry, material);
        mesh.userData = { id: 'hover-platform-pole' };
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