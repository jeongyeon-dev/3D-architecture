import { useEffect, useState } from "react";
import { getCommunityPosts } from "../../api/community.js";

export default function Community() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPosts() {
            try {
                const data = await getCommunityPosts();
                setPosts(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchPosts();
    }, []);

    if (loading) {
        return <div>불러오는 중...</div>;
    }

    return (
        <div>
            {posts.map((post) => (
                <div key={post.id}>
                    <img
                        src={post.image_url}
                        alt={post.title}
                    />

                    <h3>{post.title}</h3>

                    <p>조회수 {post.view_count}</p>
                    <p>좋아요 {post.like_count}</p>
                    <p>{post.updated_at}</p>
                </div>
            ))}
        </div>
    );
}