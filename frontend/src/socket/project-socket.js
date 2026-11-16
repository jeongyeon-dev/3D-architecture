const API_WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

import { getUsableAccessToken } from "../api/auth";

let socket = null;

/* 소켓 연결 성립시키기 */
export async function connectProjectSocket(projectId, onMessage) {
    const accessToken = await getUsableAccessToken();

    if (!accessToken) {
        throw new Error("로그인이 필요합니다.");
    }

    const params = new URLSearchParams({
        projectId: String(projectId),
        token: accessToken,
    });

    socket?.close();

    socket = new WebSocket(
        `${API_WS_BASE_URL}/ws/cursor?${params}`
    );

    /* 서버에서 받은 메시지 */
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