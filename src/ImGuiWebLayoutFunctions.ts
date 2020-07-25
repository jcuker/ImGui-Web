import { ImElement, Rect } from "./ImGuiWebTypes";
import toPx from "./ToPixel";

export function simpleLayout(parent: ImElement, self: ImElement): void {
    const width = toPx(self.width);
    const height = toPx(self.height);

    self.absRect = new Rect(parent.absRect.x1, parent.absRect.x1 + width, parent.absRect.y1, parent.absRect.y1 + height);

    self.calculatedHeight = height;
    self.calculatedWidth = width;

    self.hasPerformedLayout = true;
}

