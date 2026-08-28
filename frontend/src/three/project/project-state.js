const objects = new Map();

const platformMeshes = [];

let nextId = 1;

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