/* 에디터 화면이 보여지는 곳, three.js를 호출 */
import "./Editor.css";

import { useEffect, useRef, useState } from "react";
import { saveProject, getProject } from "../../api/project.js";

import { createSimulator } from "../../three/editor/simulator.js";
import { getAllObjects } from "../../three/project/project-state.js";

/* 소켓 api 발신 부분 */
import { 
    connectProjectSocket,
    disconnectProjectSocket,
    sendSocketMessage
} from "../../collaboration/project-socket.js";

/* 오브젝트 동기화 발신 부분 */
import { 
    sendObjectDragStart,
    sendObjectTransform,
    sendObjectDragEnd
} from "../../collaboration/object-sync.js";

/* 에디터 화면 구성요소 */
import EditorBottomToolbar from "../../components/toolbars/editor-bottom-toolbar/EditorBottomToolbar.jsx";
import EditorLeftToolBar from "../../components/toolbars/editor-left-toolbar/EditorLeftToolBar.jsx";
import EditorRightToolBar from "../../components/toolbars/editor-right-toolbar/EditorRightToolBar.jsx";


/* 여기가 실제 프로젝트 화면이 열리는 에디터 부분 */
export default function Editor({ projectId }) {
    const [floor, setFloor] = useState(1);
    const simulatorRef = useRef(null);
    const socketRef = useRef(null);

    /* 백에서 불러오 프로젝트 및 관련 정보들 */
    const [projectTitle, setProjectTitle] = useState("");
    const [nickname, setNickname] = useState("");

    /* 소켓 열기: 에디터 진입 시 바로 */
    useEffect(() => {
        /* 여기가 소켓 연결부 */
        async function connectSocket() {
            socketRef.current = await connectProjectSocket(
                projectId,
                (message) => {
                    /** 여기는 서버 => 클라 수신하는 접합부 **/

                    /* 소켓에서 받은 상대 마우스 커서를 three 쪽으로 보낸다 */
                    switch (message.type) {  
                        case "CURSOR_MOVE":
                            simulatorRef.current?.updateRemoteCursor(message);
                            break;
                        case "USER_JOIN":
                            simulatorRef.current?.addRemoteCursor(message);
                            break;
                        case "USER_LEAVE":
                            simulatorRef.current?.removeRemoteCursor(message);
                            break;

                        /* 오브젝트 동기화 수신 */
                        case "OBJECT_DRAG_START":
                            simulatorRef.current?.receiveObjectDragStart(message);
                            break;
                        case "OBJECT_TRANSFORM":
                            simulatorRef.current?.receiveObjectTransform(message);
                            break;
                        case "OBJECT_DRAG_END":
                            simulatorRef.current?.receiveObjectDragEnd(message);
                            break;

                        /* 오브젝트 LOCK으로 접근 실패 시 */
                        case "OBJECT_LOCK_DENIED":
                            simulatorRef.current?.receiveObjectLockDenied(message);
                            break;
                    }
                }
            );
        }

        connectSocket();

        /* 나가면 닫힘 */
        return () => {
            disconnectProjectSocket(); 
            socketRef.current = null;
        };
    }, [projectId]);

    /* 프로젝트 id 기반하여 기존 오브젝트 불러오기 */
    useEffect(() => {
        async function initializeProject() {
            try {
                const project = await getProject(projectId);
                const projectObjects = project.objects ?? [];

                setProjectTitle(project.title);

                simulatorRef.current = createSimulator({
                    projectObjects,
                    /** 여기는 클라 => 서버로 발신하는 접합부 **/
                    
                    /* 여기서 마우스 감지 => 소켓 전송 기능 구체화 */
                    onCursorGridChange: ({ gridX, gridZ, gridY }) => {
                        sendSocketMessage({
                            type: "CURSOR_MOVE",
                            projectId,
                            gridX,
                            gridZ,
                            gridY,
                        });
                    },

                    /* 오브젝트 동기화 발신 함수 */
                    onObjectDragStart: ({ objectId }) => {
                        sendObjectDragStart(projectId, objectId);
                    },
                    onObjectTransform: ({ objectId, data }) => {
                        sendObjectTransform(projectId, objectId, data);
                    },
                    onObjectDragEnd: ({ objectId, data }) => {
                        sendObjectDragEnd(projectId, objectId, data);
                    },
                });

                window.simulator = simulatorRef.current;
            } catch (error) {
                console.error("프로젝트 로딩 실패: ", error);
            }
        }

        initializeProject();
    }, [projectId]);

    /* 바닥 설정하기 */
    useEffect(() => {
        simulatorRef.current?.setFloor(floor);
    }, [floor]);



    /* 프로젝트 저장하기 */
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
                    floor={floor}
                    onFloorChange={setFloor}
                />
                <EditorLeftToolBar />
                <EditorRightToolBar 
                    projectId={projectId}
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





