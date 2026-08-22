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