import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

export function createLabelRenderer(container, width, height) {
    const labelRenderer = new CSS2DRenderer();

    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.inset = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';

    container.appendChild(labelRenderer.domElement);

    return labelRenderer;
}