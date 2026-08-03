export function createLand(size){
    /* 2차원 바닥 정보 배열 */
    const data = [];

    initialize();

    function initialize(){
        for (let x = 0; x < size; x++){
            const column = [];
            for (let y = 0; y < size; y++){
                const tile = {x, y};
                column.push(tile);
            }
            data.push(column);
        }
    }

    return {
        size,
        data
    }
}