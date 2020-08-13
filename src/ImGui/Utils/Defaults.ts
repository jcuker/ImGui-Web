import { ImMargin } from "../ImGuiWebTypes";
import { constructSizeType } from "./ImGuiHelpers";

export const DEFAULT_MARGINS: ImMargin = {
    top: constructSizeType(0, 'px'),
    bottom: constructSizeType(0, 'px'),
    left: constructSizeType(0, 'px'),
    right: constructSizeType(0, 'px')
};