import { useState } from "react";
import "./ToolBar.css";

function FloorSelector({ floor, onFloorChange }) {
    const increaseFloor = () => {
        onFloorChange(prev => prev + 1);
    };

    const decreaseFloor = () => {
        onFloorChange(prev => Math.max(1, prev - 1));
    };

    return (
        <div className="floor-selector">
            <button id="floor-button" onClick={increaseFloor}>
                ▲
            </button>

            <div className="floor-display">
                {floor}F
            </div>

            <button id="floor-button" onClick={decreaseFloor}>
                ▼
            </button>
        </div>
    );
}

export default FloorSelector;