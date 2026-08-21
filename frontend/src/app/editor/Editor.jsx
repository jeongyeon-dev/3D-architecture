import { useEffect, useRef, useState } from "react";
import { createSimulator } from "../../three/editor/simulator.js";
import FloorSelector from "../../components/ToolBar.jsx";

const rightTools = [
    { id: 'bulldoze', buttonId: 'button-bulldoze', label: '철거' },
    { id: 'platform', buttonId: 'button-platform', label: '플랫폼' },
    { id: 'wall', buttonId: 'button-brick', label: '벽' },
    { id: 'floor', buttonId: 'button-floor', label: '바닥' }
];

export default function Editor() {
    const [floor, setFloor] = useState(1);
    const simulatorRef = useRef(null);
    const [activeToolId, setActiveToolId] = useState('bulldoze');

    useEffect(() => {
        simulatorRef.current = createSimulator();
        window.simulator = simulatorRef.current;
    }, []);

    useEffect(() => {
        simulatorRef.current?.setFloor(floor);
    }, [floor]);

    function selectTool(toolId) {
        setActiveToolId(toolId);
        simulatorRef.current?.setActiveToolId(toolId);
    }

    return (
        <div id="root-window">
            <div id="render-target">
                <div id="ui-toolbar">
                    {rightTools.map(({ id, buttonId, label }) => (
                        <button
                            key={id}
                            id={buttonId}
                            className={`ui-button ${
                                activeToolId === id ? 'selected' : ''
                            }`}
                            onClick={() => selectTool(id)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <FloorSelector
                    floor={floor}
                    onFloorChange={setFloor}
                />
            </div>
        </div>
    );
}