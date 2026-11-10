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
export async function searchMembers(keyword) {
    const response = await authFetch(`/projects/members/search/${keyword}`);

    if (!response.ok) {
        throw new Error("유저 검색 과정에 오류가 발생했습니다.");
    }

    return response.json();
}