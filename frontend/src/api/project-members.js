/* 요 녀석은 미들웨어 함수로, 
   토큰(refresh - access 관계 등)을 인식하고 재발급 및 인가하는 기능을 한다 */
import { authFetch } from "./authFetch";

/* 프로젝트 멤버를 불러오는 함수 */
export async function getMembers(projectId) {
    const response = await authFetch(`/projects/members/${projectId}`);

    if (!response.ok) {
        throw new Error("프로젝트 멤버를 불러오지 못했습니다.");
    }

    return response.json();
}

/* 프로젝트 잠재 유저를 검색하는 함수 */
export async function searchMembers(projectId, keyword) {
    const response = await authFetch(`/projects/members/search/${projectId}-${keyword}`);

    if (!response.ok) {
        throw new Error("유저 검색 과정에서 오류가 발생했습니다.");
    }

    return response.json();
}

/* 프로젝트에 멤버를 초대하는 함수 */
export async function inviteMember(userId, projectId) {
    const response = await authFetch(`/projects/members/role`, {
        method: "POST",
        headers: {
            "Content-Type":  "application/json",
        },
        body: JSON.stringify({
            user_id: userId,
            project_id: projectId,
            role: "VIEWER"
        }),
    });

    if (!response.ok) {
        throw new Error("유저 초대 과정에서 오류가 발생했습니다.");
    }

    return response.json();
}

/* 프로젝트의 해당 멤버의 권한을 변경하는 함수 */
export async function changeRole(userId, projectId, role) {
    const response = await authFetch(`/projects/members/role`, {
        method: "POST",
        headers: {
            "Content-Type":  "application/json",
        },
        body: JSON.stringify({
            user_id: userId,
            project_id: projectId,
            role: role
        }),
    });

    if (!response.ok) {
        throw new Error("유저 권한 변경 과정에서 오류가 발생했습니다.");
    }

    return response.json();
}