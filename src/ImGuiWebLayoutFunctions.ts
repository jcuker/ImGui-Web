import { ImElement } from "./ImGuiWebTypes";
import toPx from "./ToPixel";

export function simpleLayout(parent: ImElement, self: ImElement): void {
    const width = toPx(self.width);
    const height = toPx(self.height);

    self.absRect = {
        x1: parent.absRect.x1,
        x2: parent.absRect.x1 + width,
        y1: parent.absRect.y1,
        y2: parent.absRect.y1 + height
    };

    self.calculatedHeight = height;
    self.calculatedWidth = width;

    self.hasPerformedLayout = true;
}

