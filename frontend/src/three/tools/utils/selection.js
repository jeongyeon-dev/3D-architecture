import * as THREE from 'three';
import { GIZMO_OFFSET } from '../../config';

/* gizmo 객체 */
let gizmo = undefined;

export function createOutline(mesh) {
    const geometry = new THREE.EdgesGeometry(mesh.geometry);

    const material = new THREE.LineBasicMaterial({
        color: '#fdfdfd',
        toneMapped: false
    });

    const outline = new THREE.LineSegments(
        geometry,
        material
    );

    /* outline 이름 지정 */
    outline.userData.isSelectionOutline = true;
    mesh.add(outline);
}

export function removeOutline(mesh) {
    if(!mesh) return;

    const outline = mesh.children.find(
        child => child.userData.isSelectionOutline
    );

    if (!outline) return;

    mesh.remove(outline);

    outline.geometry.dispose();
    outline.material.dispose();
}


/* gizmo 그리기 */
export function createGizmo(mesh){

    /* 선택된 mesh의 범위 구하기(가상의 box) */
    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());

    /* 동서남북 화살표 위치 구하기 */
    const east = new THREE.Vector3(
        box.max.x + GIZMO_OFFSET,
        center.y,
        center.z
    );

    const west = new THREE.Vector3(
    box.min.x - GIZMO_OFFSET,
    center.y,
    center.z
    );

    const north = new THREE.Vector3(
        center.x,
        center.y,
        box.min.z - GIZMO_OFFSET
    );

    const south = new THREE.Vector3(
        center.x,
        center.y,
        box.max.z + GIZMO_OFFSET
    );

    const eastArrow = createArrow(1, 0, 0, east);
    const westArrow = createArrow(-1, 0, 0, west);
    const northArrow = createArrow(0, 0, -1, north);
    const southArrow = createArrow(0, 0, 1, south);
    
    gizmo = new THREE.Group();
    gizmo.add(
        eastArrow,
        westArrow,
        northArrow,
        southArrow
    );
    mesh.parent.add(gizmo);

    return [
        eastArrow.children[0],
        eastArrow.children[1],
        westArrow.children[0],
        westArrow.children[1],
        northArrow.children[0],
        northArrow.children[1],
        southArrow.children[0],
        southArrow.children[1]
    ];
}

/* gizmo 지우기 */
export function removeGizmo(){
    if (!gizmo) return;

    gizmo.removeFromParent();
    gizmo = undefined;
}

function createArrow(x, y, z, origin){
    const direction = new THREE.Vector3(x, y, z).normalize();
    const arrow = new THREE.Group();

    /* raycast 감지용 표식 붙이기 */
    arrow.userData.isGizmoArrow = true;
    arrow.userData.direction = direction;

    /* 기본 설정 인자값 */
    const length = 0.4;
    const headLength = 0.2;
    const headWidth = 0.15;

    const shaftLength = length - headLength;
    const shaftRadius = 0.035;

    const material = new THREE.MeshStandardMaterial({
        color: 0xfdfdfd,
        emissive: '#009ae7',
        emissiveIntensity: 4,
        toneMapped: false
    });

    /* 화살표 꼬리 */
    const shaftGeometry = new THREE.CylinderGeometry(
        shaftRadius,
        shaftRadius,
        shaftLength,
        32
    );
    const shaft = new THREE.Mesh(shaftGeometry, material);
    
    shaft.position.y = shaftLength / 2;
    arrow.add(shaft);

    /* 화살표 머리 */
    const headGeometry = new THREE.ConeGeometry(
        headWidth,
        headLength,
        32
    );
    const head = new THREE.Mesh(headGeometry, material);

    head.position.y = shaftLength + headLength / 2;
    arrow.add(head);

    /* 방향 및 위치 설정 */
    arrow.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction
    );
    arrow.position.copy(origin);
    return arrow;
}


export function getGizmoRaycastTargets() {
    if (!gizmo) return [];

    const targets = [];

    gizmo.traverse(object => {
        if (object.isMesh) {
            targets.push(object);
        }
    });

    return targets;
}

/* 화살표 크기 변경 */
export function setGizmoArrowScale(arrow, scale) {
    if (!arrow) return;

    arrow.scale.setScalar(scale);
}

/* 하이라이트 추가 */
export function createSelectionHighlight(mesh) {
    if (!mesh?.isMesh) return;

    /* 중복 생성 방지 */
    const existing = mesh.children.find(
        child => child.userData.isSelectionHighlight
    );

    if (existing) return;

    const material = new THREE.MeshStandardMaterial({
        color: 0xfdfdfd,
        emissive: '#009ae7',
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        toneMapped: false
    });

    const highlight = new THREE.Mesh(
        mesh.geometry,
        material
    );

    highlight.userData.isSelectionHighlight = true;

    mesh.add(highlight);
}


/* 하이라이트 제거 */
export function removeSelectionHighlight(mesh) {
    if (!mesh) return;

    const highlight = mesh.children.find(
        child => child.userData.isSelectionHighlight
    );

    if (!highlight) return;

    mesh.remove(highlight);

    highlight.material.dispose();
}


/* 화살표들 위치 재 position 하기 */
export function updateGizmoPosition(prismData) {
    const east = gizmo.children[0];
    const west = gizmo.children[1];
    const north = gizmo.children[2];
    const south = gizmo.children[3];

    const y = east.position.y;

    east.position.set(
        prismData.midX + prismData.width / 2 + GIZMO_OFFSET,
        y,
        prismData.midZ
    );

    west.position.set(
        prismData.midX - prismData.width / 2 - GIZMO_OFFSET,
        y,
        prismData.midZ
    );

    north.position.set(
        prismData.midX,
        y,
        prismData.midZ - prismData.length / 2 - GIZMO_OFFSET
    );

    south.position.set(
        prismData.midX,
        y,
        prismData.midZ + prismData.length / 2 + GIZMO_OFFSET
    );
}