import { SizeUnit, SizeType, ImElement } from "./ImGuiWebTypes";

export const constructSizeType = (val: number, unit: SizeUnit): SizeType => ({ val, unit });

export const constructSyleString = (element: ImElement): string => {
    let styleStr = `height: ${element.height.val}${element.height.unit}; width: ${element.width.val}${element.width.unit};position: absolute;`;

    styleStr += `top: ${element.absRect.y1}px;`;
    styleStr += `left: ${element.absRect.x1}px;`;
    styleStr += `right: ${element.absRect.x2}px;`;
    styleStr += `bottom: ${element.absRect.y2}px;`;

    if (element.backgroundColor) {
        styleStr += `background: ${element.backgroundColor};`;
    }

    if (element.styleStr) styleStr += element.styleStr;

    return styleStr;
}