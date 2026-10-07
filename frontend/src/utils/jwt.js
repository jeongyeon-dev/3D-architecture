import { getAccessToken } from "../api/auth";


/* 토큰을 파싱하여 안에서 nickname을 가져오는 함수 */
export function parseJwtPayload() {
    const token = getAccessToken();

    if (!token) {
        return null;
    }

    try {
        const encodedPayload = token.split(".")[1];

        const base64 = encodedPayload
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");

        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

export function getNicknameFromToken() {
    return parseJwtPayload()?.nickname ?? null;
}