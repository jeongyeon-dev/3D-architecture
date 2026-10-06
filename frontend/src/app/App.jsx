import { useEffect, useState } from 'react';
import "./App.css";

import NavBar from "../components/navbar/NavBar.jsx";
import AuthModal from '../components/modal/AuthModal.jsx';

import Editor from './editor/editor.jsx';
import Login from './login/Login.jsx';
import Signup from "./signup/Signup.jsx";
import Workspace from "./workspace/Workspace.jsx";

import HeroSection from '../sections/hero/HeroSection.jsx';

import { createProject } from '../api/project.js';
import { getUsableAccessToken } from "../api/auth.js";


export default function App() {
    /* 미들웨에서 검증 수행하기 */
    const [loggedIn, setLoggedIn] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    const [page, setPage] = useState("workspace");
    const [projectId, setProjectId] = useState(null);
    const [projectTitle, setProjectTitle] = useState("");
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [authModal, setAuthModal] = useState(null);

    /* 미들웨어 수행해서 access 토큰 유효성 검사하기 */
    useEffect(() => {
        async function restoreLogin() {
            try {
                const accessToken = await getUsableAccessToken();
                setLoggedIn(Boolean(accessToken));
            } catch (error) {
                console.error(error);
                setLoggedIn(false);
            } finally {
                setAuthLoading(false);
            }
        }

        restoreLogin();
    }, []);

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

    if (authLoading) {
        return <div>로그인 확인 중...</div>;
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
            <HeroSection
                onStartClick={() => setAuthModal("signup")}
            />
            
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
