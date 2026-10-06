import { getUsableAccessToken } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* refresh 기반 access 재발급 하는 미들웨어 함수 */
export async function authFetch(path, options = {}) {
    const accessToken = await getUsableAccessToken();

    if (!accessToken) {
        throw new Error("로그인이 필요합니다.");
    }

    const headers = new Headers(options.headers);

    headers.set("Authorization", `Bearer ${accessToken}`);

    return fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });
}