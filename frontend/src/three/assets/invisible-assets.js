import * as THREE from 'three';

const assets = {
    'invisible-polygon': (polygon) => {
        /* 하나의 도형 만들기 */
        const shape = new THREE.Shape();
        
        shape.moveTo(polygon[0].x, polygon[0].z);

        for (let i = 1; i < polygon.length; i++) {
            shape.lineTo(polygon[i].x, polygon[i].z);
        }

        shape.closePath();

        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
            colorWrite: false,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.userDate = { id: 'invisible-polygon' };
        mesh.rotation.x = Math.PI / 2;
        return mesh;
    },  
}

export function createInvisibleInstance(assetId, data) {
    return assets[assetId](data);
}