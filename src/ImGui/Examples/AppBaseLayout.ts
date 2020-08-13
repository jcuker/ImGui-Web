import { ImStackParams } from "../Elements";
import { SizeType } from "../ImGuiWebTypes";
import ImGuiWeb from "../ImGuiWeb";
import { constructSizeType, getRandomColor } from "../Utils/ImGuiHelpers";

let appBackgroundColor = 'blue';

export function appBaseLayout(imguiInstance: ImGuiWeb, height: SizeType, width: SizeType) {
    const appParams: ImStackParams = {
        id: 'app',
        height,
        width,
        orientation: 'vertical',
        margin: {
            top: constructSizeType(15, 'px'),
            bottom: constructSizeType(0, 'px'),
            left: constructSizeType(15, 'px'),
            right: constructSizeType(0, 'px')
        }
    }

    imguiInstance.beginStack(appParams);
    topBar(imguiInstance, height, width);
    appSpace(imguiInstance, height, width);
    bottomBar(imguiInstance, height, width);
    imguiInstance.endStack();
}

function topBar(imguiInstance: ImGuiWeb, height: SizeType, width: SizeType) {
    const topBarParams: ImStackParams = {
        id: 'topBar',
        height: constructSizeType(height.val * .1, height.unit),
        width,
        orientation: 'horizontal',
        backgroundColor: 'red',
    }

    imguiInstance.beginStack(topBarParams);
    imguiInstance.rect({
        height: 25,
        width: 25,
        id: 'hamburger',
        backgroundColor: 'teal',
        hAlign: 'CENTER',
        vAlign: 'CENTER',
        margin: {
            left: 0,
            right: 5,
            top: 0,
            bottom: 0
        }
    });

    imguiInstance.rect({
        height: 25,
        width: 25,
        id: 'www',
        backgroundColor: 'teal',
        hAlign: 'CENTER',
        vAlign: 'CENTER',
        margin: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        }
    });
    imguiInstance.endStack();
}

function appSpace(imguiInstance: ImGuiWeb, height: SizeType, width: SizeType) {

    const appSpaceParams: ImStackParams = {
        id: 'appSpace',
        height: constructSizeType(height.val * .8, height.unit),
        width,
        orientation: 'vertical',
        backgroundColor: appBackgroundColor,
        onClick: () => {
            appBackgroundColor = getRandomColor();
        }
    }

    imguiInstance.beginStack(appSpaceParams);
    imguiInstance.endStack();
}

function bottomBar(imguiInstance: ImGuiWeb, height: SizeType, width: SizeType) {
    const bottomBarParams: ImStackParams = {
        id: 'bottomBar',
        height: constructSizeType(height.val * .1, height.unit),
        width,
        orientation: 'horizontal',
        backgroundColor: 'black',
    }

    imguiInstance.beginStack(bottomBarParams);
    imguiInstance.endStack();
}