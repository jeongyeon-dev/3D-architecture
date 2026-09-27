/* DB에 저장되는 데이터 */
const objects = new Map();

/* 런타임용 임시 데이터 */
const platformMeshes = [];
const wallSegments = new Map();

let nextId = 1;
let _nextId = 1;

export function addObject(object){
    const id = nextId++;

    objects.set(id, {
        id,
        ...object,
    });

    return id;
}

export function getObject(id){
    return objects.get(id);
}

export function getObjectsByType(type) {
    return Array.from(objects.values())
        .filter(object => object.type === type);
}

export function getAllObjects(){
    return Array.from(objects.values());
}

export function removeObject(id){
    objects.delete(id);
}

export function removeAllObjects(){
    objects.clear();
    nextId = 1;
}


export function addPlatformMesh(mesh){
    platformMeshes.push(mesh);
}

export function getPlatformObjectMeshes(){
    return platformMeshes;
}


/* 벽 절편 관리 함수들 */
export function addWallSegment(object){
    const id = _nextId++;

   wallSegments.set(id, {
        id,
        ...object,
    });

    return id;
}

export function getWallSegment(id) {
    return wallSegments.get(id);
}


/* 벽에 창문을 넣는 함수들 */
export function addWindow(wallId, windowData) {
    const wall = objects.get(wallId);

    if (!wall || wall.type !== 'wall-face') {
        throw new Error(`벽 ${wallId}를 찾지 못했습니다.`);
    }

    if (!wall.windows) {
        wall.windows = [];
    }

    wall.windows.push(windowData);
}