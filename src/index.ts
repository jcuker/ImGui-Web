import ImGuiWeb from './ImGuiWeb';
import { constructSizeType } from './ImGuiHelpers';
import { ImElement, ImRectElementParams } from './ImGuiWebTypes';
import ImGui from './ImGuiWeb';

window.onload = () => {
    const ImGuiInstance = new ImGuiWeb('root', { x: 100, y: 100 }, false);

    // TODO - clean up these variables
    let playing = true;
    let fps = 0;
    let framesThisSecond = 0;
    let lastFpsUpdate = 0;
    let lastFrameTimeMs = 0;
    const maxFPS = 10; // The maximum FPS we want to allow

    let redFirst = true;


    const playbackControl = document.getElementById('playbackControl');
    const fpsDisplay = document.getElementById('fpsDisplay');
    playbackControl.onclick = () => {
        playing = !playing;
    }

    function mainLoop(timestamp: any) {
        // Throttle the frame rate.    
        if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
            requestAnimationFrame(mainLoop);
            return;
        }
        lastFrameTimeMs = timestamp;

        if (timestamp > lastFpsUpdate + 1000) {
            fps = 0.25 * framesThisSecond + 0.75 * fps;

            lastFpsUpdate = timestamp;
            framesThisSecond = 0;
        }
        framesThisSecond++;

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

        if (playing) {
            ImGuiInstance.begin();

            ImGuiInstance.beginStack({
                id: 'hStack',
                height: constructSizeType(50, 'px'),
                width: constructSizeType(50, 'px'),
                orientation: 'horizontal',
                backgroundColor: '#eee',
                onClick: (element: ImElement) => {
                    console.log('clicked ' + element.id);
                    redFirst = !redFirst;
                }
            });

            if (redFirst) {
                ImGuiInstance.rect(redRectParams);
                ImGuiInstance.rect(blueRectParams);
            } else {
                ImGuiInstance.rect(blueRectParams);
                ImGuiInstance.rect(redRectParams);
            }

            ImGuiInstance.endStack();
            ImGuiInstance.end();
            fpsDisplay.textContent = Math.round(fps) + ' FPS'; // display the FPS
        }

        requestAnimationFrame(mainLoop);
    }

    // Start things off
    requestAnimationFrame(mainLoop);
}

