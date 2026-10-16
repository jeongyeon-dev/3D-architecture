import './EditorBottomToolbar.css';
import { useState } from "react";

import { 
    Box,
    Triangle,
    LayoutGrid,
    Square,
    Trash2,
    PenLine,
    Diamond
} from "lucide-react";

const rightTools = [
    { id: 'bulldoze', buttonId: 'button-bulldoze', label: '철거', icon: Trash2 },
    { id: 'platform', buttonId: 'button-platform', label: '플랫폼', icon: Box },
    { id: 'wall', buttonId: 'button-brick', label: '벽', icon: Square },
    { id: 'floor', buttonId: 'button-floor', label: '바닥', icon: Diamond },
    { id: 'roof', buttonId: 'button-roof', label: '지붕', icon: Triangle },
    { id: 'window', buttonId: 'button-window', label: '창문', icon: LayoutGrid },
    { id: 'editor', buttonId: 'button-editor', label: '편집기', icon: PenLine }
];

export default function EditorBottomToolbar({simulatorRef}) {
    /* 현재 활성화된 도구를 저장 */
    const [activeToolId, setActiveToolId] = useState('bulldoze');

    /* 활성화된 도구 ID를 three.js 측에 전달 */
    function selectTool(toolId) {
        setActiveToolId(toolId);
        simulatorRef.current?.setActiveToolId(toolId);
    }

    return (
        <div className="editor-bottom-toolbar">
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
                    <span className="tool-label">
                        {label}
                    </span>
                </button>
            ))}
        </div>
    );
}
