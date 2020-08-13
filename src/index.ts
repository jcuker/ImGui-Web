import * as Stats from 'stats.js';
import ImGuiWeb from './ImGui/ImGuiWeb';
import { onClickSwitch } from './ImGui/Examples/OnClickSwitch';
import { appBaseLayout } from './ImGui/Examples/AppBaseLayout';
import { constructSizeType } from './ImGui/Utils/ImGuiHelpers';

// TODO - type stats
function setUpStats(): any {
    const fpsDisplay = document.getElementById('fpsDisplay');

    //@ts-ignore
    // TODO - wrap stats up more nicely
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    const statsDom: HTMLCanvasElement = stats.dom;
    statsDom.style.position = null;
    fpsDisplay.appendChild(statsDom);
    return stats;
}

window.onload = () => {
    const height = 1000;
    const width = 1000;

    const ImGuiInstance = new ImGuiWeb('root', { x: width, y: height });

    const stats = setUpStats();

    let playing = true;

    const playbackControl = document.getElementById('playbackControl');
    playing ? playbackControl.textContent = 'Pause' : playbackControl.textContent = 'Play';
    playbackControl.onclick = () => {
        playing = !playing;
        playing ? playbackControl.textContent = 'Pause' : playbackControl.textContent = 'Play';
    }

    function mainLoop(timestamp: number) {
        // TODO - explore framerate throttling
        stats.begin();

        if (playing) {

            ImGuiInstance.begin();
            appBaseLayout(ImGuiInstance, constructSizeType(height / 2, 'px'), constructSizeType(width / 2, 'px'));
            // onClickSwitch(ImGuiInstance);
            ImGuiInstance.end();

        }
        stats.end();

        requestAnimationFrame(mainLoop);
    }

    // Start things off
    requestAnimationFrame(mainLoop);
}