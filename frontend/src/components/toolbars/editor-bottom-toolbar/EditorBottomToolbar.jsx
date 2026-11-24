import './EditorBottomToolbar.css';
import { useState, useEffect } from 'react';
import { getAuthority } from '../../../api/project';

import {
    Box,
    Triangle,
    LayoutGrid,
    Square,
    Trash2,
    PenLine,
    Diamond,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const rightTools = [
    { id: 'bulldoze', buttonId: 'button-bulldoze', label: '철거', icon: Trash2 },
    { id: 'platform', buttonId: 'button-platform', label: '플랫폼', icon: Box },
    { id: 'wall', buttonId: 'button-brick', label: '벽', icon: Square },
    { id: 'floor', buttonId: 'button-floor', label: '바닥', icon: Diamond },
    { id: 'roof', buttonId: 'button-roof', label: '지붕', icon: Triangle },
    { id: 'window', buttonId: 'button-window', label: '창문', icon: LayoutGrid },
    { id: 'editor', buttonId: 'button-editor', label: '편집기', icon: PenLine }
];

export default function EditorBottomToolbar({ simulatorRef, floor, onFloorChange, projectId }) {
    const [activeToolId, setActiveToolId] = useState('bulldoze');

    /* 해당 프로젝트 편집 권한 보관하기 */
    const [authority, setAuthority] = useState(null);

    
    const canEdit = authority === 'OWNER' || authority === 'EDITOR';

    /* 로드 초반에 권한 확인 후 바닥 툴 바 회색 처리 여부 결정한다 */
    useEffect(() => {
        async function loadAuthority() {
            try {
                const role = await getAuthority(projectId);
                setAuthority(role);
            } catch (error) {
                console.error(error);
                setAuthority('NONE');
            }
        }

        loadAuthority();
    }, [projectId]);


    function selectTool(toolId) {
        if (!canEdit) return;

        setActiveToolId(toolId);
        simulatorRef.current?.setActiveToolId(toolId);
    }

    return (
        <div className="editor-bottom-toolbar">
            {/* 편집 가능 여부에 따라 blurr 처리가 된다 */}
            <div className="tool-button-group">
                {rightTools.map(({ id, buttonId, label, icon: Icon }) => (
                    <button
                        key={id}
                        id={buttonId}
                        aria-label={label}
                        aria-disabled={!canEdit}
                        className={`ui-button ${
                            activeToolId === id ? 'selected' : ''
                        } ${!canEdit ? 'is-readonly' : ''}`}
                        onClick={() => selectTool(id)}
                    >
                        <Icon size={18} strokeWidth={1} />
                        <span className="tool-label">{label}</span>
                    </button>
                ))}
            </div>

            <div className="toolbar-divider" />

            <div className="floor-control">
                <div className="floor-arrows">
                    <button
                        className="floor-arrow-button"
                        aria-label="층 올리기"
                        onClick={() => onFloorChange((current) => current + 1)}
                    >
                        <ChevronUp size={16} strokeWidth={1} />
                    </button>
                    <button
                        className="floor-arrow-button"
                        aria-label="층 내리기"
                        onClick={() => onFloorChange((current) => Math.max(1, current - 1))}
                    >
                        <ChevronDown size={16} strokeWidth={1} />
                    </button>
                </div>
                <span>{floor}F</span>
            </div>
        </div>
    );
}
