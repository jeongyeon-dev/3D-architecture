import './EditorRightToolBar.css';

import { getNicknameFromToken } from  "../../../utils/jwt.js";

import { 
    ChevronDown
} from "lucide-react";

export default function EditorRightToolBar() {
    const nickname = getNicknameFromToken();
    
    return (
        <aside className="editor-right-toolbar">
            <section className="toolbar-intro-right">
                <div className="toolbar__user">
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
                        <button
                            type="button"
                            className="toolbar__share-button"
                            aria-label="알림 확인"
                        >
                            공유하기
                        </button>
                    </div>

                </div>
            </section>
        </aside>
    );
}
