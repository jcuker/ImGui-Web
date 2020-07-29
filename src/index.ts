import * as Stats from 'stats.js';
import ImGuiWeb from './ImGui/ImGuiWeb';
import { ImRectElementParams } from './ImGui/Elements/ImRectElement';
import { constructSizeType } from './ImGui/Utils/ImGuiHelpers';
import { ImElement } from './ImGui/Elements/ImElement';

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
    const ImGuiInstance = new ImGuiWeb('root', { x: 100, y: 100 });

    const stats = setUpStats();

    let playing = false;
    let redFirst = true;

    const playbackControl = document.getElementById('playbackControl');
    playing ? playbackControl.textContent = 'Pause' : playbackControl.textContent = 'Play';
    playbackControl.onclick = () => {
        playing = !playing;
        playing ? playbackControl.textContent = 'Pause' : playbackControl.textContent = 'Play';
    }

    function mainLoop(timestamp: number) {
        // TODO - explore framerate throttling
        stats.begin();

        const redRectParams: ImRectElementParams = {
            height: constructSizeType(25, 'px'),
            width: constructSizeType(25, 'px'),
            id: 'red',
            backgroundColor: 'red'
        };

        const blueRectParams: ImRectElementParams = {
            height: constructSizeType(25, 'px'),
            width: constructSizeType(25, 'px'),
            id: 'blue',
            backgroundColor: 'blue'
        };

        const greenRectParams: ImRectElementParams = {
            height: constructSizeType(25, 'px'),
            width: constructSizeType(25, 'px'),
            backgroundColor: 'green',
            id: 'green'
        };

        if (playing) {
            ImGuiInstance.begin();

            ImGuiInstance.beginStack({
                id: 'hStack',
                height: constructSizeType(50, 'px'),
                width: constructSizeType(50, 'px'),
                orientation: 'vertical'
            });

            ImGuiInstance.beginStack({
                id: 'nested-hStack',
                height: constructSizeType(25, 'px'),
                width: constructSizeType(50, 'px'),
                orientation: 'horizontal',
                backgroundColor: '#eee',
                onClick: (element: ImElement) => {
                    redFirst = !redFirst;
                }
            });

            // shows how interactivity can be accomplished
            if (redFirst) {
                ImGuiInstance.rect(redRectParams);
                ImGuiInstance.rect(blueRectParams);
            } else {
                ImGuiInstance.rect(blueRectParams);
                ImGuiInstance.rect(redRectParams);
            }

            ImGuiInstance.endStack();

            ImGuiInstance.rect(greenRectParams);

            ImGuiInstance.endStack();
            ImGuiInstance.end();
            stats.end();
        }

        requestAnimationFrame(mainLoop);
    }

    // Start things off
    requestAnimationFrame(mainLoop);
}