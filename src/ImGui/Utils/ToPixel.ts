import { SizeType } from "../ImGuiWebTypes";

const PIXELS_PER_INCH = 96

const defaults = {
    'ch': 8,
    'ex': 7.15625,
    'em': 16,
    'rem': 16,
    'in': PIXELS_PER_INCH,
    'cm': PIXELS_PER_INCH / 2.54,
    'mm': PIXELS_PER_INCH / 25.4,
    'pt': PIXELS_PER_INCH / 72,
    'pc': PIXELS_PER_INCH / 6,
    'px': 1
}

export default function toPx(size: SizeType): number {
    switch (size.unit) {
        case "em":
            return 0;
        case 'rem':
            return 0;
        case '%':
            return 0;
        default:
            return size.val;
    }
}