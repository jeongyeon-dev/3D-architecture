import Project from "../project/Project.jsx";
import "./Workspace.css";

export default function Workspace({
    onProjectSelect,
    onCreateProject,
}) {
    return (
        <div className="workspace">
            <aside className="workspace__sidebar">
                <nav className="workspace__sidebar-menu">
                    <button
                        type="button"
                        className="workspace__menu-button active"
                    >
                        내 프로젝트
                    </button>

                    <button
                        type="button"
                        className="workspace__menu-button"
                    >
                        커뮤니티
                    </button>

                    <button
                        type="button"
                        className="workspace__menu-button"
                    >
                        휴지통
                    </button>
                </nav>

                <div className="workspace__user">
                    내 계정
                </div>
            </aside>

            <main className="workspace__main">
                <header className="workspace__header">
                    <div>
                        <p className="workspace__eyebrow">
                            Workspace
                        </p>

                        <h1>내 프로젝트</h1>
                    </div>

                    <button
                        type="button"
                        className="workspace__create-button"
                        onClick={onCreateProject}
                    >
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