const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

    if (!response.ok) {
        throw new Error("로그인에 실패했습니다.");
    }

    return response.json();
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