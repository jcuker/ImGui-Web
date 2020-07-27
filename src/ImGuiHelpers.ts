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

export function childrenTheSame(a: ImElement[], b: ImElement[]): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.

    for (var i = 0; i < a.length; ++i) {
        if (a[i].id !== b[i].id) return false;
    }

    return true;
}