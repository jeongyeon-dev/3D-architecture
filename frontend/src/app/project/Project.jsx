import { useEffect, useState } from "react";
import { getProjects, getProject } from "../../api/project.js";

export default function Project({ onProjectSelect }) {
    const [projects, setProjects] = useState([]);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        async function fetchProjects() {
            try {
                const data = await getProjects();
                setProjects(data);
                setLoggedIn(true);
            } catch (error) {
                setLoggedIn(false);
            }
        }

        fetchProjects();
    }, []);


    async function handleProjectClick(projectId) {
        try {
            const project = await getProject(projectId);    
            onProjectSelect(project);
        } catch (error) {
            console.error(error);
        }
    }

    if (!loggedIn) {
        return <div>로그인해야 프로젝트를 볼 수 있습니다.</div>;
    }

    if (projects.length === 0) {
        return <div>저장된 프로젝트가 없습니다.</div>;
    }

    return (
        <div className="project-grid">
            {projects.map((project) => (
                <button
                    type="button"
                    className="project-card"
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                >
                    <div className="project-card__thumbnail">
                        {project.thumbnail_url ? (
                            <img
                                src={project.thumbnail_url}
                                alt=""
                            />
                        ) : (
                            <span>미리보기 없음</span>
                        )}
                    </div>

                    <div className="project-card__information">
                        <h3>{project.title}</h3>
                        <p>{project.updated_at}</p>
                    </div>
                </button>
            ))}
        </div>
    );
}

