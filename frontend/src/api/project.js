const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem("access_token")

export async function getProjects() {
    const response = fetch(`${API_BASE_URL}/projects`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("프로젝트를 불러오지 못했습니다.");
    }

    return response.json();
}
