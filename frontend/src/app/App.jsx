import { useState } from 'react';
import "./App.css";

import Editor from './editor/editor.jsx';
import Login from './login/Login.jsx';
import Signup from "./signup/Signup.jsx";
import Community from './community/Community.jsx';
import Project from './projects/Project.jsx';

export default function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [page, setPage] = useState("home");

    if (!loggedIn) {
        return (
            <div className="home-layout">
                <div>
                    <Login onLogin={() => setLoggedIn(true)} />
                    <Signup />
                    <Project />
                </div>
                <Community />
            </div>
        );
    }

    if (page === "editor") {
        return <Editor />;
    }

    return (
        <div className="home-layout">
            <button onClick={() => setPage("editor")}>
                에디터로 이동
            </button>

            <Project />
            <Community />
        </div>
    );
}
