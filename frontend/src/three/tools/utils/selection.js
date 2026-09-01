import * as THREE from 'three';

export function createOutline(mesh) {
    const geometry = new THREE.EdgesGeometry(mesh.geometry);

    const material = new THREE.LineBasicMaterial({
        color: 0x00aaff
    });

    const outline = new THREE.LineSegments(
        geometry,
        material
    );

    mesh.add(outline);
    return outline;
}