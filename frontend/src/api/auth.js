const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ACCESS_TOKEN_KEY = "access_token";

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

    localStorage.setItem("access_token", data.access_token);

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


/* 토큰 관련 로직 */
export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function removeAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
}

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