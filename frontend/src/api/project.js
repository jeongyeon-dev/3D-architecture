/* 요 녀석은 미들웨어 함수로, 
   토큰(refresh - access 관계 등)을 인식하고 재발급 및 인가하는 기능을 한다 */
import { authFetch } from "./authFetch";

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

/* 각각 저장 불러오기 및 저장 api 이다 */
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


/* 프로젝트를 삭제하는 api: 정확히는 휴지통에 보낸다 */
export async function deleteProject(projectId) {
    const response  = await authFetch(`/projects/delete/${projectId}`, {
        method: "PUT",
    });

    if(!response.ok){
        throw new Error("프로젝트를 휴지통에 보내지 못했습니다.");
    }

    return response.json();
}