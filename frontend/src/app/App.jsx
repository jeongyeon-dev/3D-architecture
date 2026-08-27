import { useState } from 'react';
import "./App.css";

import Editor from './editor/editor.jsx';
import Login from './login/Login.jsx';
import Signup from "./signup/Signup.jsx";
import Community from './community/Community.jsx';
import Project from './project/Project.jsx';

import { createProject } from '../api/project.js';


export default function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [page, setPage] = useState("home");
    const [projectId, setProjectId] = useState(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [projectTitle, setProjectTitle] = useState("");


    /* 프로젝트 생성 함수 */
    async function handleCreateProject(){
        if(!projectTitle.trim()){
            return;
        }

        try{
            const project = await createProject(projectTitle);

            setProjectId(project.id);
            setShowCreateModal(false);
            setProjectTitle("");
            setPage("editor");
        
    }catch(error){
            console.error(error);
        }
    }

    if (!loggedIn) {
        return (
            <div className="home-layout">
                <div>
                    <Login onLogin={() => setLoggedIn(true)} />
                    <Signup />
                </div>
                <Community />
            </div>
        );
    }

    if (page === "editor") {
        return <Editor projectId={projectId}/>;
    }

    return (
        <div className="home-layout">
            <div>
                <button onClick={() => setShowCreateModal(true)}>
                    새 프로젝트 만들기
                </button>
                <Project
                    onProjectSelect={(project) => {
                        setProjectId(project.id);
                        setPage("editor");
                    }}
                />
            </div>
            <Community />
                {showCreateModal && (
                    <div className="modal-backdrop">
                        <div className="project-modal">
                            <h2>새 프로젝트</h2>

                            <input
                                type="text"
                                placeholder="프로젝트 이름"
                                value={projectTitle}
                                onChange={(e) => setProjectTitle(e.target.value)}
                            />

                            <button onClick={handleCreateProject}>
                                만들기
                            </button>

                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setProjectTitle("");
                                }}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                )}
        </div>
    );
}
