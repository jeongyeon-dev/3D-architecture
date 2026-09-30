import { useState } from 'react';
import "./App.css";

import NavBar from "../components/navbar/NavBar.jsx";
import AuthModal from '../components/modal/AuthModal.jsx';

import Editor from './editor/editor.jsx';
import Login from './login/Login.jsx';
import Signup from "./signup/Signup.jsx";
import Community from './community/Community.jsx';
import Project from './project/Project.jsx';
import Workspace from "./workspace/Workspace.jsx";

import { createProject } from '../api/project.js';
import { getValidAccessToken } from '../api/auth.js';


export default function App() {
    /* 토큰 유무에 따른 로그인 상태 구별하기 */
    const [loggedIn, setLoggedIn] = useState(
        () => Boolean(getValidAccessToken())
    );

    const [page, setPage] = useState("workspace");
    const [projectId, setProjectId] = useState(null);
    const [projectTitle, setProjectTitle] = useState("");
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [authModal, setAuthModal] = useState(null);

    /* 주 페이지 내용 구성을 함 */
    let pageContent;

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

    if (loggedIn) {
        if (page === "editor") {
            return (
                <Editor projectId={projectId} />
            );
        }

        return (
            <>
                <Workspace
                    onCreateProject={() => {
                        setShowCreateModal(true);
                    }}
                    onProjectSelect={(project) => {
                        setProjectId(project.id);
                        setPage("editor");
                    }}
                />

                {showCreateModal && (
                    <div className="modal-backdrop">
                        <div className="project-modal">
                            <h2>새 프로젝트</h2>

                            <input
                                type="text"
                                placeholder="프로젝트 이름"
                                value={projectTitle}
                                onChange={(event) => {
                                    setProjectTitle(event.target.value);
                                }}
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
            </>
        );
    }

    return (
        <div className="app-shell">
            <NavBar
                loggedIn={loggedIn}
                onLogoClick={() => setPage("home")}
                onLoginClick={() => setAuthModal("login")}
                onSignupClick={() => setAuthModal("signup")}
            />

            <main className="app-content">
                {pageContent}
            </main>

            {authModal === "login" && (
                <AuthModal
                    title="로그인"
                    onClose={() => setAuthModal(null)}
                >
                    <Login
                        onLogin={() => {
                            setLoggedIn(true);
                            setAuthModal(null);
                        }}
                    />
                </AuthModal>
            )}

            {authModal === "signup" && (
                <AuthModal
                    title="회원가입"
                    onClose={() => setAuthModal(null)}
                >
                    <Signup />
                </AuthModal>
            )}
        </div>
    );
}
