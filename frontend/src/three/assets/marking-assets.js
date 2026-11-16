import * as THREE from 'three';

const cursorGeometry = new THREE.SphereGeometry(0.12, 24, 8);


const assets = {
    'cursor': (color = 0x00e5ff) => {
        const material = new THREE.MeshBasicMaterial({
            color,
            toneMapped: false
        });
        const mesh = new THREE.Mesh(cursorGeometry, material);
        return mesh;
    }
}

export function createMarkingInstance(assetId, color){
    if(assetId in assets){
        /* mesh 만 반환 */
        return assets[assetId](color);
    }else{
        console.warn(`해당 에셋 ID ${assetId}를 찾지 못했습니다.`);
        return undefined;
    }
}