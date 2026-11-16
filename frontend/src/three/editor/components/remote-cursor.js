import * as THREE from 'three';

import { createMarkingInstance } from '../../assets/marking-assets';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { GRID_SIZE_M } from '../../config';

export function createCursor(scene, userId, nickname){
    /* 3차원 표식 생성 */
    const cursorMesh = createMarkingInstance('cursor', getCursorColor(nickname));
    cursorMesh.userData.userId = userId;
    
    /* 2차원 닉네임 표식 생성 */
    const labelElement = document.createElement('div');
    labelElement.className = 'remote-cursor-nickname';
    labelElement.textContent = nickname;

    const nicknameLabel = new CSS2DObject(labelElement);
    nicknameLabel.position.set(0, 0.5, 0);
    
    cursorMesh.add(nicknameLabel);
    scene.add(cursorMesh);

    return cursorMesh;
}

export function moveCursor(scene, userId, nickname, position){
    let cursorMesh = scene.children.find(
        (object) => object.userData.userId === userId
    );

    if (!cursorMesh) {
        cursorMesh = createCursor(scene, userId, nickname);
    }

    cursorMesh.position.set(
        position.gridX * GRID_SIZE_M,
        position.gridY * 0.1 + 0.06,
        position.gridZ * GRID_SIZE_M
    )
}

export function removeCursor(scene, userId){
    const cursorMesh = scene.children.find(
        (object) => object.userData.userId === userId
    );

    scene.remove(cursorMesh);

    cursorMesh.geometry.dispose();
    cursorMesh.material.dispose();
}


/* 얘들은 프라이빗 한 함수들 */
function getCursorColor(nickname = "") {
    const colors = [
        "#ffb5b5",
        "#98d4ff",
        "#c1a6ff",
        "#92ebc6",
        "#fcd798",
    ];

    const sum = [...nickname].reduce(
        (total, character) => total + character.charCodeAt(0),
        0
    );

    return colors[sum % colors.length];
}