const objects = new Map();

let nextId = 1;

export function addObject(object){
    const id = nextId++;

    objects.set(id, {
        id,
        ...object,
    });
    console.log(objects);
    return id;
}

export function getObject(id){
    return objects.get(id);
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