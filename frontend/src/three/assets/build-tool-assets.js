import * as THREE from 'three';
import { 
    WALL_HEIGHT, 
    PLATFORM_HEIGHT, 
    HOVER_FLOOR_SPHERE_RADIUS,
    WINDOW_HEIGHT, WINDOW_WIDTH, WINDOW_FRAME_THICKNESS
} from '../config.js';
import { 
    createPrismGeometry,
    createWindowGroupGeometry
} from './util/geometry-calculator.js';


const hoverWallPoleGeometry = new THREE.CylinderGeometry(0.08, 0.08, WALL_HEIGHT);
const hoverWallFaceGeometry = new THREE.BoxGeometry(1, WALL_HEIGHT, 0.16);

const hoverPlatformPoleGeometry = new THREE.CylinderGeometry(0.08, 0.08, PLATFORM_HEIGHT);
const hoverPlatformCubeGeometry = new THREE.BoxGeometry(1, PLATFORM_HEIGHT, 1);

const hoverFloorDotGeometry = new THREE.SphereGeometry(HOVER_FLOOR_SPHERE_RADIUS, 16, 8);


/* 메터리얼 */
const lineMaterial = new THREE.LineBasicMaterial({
        color: '#ffffff',
        toneMapped: false,
        fog: false,
        transparent: true,
        opacity: 1,
        depthTest: false,
        depthWrite: false
    });
const nodeMaterial = new THREE.MeshBasicMaterial({ 
        color: '#ffffff',
        toneMapped: false,
        fog: false,
        transparent: true,
        opacity: 1,
        depthWrite: false 
    });
const faceMaterial = new THREE.MeshBasicMaterial({ 
        color: '#ffffff',
        transparent: true,
        opacity: 0.6,
        depthWrite: false 
    });
  
/* 창문 전용 메테리얼 */   
const hoverGlassMaterial = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.5,
    depthWrite: false
});
const hoverFrameMaterial = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: false,
    depthWrite: true
});
const windowLineMaterial = new THREE.LineBasicMaterial({
    color: '#ffffff',
    toneMapped: false,
    fog: false,
    depthTest: true,
    depthWrite: false
});

const assets = {
    'hover-wall-pole': () => {
        const mesh = new THREE.Mesh(hoverWallPoleGeometry, nodeMaterial); 
        mesh.userData = { id: 'hover-wall-pole' };
        mesh.renderOrder = 2;
        return mesh;
    },
    'hover-wall-face': () => {
        const outline = new THREE.LineSegments(
            new THREE.EdgesGeometry(hoverWallFaceGeometry),
            lineMaterial
        );
        const mesh = new THREE.Mesh(hoverWallFaceGeometry, faceMaterial);
        outline.renderOrder = 3;

        mesh.userData = { id: 'hover-wall-face' };
        mesh.renderOrder = 1;
        mesh.add(outline);
        return mesh;
    },
    'hover-platform-pole': () => {
        const mesh = new THREE.Mesh(hoverPlatformPoleGeometry, nodeMaterial);
        mesh.userData = { id: 'hover-platform-pole' };
        return mesh;
    },
    'hover-platform-cube': () => {
        const outline = new THREE.LineSegments(
            new THREE.EdgesGeometry(hoverPlatformCubeGeometry),
            lineMaterial
        );
        const mesh = new THREE.Mesh(hoverPlatformCubeGeometry, faceMaterial);
        
        mesh.userData = { id: 'hover-platform-cube' };
        mesh.add(outline);
        return mesh;
    },
    'hover-floor-dot': () => {
        const mesh = new THREE.Mesh(hoverFloorDotGeometry, nodeMaterial);
        mesh.userData = { id: 'hover-floor-dot' };
        return mesh;
    },
    'hover-floor-line': () => {
        const points = [
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, 1)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial); 
        
        line.userData = { id: 'hover-floor-line' };  
        return line;
    },
    'hover-roof-dot': () => {
        const mesh = new THREE.Mesh(hoverFloorDotGeometry, nodeMaterial);
        mesh.userData = { id: 'hover-roof-dot' };
        return mesh;
    },
    'hover-roof-prism': () => {
        const prismGeometry = createPrismGeometry();
        const outline = new THREE.LineSegments(
            new THREE.EdgesGeometry(prismGeometry),
            lineMaterial           
        );
        const mesh = new THREE.Mesh(prismGeometry, faceMaterial);

        mesh.userData = { id: 'hover-roof-prism' };
        mesh.add(outline);
        return mesh;
    },
    'hover-window-group': () => {
        /* 창문 group과 geometries */
        const width = WINDOW_WIDTH;
        const height = WINDOW_HEIGHT;
        const frameThickness = WINDOW_FRAME_THICKNESS;

        const geometries = createWindowGroupGeometry(
            width, 
            height,
            frameThickness
        );

        /* 위치 지정하기 */
        const positions = {
            pane:   [0, 0, 0],

            top:    [0,  (height - frameThickness) / 2, 0],
            bottom: [0, -(height - frameThickness) / 2, 0],

            left:   [-(width - frameThickness) / 2, 0, 0],
            right:  [ (width - frameThickness) / 2, 0, 0]
        };
        
        const group = new THREE.Group();
        
        /* for 문으로 각 순회하면서 적용 group에 더하기 */
        Object.entries(geometries).forEach(([name, geometry]) => {
            /* 외곽선 더하기 */
            if(name === 'outerBox' || name === 'innerBox'){
                const outerLine = new THREE.LineSegments(
                    new THREE.EdgesGeometry(geometry),
                    windowLineMaterial
                );
                
                outerLine.renderOrder = 2;
                group.add(outerLine);
                return;
            }   
            
            const material = name === 'pane'
                ? hoverGlassMaterial
                : hoverFrameMaterial;

            const mesh = new THREE.Mesh(geometry, material);
            
            mesh.renderOrder = 1;
            mesh.position.set(...positions[name]);
            mesh.userData = { id: `hover-window-${name}` };
            
            group.add(mesh);
        }); 
        
        return group;
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



