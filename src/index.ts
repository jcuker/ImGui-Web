import ImGuiWeb from './ImGuiWeb';
import { constructSizeType } from './ImGuiHelpers';

window.onload = () => {
    const ImGuiInstance = new ImGuiWeb('root', { x: 100, y: 100 }, false);

    // TODO - clean up these variables
    let playing = true;
    let fps = 0;
    let framesThisSecond = 0;
    let lastFpsUpdate = 0;
    let lastFrameTimeMs = 0;
    const maxFPS = 10; // The maximum FPS we want to allow

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

        if (playing) {
            ImGuiInstance.begin();
            ImGuiInstance.beginStack({
                id: 'vStack',
                height: constructSizeType(50, 'px'),
                width: constructSizeType(50, 'px'),
                orientation: 'vertical',
                backgroundColor: '#eee'
            });
            ImGuiInstance.rect({
                height: constructSizeType(25, 'px'),
                width: constructSizeType(25, 'px'),
                id: 'test',
                backgroundColor: 'red'
            });
            ImGuiInstance.rect({
                height: constructSizeType(25, 'px'),
                width: constructSizeType(25, 'px'),
                id: 'test1',
                backgroundColor: 'blue'
            });
            ImGuiInstance.endStack();
            ImGuiInstance.end();
            fpsDisplay.textContent = Math.round(fps) + ' FPS'; // display the FPS
        }

        requestAnimationFrame(mainLoop);
    }

    // Start things off
    requestAnimationFrame(mainLoop);
}

