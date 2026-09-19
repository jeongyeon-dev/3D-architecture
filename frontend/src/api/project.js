import { 
    getValidAccessToken, 
    removeAccessToken 
} from "./auth";

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
    const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: getAuthHeaders(),   
    });

    if (response.status === 401) {
        removeAccessToken();
        window.location.reload();
        throw new Error("로그인이 만료되었습니다.");
    }

    if (!response.ok) {
        throw new Error("프로젝트를 불러오지 못했습니다.");
    }

    return response.json();
}


export async function createProject(title) {
    const response = await fetch(`${API_BASE_URL}/projects/create`, {
        method: "POST",
        headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: title,
        }),
    });

    if (!response.ok) {
        throw new Error("프로젝트 생성에 실패했습니다.");
    }

    return response.json();
}


export async function getProject(projectId) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("프로젝트를 불러오지 못했습니다.");
    }

    return response.json();
}


export async function saveProject(projectId, objects) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_BASE_URL}/projects/save/${projectId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                objects,
            }),
        }
    );

    if (!response.ok) {
        throw new Error("프로젝트 저장에 실패했습니다.");
    }

    return response.json();
}