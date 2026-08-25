import { useEffect, useState } from "react";
import { getProjects } from "../../api/project.js";

export default function Project() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        async function fetchProjects() {
            const token = localStorage.getItem("access_token");

            if (!token) {
                setLoggedIn(false);
                setLoading(false);
                return;
            }

            setLoggedIn(true);

            try {
                const data = await getProjects();
                setProjects(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, []);

    if (loading) {
        return <div>불러오는 중...</div>;
    }

    if (!loggedIn) {
        return <div>로그인해야 프로젝트를 볼 수 있습니다.</div>;
    }

    if (projects.length === 0) {
        return <div>저장된 프로젝트가 없습니다.</div>;
    }

    return (
        <div>
            {projects.map((project) => (
                <div key={project.id}>
                    <img
                        src={project.thumbnail_url}
                        alt={project.title}
                    />

                    <h3>{project.title}</h3>

                    <p>{project.updated_at}</p>
                </div>
            ))}
        </div>
    );
}

