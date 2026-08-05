import * as THREE from 'three';

export function createGrid(size, gridSize, x, y){
    /* 원근에 따른 흐릿함 설정 */
    const FADE_START = 10;
    const FADE_END = 18;
    
    const group = new THREE.Group();
    const majorGrid = new THREE.GridHelper(
        size,
        size / 1
    );
    const minorGrid = new THREE.GridHelper(
        size,
        size / 0.25
    );

    majorGrid.material = new THREE.LineDashedMaterial({
        color: '#fdfdfd',
    });

    minorGrid.material = new THREE.LineDashedMaterial({
        color: '#fdfdfd',
        dashSize: 0.03,
        gapSize: 0.03,
        transparent: true,
        opacity: 1
    });

    minorGrid.computeLineDistances();
    majorGrid.position.y = 0.004; 
    minorGrid.position.y = 0.002;

    group.add(minorGrid, majorGrid);
    group.position.set(x, 0, y);

    /* 흐릿함 설정 */
    group.updateOpacity = (cameraDistance) => {
        const ratio = THREE.MathUtils.clamp(
            (cameraDistance - FADE_START) /
            (FADE_END - FADE_START),
            0,
            1
        );

        minorGrid.material.opacity = 1 - ratio;
        minorGrid.visible = ratio < 1;
    };

    return group;
}