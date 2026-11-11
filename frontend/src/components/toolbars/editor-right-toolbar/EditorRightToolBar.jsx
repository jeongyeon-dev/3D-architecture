import './EditorRightToolBar.css';

import { useState, useEffect } from "react";

import { getNicknameFromToken } from  "../../../utils/jwt.js";
import { getMembers, searchMembers } from '../../../api/project-members.js';

import { 
    ChevronDown,
    Search
} from "lucide-react";


export default function EditorRightToolBar({ projectId }) {
    const nickname = getNicknameFromToken();
    const [ activePanel, setActivePanel ] = useState(null);

    /* 현 프로젝트 맴버 보기용 */
    const [ members, setMembers ] = useState([]);

    /* 유저 검색용 */
    const [keyword, setKeyword] = useState("");
    const [searchedMembers, setSearchedMembers ] = useState([]);

    
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


    /* 유저를 검색하는 함수: 입력 텍스트 변할 때만 trigger */
    useEffect(() => {
        const trimmedKeyword = keyword.trim();
        if (trimmedKeyword.length < 2) {
            setSearchedMembers([]);
            return;
        }
        const timer = setTimeout(async () => {
            const result = await searchMembers(trimmedKeyword);
            setSearchedMembers(result);
        }, 300);
        return () => clearTimeout(timer);
    }, [keyword]);
    
    return (
        <aside className="editor-right-toolbar">
            <section className="toolbar-intro-right">
                <div className="toolbar__user">
                    {/* 첫 번째 row */}
                    <div className="workspace__user">
                        <div className="toolbar__account">
                            <div className="workspace__profile-group">
                                <div 
                                    className="workspace__profile-circle"
                                    style={{ backgroundColor: getProfileColor(nickname) }}
                                >
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
                                onClick={() =>{
                                    togglePanel("search");
                                }}
                            >
                                공유하기
                            </button>
                        </div>
                    </div>
                </div >
                {/* 두 번째 row: 아코디언 애니메이션 도입 */}
                <div
                    className={`toolbar__panel ${
                        activePanel ? "is-open" : ""
                    }`}
                >
                    {activePanel === "members" && (
                        <div className="toolbar__members-panel">
                            {members.map((member) =>(
                                <div
                                    className="toolbar__members"
                                    key={member.user_id}
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

                    {activePanel === "search" && (
                        <div className="search-panel">
                            <div className="search-field">
                                <Search
                                    className="search-field__icon"
                                    size={16}
                                    strokeWidth={1.5}
                                />
                                <input
                                    type="text"
                                    placeholder="검색하기"
                                    value={keyword}
                                    onChange={(event) => setKeyword(event.target.value)}
                                />
                            </div>
                            {/* 검색된 결과(유저 목록)이 list로 display */}
                                <div className="toolbar__members-panel-two">
                                    {searchedMembers.slice(0, 10).map((member) => (
                                    <div
                                        className="toolbar__members"
                                        key={member.user_id}
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
                                        <button
                                            type="button"
                                            className="toolbar__member-invite"
                                        >
                                            초대하기
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                    )}
                </div>
            </section>
        </aside>
    );
}
