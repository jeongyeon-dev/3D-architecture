import './EditorRightToolBar.css';

import { useState } from "react";

import { getNicknameFromToken } from  "../../../utils/jwt.js";
import { getMembers } from '../../../api/project-members.js';

import { 
    ChevronDown
} from "lucide-react";


export default function EditorRightToolBar({ projectId }) {
    const nickname = getNicknameFromToken();

    const [ members, setMembers ] = useState([]);
    const [ activePanel, setActivePanel ] = useState(null);

    /* 현재 활성화된 두 번째 row의 패널 */
    function togglePanel(panelName) {
        setActivePanel((current) =>
            current === panelName ? null : panelName
        );
    }

    /* 클릭 시 => 현재 맴버가 보여짐 */
    async function handleProjectMemberClick(projectId) {
        try {
            const projectMembers = await getMembers(projectId);    
            setMembers(projectMembers)
        } catch (error) {
            console.error(error);
        }
    }

    /* 영어 권한 => 한글로 */
    function getRoleLabel(role) {
        const roleLabels = {
            OWNER: "소유자",
            EDITOR: "편집자",
            VIEWER: "열람자",
        };

        return roleLabels[role?.toUpperCase()] ?? role;
    }

    /* 프로필 색상 랜덤하게 주는 함수 */
    function getProfileColor(nickname = "") {
        const colors = [
            "#ff4444",
            "#0d99ff",
            "#8b5cf6",
            "#22a06b",
            "#f59e0b",
        ];

        const sum = [...nickname].reduce(
            (total, character) => total + character.charCodeAt(0),
            0
        );

        return colors[sum % colors.length];
    }
    
    return (
        <aside className="editor-right-toolbar">
            <section className="toolbar-intro-right">
                <div className="toolbar__user">
                    {/* 첫 번째 row */}
                    <div className="workspace__user">
                        <div className="toolbar__account">
                            <div className="workspace__profile-group">
                                <div className="workspace__profile-circle">
                                    {nickname?.charAt(0) || "U"}
                                </div>
                                <span className="workspace__chevron-circle">
                                    <ChevronDown 
                                        className="workspace__chevron-arrow"
                                        size={10} 
                                        strokeWidth={2} 
                                    />
                                </span>
                            </div>


                        </div>
                        {/* 우측 툴 바 버튼 묶음 */}
                        <div className="toolbar__button-group">
                            <button 
                                type="button"
                                className="toolbar_manage-button"
                                onClick={() => {
                                    handleProjectMemberClick(projectId);
                                    togglePanel("members");
                                }}
                            >
                                팀원 보기
                            </button>
                            <button
                                type="button"
                                className="toolbar__share-button"
                                aria-label="알림 확인"
                            >
                                공유하기
                            </button>
                        </div>
                    </div>
                </div >
                {/* 두 번째 row */}
                <div className="toolbar__panel">
                    {activePanel === "members" && (
                        <div className="toolbar__members-panel">
                            {members.map((member) =>(
                                <div
                                    className="toolbar__members"
                                    key={member.nickname}
                                >
                                    <div className="toolbar__member-nickname">
                                        <div 
                                            className="toolbar__member__profile-circle"
                                            style={{ backgroundColor: getProfileColor(member.nickname) }}
                                        >
                                            {nickname?.charAt(0) || "U"}
                                        </div>
                                        <span className="toolbar__member-nickname-text">
                                            {member.nickname}
                                        </span>            
                                    </div>
                                    <span className="toolbar__member-role">
                                        {getRoleLabel(member.role)}
                                    </span>
                                </div>

                            ))}
                        </div>
                    )}
                </div>
            </section>
        </aside>
    );
}
