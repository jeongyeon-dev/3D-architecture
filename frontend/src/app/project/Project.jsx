import { useEffect, useState } from "react";
import { getProjects, getProject } from "../../api/project.js";

import { X } from "lucide-react";


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

    /* 프로젝트 클릭 시 => 에디터 화면으로 */
    async function handleProjectClick(projectId) {
        try {
            const project = await getProject(projectId);    
            onProjectSelect(project);
        } catch (error) {
            console.error(error);
        }
    }

    async function handleProjectDelete(projectId){
        try{
            console.log("삭제실행")
        }catch(error){
            console.error(error)
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
                <article
                    className="project-card"
                    key={project.id}
                >
                    <button
                        type="button"
                        className="project-card__open"
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

                    <button
                        type="button"
                        className="project-card__delete"
                        aria-label={`${project.title} 삭제`}
                        onClick={(event) => {
                            event.stopPropagation();
                            handleProjectDelete(project.id);
                        }}
                    >
                        <X size={16} strokeWidth={1.5} />
                    </button>
                </article>
            ))}
        </div>
    );
}

