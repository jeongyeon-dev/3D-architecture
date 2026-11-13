import './EditorBottomToolbar.css';
import { useState } from 'react';
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

export default function EditorBottomToolbar({ simulatorRef, floor, onFloorChange }) {
    const [activeToolId, setActiveToolId] = useState('bulldoze');

    /* 편집 권한에 따라 가능 여부 로직을 작성해야 함 */


    function selectTool(toolId) {
        setActiveToolId(toolId);
        simulatorRef.current?.setActiveToolId(toolId);
    }

    return (
        <div className="editor-bottom-toolbar">
            <div className="tool-button-group">
                {rightTools.map(({ id, buttonId, label, icon: Icon }) => (
                    <button
                        key={id}
                        id={buttonId}
                        aria-label={label}
                        className={`ui-button ${
                            activeToolId === id ? 'selected' : ''
                        }`}
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
