import { ImRectElementParams, ImElement } from "../Elements";
import { constructSizeType } from "../Utils/ImGuiHelpers";
import ImGuiWeb from "../ImGuiWeb";

let redFirst: boolean = false;

export function onClickSwitch(ImGuiInstance: ImGuiWeb) {
    const redRectParams: ImRectElementParams = {
        height: constructSizeType(75, 'px'),
        width: constructSizeType(75, 'px'),
        id: 'red',
        backgroundColor: 'red'
    };

    const blueRectParams: ImRectElementParams = {
        height: constructSizeType(75, 'px'),
        width: constructSizeType(75, 'px'),
        id: 'blue',
        backgroundColor: 'blue'
    };

    const greenRectParams: ImRectElementParams = {
        height: constructSizeType(75, 'px'),
        width: constructSizeType(75, 'px'),
        backgroundColor: 'green',
        id: 'green'
    };

    ImGuiInstance.beginStack({
        id: 'hStack',
        height: constructSizeType(200, 'px'),
        width: constructSizeType(200, 'px'),
        orientation: 'vertical'
    });

    ImGuiInstance.beginStack({
        id: 'nested-hStack',
        height: constructSizeType(75, 'px'),
        width: constructSizeType(200, 'px'),
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
}