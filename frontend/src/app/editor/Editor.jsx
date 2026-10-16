/* 에디터 화면이 보여지는 곳, three.js를 호출 */
import "./Editor.css";

import { useEffect, useRef, useState } from "react";
import { saveProject, getProject } from "../../api/project.js";

import { createSimulator } from "../../three/editor/simulator.js";
import { getAllObjects } from "../../three/project/project-state.js";

import FloorSelector from "../../components/toolbars/toolbar/ToolBar.jsx";
import EditorBottomToolbar from "../../components/toolbars/editor-bottom-toolbar/EditorBottomToolbar.jsx";
import EditorLeftToolBar from "../../components/toolbars/editor-left-toolbar/EditorLeftToolBar.jsx";



export default function Editor({ projectId }) {
    const [floor, setFloor] = useState(1);
    const simulatorRef = useRef(null);


    /* 프로젝트 id 기반하여 기존 오브젝트 불러오기 */
    useEffect(() => {
        async function initializeProject() {
            try {
                const project = await getProject(projectId);
                const projectObjects = project.objects ?? [];

                simulatorRef.current = createSimulator({
                    projectObjects
                });

                window.simulator = simulatorRef.current;
            } catch (error) {
                console.error("프로젝트 로딩 실패: ", error);
            }
        }

        initializeProject();
    }, [projectId]);

    useEffect(() => {
        simulatorRef.current?.setFloor(floor);
    }, [floor]);

    async function handleSaveProject() {
        try {
            const objects = getAllObjects();
            await saveProject(projectId, objects);

        } catch (error) {
            console.error(error);
        }
    }


    return (
        <div id="root-window" className="editor-window">
            <div id="render-target"/>
                <EditorBottomToolbar 
                    simulatorRef={simulatorRef}
                />
                <EditorLeftToolBar />

                <FloorSelector
                    floor={floor}
                    onFloorChange={setFloor}
                />
                <button
                    className="save-project-button"
                    onClick={handleSaveProject}
                >
                저장하기
                </button>
        </div>
    );
}



