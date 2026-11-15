const API_WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

let socket = null;

/* 소켓 연결 성립시키기 */
export function connectProjectSocket(projectId, onMessage) {
    /* 예방용 코드: 먼저 닫기 */
    socket?.close();
    socket = new WebSocket(`${API_WS_BASE_URL}/ws/cursor`);

    socket.onopen = () => {
        socket.send(JSON.stringify({
            type: "JOIN",
            projectId,
        }));
    };

    socket.onmessage = (event) => {
        onMessage(JSON.parse(event.data));
    };

    return socket;
}

/* 연결 성립된 소켓에 메시지 보내기 */
export function sendSocketMessage(message) {
    if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    }
}

/* 소켓 연결 끊기 */
export function disconnectProjectSocket() {
    socket?.close();
    socket = null;
}