const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export async function login(username, password) {
    const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                password,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error("로그인에 실패했습니다.");
    }

    if (!data.success) {
        throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
    }

    /* access, refresh 둘 다 저장한다 */
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);

    return data;
}



export async function signup(username, nickname, password) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            nickname,
            password,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "회원가입에 실패했습니다.");
    }

    return data;
}



/* access 토큰이 만료되었는지 검증 => 만료시 재발급 */
export async function getUsableAccessToken() {
    const accessToken = getAccessToken();

    if (accessToken && !isAccessTokenExpired()) {
        return accessToken;
    }

    return await refreshAccessToken();
}



export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
        removeAccessToken();
        return null;
    }

    /* refresh 기준 access 재발급 서버에 요청 */
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            refresh_token: refreshToken,
        }),
    });

    if (response.status === 401 || response.status === 400) {
        removeAccessToken();
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        return null;
    }

    if (!response.ok) {
        throw new Error("access token 재발급에 실패했습니다.");
    }

    const data = await response.json();

    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);

    return data.access_token;
}

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function removeAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/* access 토큰이 만료되었는지 확인 */
export function isAccessTokenExpired() {
    const token = getAccessToken();

    if (!token) {
        return true;
    }

    try {
        const encodedPayload = token.split(".")[1];

        const base64 = encodedPayload
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");

        const payload = JSON.parse(atob(base64));

        if (!payload.exp) {
            return true;
        }

        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
}

export function getValidAccessToken() {
    if (isAccessTokenExpired()) {
        removeAccessToken();
        return null;
    }

    return getAccessToken();
}