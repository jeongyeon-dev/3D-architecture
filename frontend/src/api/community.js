const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export async function getCommunityPosts() {
    const response = await fetch(
        `${API_BASE_URL}/community/posts`,
    );

    if (!response.ok) {
        throw new Error("커뮤니티 게시물을 불러오지 못했습니다.");
    }

    return response.json();
}