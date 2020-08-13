import { ImElement } from "../Elements/ImElement";
import { SizeUnit, SizeType, ImMargin } from "../ImGuiWebTypes";

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

    for (var i = 0; i < a.length; ++i) {
        if (a[i].id !== b[i].id) return false;
    }

    return true;
}

export function getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export function appendHTMLDivToParent(parent: HTMLDivElement, div: HTMLDivElement): void {
    if (!parent.contains(div)) {
        parent.appendChild(div);
    }
}

export function removeHTMLDivFromParent(parent: HTMLDivElement, div: HTMLDivElement): void {
    if (parent.contains(div)) {
        parent.removeChild(div);
    } else {
        // check to see if ID matches
        for (let idx = 0; idx < parent.children.length; idx++) {
            const child = parent.children[idx];
            if (child.id === div.id)
                child.remove();
        }
    }
}

export function convertImElementToHTMLDiv(element: ImElement): HTMLDivElement {
    const htmlDivElement = document.createElement('div');
    element.htmlDivElement = htmlDivElement;
    updateHTMLDiv(element);
    return htmlDivElement;
}

export function updateHTMLDiv(element: ImElement): HTMLDivElement {
    const htmlDivElement = element.htmlDivElement;

    const styleStr = constructSyleString(element);

    htmlDivElement.setAttribute('style', styleStr);
    htmlDivElement.setAttribute('id', element.id);

    return htmlDivElement;
}