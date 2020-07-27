import ImGuiWeb from './ImGuiWeb';
import { constructSizeType } from './ImGuiHelpers';
import { ImElement, ImRectElementParams } from './ImGuiWebTypes';
import * as Stats from 'stats.js';

window.onload = () => {
    const ImGuiInstance = new ImGuiWeb('root', { x: 100, y: 100 }, true);
    const fpsDisplay = document.getElementById('fpsDisplay');

    //@ts-ignore
    var stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    const statsDom: HTMLCanvasElement = stats.dom;
    statsDom.style.position = null;
    fpsDisplay.appendChild(statsDom);

    // TODO - clean up these variables
    let playing = false;
    let fps = 0;
    let framesThisSecond = 0;
    let lastFpsUpdate = 0;
    let lastFrameTimeMs = 0;
    const maxFPS = 80; // The maximum FPS we want to allow

    let redFirst = true;


    const playbackControl = document.getElementById('playbackControl');
    playbackControl.onclick = () => {
        playing = !playing;
    }

    function mainLoop(timestamp: any) {
        // // Throttle the frame rate.    
        // if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
        //     requestAnimationFrame(mainLoop);
        //     return;
        // }
        stats.begin();
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
                orientation: 'vertical'
            });

            ImGuiInstance.beginStack({
                id: 'nested-hStack',
                height: constructSizeType(25, 'px'),
                width: constructSizeType(50, 'px'),
                orientation: 'horizontal',
                backgroundColor: '#eee',
                onClick: (element: ImElement) => {
                    console.log('clicked ' + element.id);
                    redFirst = !redFirst;
                    console.log('setting redFirst to :', redFirst);
                }
            });

            if (redFirst) {
                console.log('red first!');
                ImGuiInstance.rect(redRectParams);
                ImGuiInstance.rect(blueRectParams);
            } else {
                console.log('blue first')
                ImGuiInstance.rect(blueRectParams);
                ImGuiInstance.rect(redRectParams);
            }

            ImGuiInstance.endStack();

            ImGuiInstance.rect({
                height: constructSizeType(25, 'px'),
                width: constructSizeType(25, 'px'),
                backgroundColor: 'green',
                id: 'green'
            });

            ImGuiInstance.endStack();
            ImGuiInstance.end();
            stats.end();
            // fpsDisplay.textContent = Math.round(fps) + ' FPS'; // display the FPS
        }

        requestAnimationFrame(mainLoop);
    }

    // Start things off
    requestAnimationFrame(mainLoop);
}

