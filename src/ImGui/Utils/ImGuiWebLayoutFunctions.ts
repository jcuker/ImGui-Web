import { ImElement } from "../Elements/ImElement";
import toPx from "./ToPixel";
import { Rect } from "../ImGuiWebTypes";
import { calculateMargins } from "./ImGuiHelpers";

export function simpleLayout(parent: ImElement, self: ImElement): void {
    const width = toPx(self.width);
    const height = toPx(self.height);

    const calculatedMargins = calculateMargins(self.margin);

    let x1, x2, y1, y2;

    switch (self.hAlign) {
        default:
        case 'LEFT':
            x1 = parent.absRect.x1;
            x2 = parent.absRect.x1 + width;
            break;
        case 'CENTER':
            const centerOfParent = parent.absRect.centerPoint('x');
            const halfWidth = width / 2;
            x1 = centerOfParent - halfWidth;
            x2 = centerOfParent + halfWidth;
            break;
        case 'RIGHT':
            x1 = parent.absRect.x2 - width;
            x2 = parent.absRect.x2;
            break;
    }

    switch (self.vAlign) {
        default:
        case 'TOP':
            y1 = parent.absRect.y1;
            y2 = parent.absRect.y1 + height;
            break;
        case 'CENTER':
            const centerOfParent = parent.absRect.centerPoint('y');
            const halfHeight = height / 2;
            y1 = centerOfParent - halfHeight;
            y2 = centerOfParent + halfHeight;
            break;
        case 'BOTTOM':
            y1 = parent.absRect.y2 - height;
            y2 = parent.absRect.y2;
            break;

    }

    self.absRect = new Rect(x1, x2 + calculatedMargins.left + calculatedMargins.right, y1, y2 + calculatedMargins.top + calculatedMargins.bottom);

    self.visibleRect = new Rect(self.absRect.x1 + calculatedMargins.left, self.absRect.x2 - calculatedMargins.right, self.absRect.y1 + calculatedMargins.left, y2 - calculatedMargins.right);

    self.calculatedHeight = height;
    self.calculatedWidth = width;

    self.hasPerformedLayout = true;
}

