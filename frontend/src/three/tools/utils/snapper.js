/* 스냅을 적용하는 함수(45도 기준) */
export function snapHoverPoint(startPoint, gridX, gridZ, gridY){
    const _45Rad = Math.PI / 4;

    const startX = startPoint.gridX;
    const startZ = startPoint.gridZ;

    const dx = gridX - startX;
    const dz = gridZ - startZ;

    /* 1. startPoint 기준 마우스의 각도
        2. snaped된 45도 단위의 각도 */
    const mouseAngle = Math.atan2(dz, dx);
    const snappedAngle = Math.round(mouseAngle / _45Rad) * _45Rad;

    /* snaped 각도를 벡터 형태로 변환 */
    const dX = Math.cos(snappedAngle);
    const dZ = Math.sin(snappedAngle);
    
    const calcData = {
        startX, startZ,
        gridX, gridZ, gridY,
        dx, dz,
        dX, dZ
    };

    return diagonal(calcData);
}

/* 버그 수정용 함수.. 추후 이해 필요 */
function diagonal(calcData){
    const { startX, startZ,
            gridX, gridZ, gridY,
            dx, dz,
            dX, dZ } = calcData;
    
    const isDiagonal = Math.abs(dX) > 0.5 && Math.abs(dZ) > 0.5;

    if (isDiagonal) {
        const step = Math.round(
            (Math.abs(dx) + Math.abs(dz)) / 2
        );

        return {
            gridX: startX + Math.sign(dX) * step,
            gridZ: startZ + Math.sign(dZ) * step,
            gridY
        };
    }

    if (Math.abs(dX) > Math.abs(dZ)) {
        return {
            gridX,
            gridZ: startZ,
            gridY
        };
    }

    return {
        gridX: startX,
        gridZ,
        gridY
    };        
}