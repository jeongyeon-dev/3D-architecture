import * as THREE from 'three';

export function createGrid(width, length, gridSize, x, z, y){
    /* 원근에 따른 흐릿함 설정 */
    const FADE_START = 10;
    const FADE_END = 18;
    
    const center = { x, z };
    
    const group = new THREE.Group();
    const majorGrid = createRectGrid(width, length, 1, center);
    const minorGrid = createRectGrid(width, length, gridSize, center);

    majorGrid.material = new THREE.LineBasicMaterial({
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
    group.position.set(x, y, z);

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

function createRectGrid(width, length, spacing, center) {
    const positions = [];
    
    const halfWidth = width / 2;
    const halfLength = length / 2;
    
    const centerX = center.x;
    const centerZ = center.z;

    /* 시작 위치 구하기 */
    const firstWorldX = Math.ceil((centerX - halfWidth) / spacing) * spacing;
    const firstWorldZ = Math.ceil((centerZ - halfLength) / spacing) * spacing;

    /* 각 간격 구하기 */
    for (
        let worldX = firstWorldX;
        worldX <= centerX + halfWidth;
        worldX += spacing
    ) {
        const localX = worldX - centerX;

        positions.push(
            localX, 0, -halfLength,
            localX, 0, halfLength
        );
    }

    for (
        let worldZ = firstWorldZ;
        worldZ <= centerZ + halfLength;
        worldZ += spacing
    ) {
        const localZ = worldZ - centerZ;

        positions.push(
            -halfWidth, 0, localZ,
            halfWidth, 0, localZ
        );
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
    );

    return new THREE.LineSegments(geometry);
}
