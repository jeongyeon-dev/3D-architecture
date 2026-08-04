import * as THREE from 'three';

export function createGrid(size, gridSize, x, y){
    const grid = new THREE.GridHelper(
        size,
        size / gridSize,
        0x444444,
        '#fcfcfc'
    );

    grid.position.set(x, 0.002, y);

    return grid;
}