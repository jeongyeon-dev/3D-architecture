import Project from "../project/Project.jsx";
import "./Workspace.css";

import { useState } from "react";

import { getNicknameFromToken } from "../../utils/jwt.js";

import { 
    ChevronDown, 
    Bell, 
    UsersRound, 
    StickyNote, 
    Trash2,
    PenTool,
    Plus
} from "lucide-react";

export default function Workspace({
    onProjectSelect,
    onCreateProject,
}) {
    const nickname = getNicknameFromToken();
    const [selectedMenu, setSelectedMenu] = useState("내 프로젝트");

    return (
        <div className="workspace">
            <aside className="workspace__sidebar">
                <nav className="workspace__sidebar-menu">
                    <div className="workspace__user">
                        <div className="workspace__account">
                            <div className="workspace__profile-circle">
                                {nickname?.charAt(0) || "U"}
                            </div>

                            <span className="workspace__nickname">
                                {nickname || "사용자"}
                            </span>
                            <ChevronDown 
                            className="workspace__account-chevron"
                            size={10} 
                            strokeWidth={2} 
                            />
                        </div>
                        <button
                            type="button"
                            className="workspace__notification-button"
                            aria-label="알림 확인"
                        >
                            <Bell size={20} strokeWidth={1.8} />
                        </button>
                    </div>
                    <button
                        type="button"
                        className="workspace__menu-button active"
                    >
                        <StickyNote size={16} strokeWidth={1} />
                        내 프로젝트
                    </button>

                    <button
                        type="button"
                        className="workspace__menu-button"
                    >
                        <UsersRound size={16} strokeWidth={1} />
                        커뮤니티
                    </button>

                    <button
                        type="button"
                        className="workspace__menu-button"
                    >
                        <Trash2 size={16} strokeWidth={1} />
                        휴지통
                    </button>
                </nav>
            </aside>

            <main className="workspace__main">
                <header className="workspace__header">
                    <div>
                        <p className="workspace__eyebrow">
                            {selectedMenu}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="workspace__create-button"
                        onClick={onCreateProject}
                    >
                        <span className="workspace__create-icon">
                            <PenTool  className="icon-default" size={12} strokeWidth={2} />
                            <Plus className="icon-hover" size={12} strokeWidth={2} />
                        </span>                  
                        새 프로젝트
                    </button>
                </header>

                <section className="workspace__content">
                    <Project onProjectSelect={onProjectSelect} />
                </section>
            </main>
        </div>
    );
}