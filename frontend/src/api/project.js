import { authFetch } from "./authFetch";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


/* 토큰을 구하는 함수 */
function getAuthHeaders() {
    const token = getValidAccessToken();

    if (!token) {
        throw new Error("로그인이 만료되었거나, 로그인이 되지 않았습니다.");
    }

    return {
        Authorization: `Bearer ${token}`,
    };
}


export async function getProjects() {
    const response = await authFetch("/projects");

    if (!response.ok) {
        throw new Error("프로젝트를 불러오지 못했습니다.");
    }

    return response.json();
}


export async function createProject(title) {
    const response = await authFetch("/projects/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
    });

    if (!response.ok) {
        throw new Error("프로젝트 생성에 실패했습니다.");
    }

    return response.json();
}


export async function getProject(projectId) {
    const response = await authFetch(`/projects/${projectId}`);

    if (!response.ok) {
        throw new Error("프로젝트를 불러오지 못했습니다.");
    }

    return response.json();
}


export async function saveProject(projectId, objects) {
    const response = await authFetch(`/projects/save/${projectId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ objects }),
    });

    if (!response.ok) {
        throw new Error("프로젝트 저장에 실패했습니다.");
    }

    return response.json();
}