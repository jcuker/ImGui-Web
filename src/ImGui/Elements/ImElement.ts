import { ImMargin, Rect, SizeType, HorizontalAlignment, VerticalAlignment, ImMarginParams } from "../ImGuiWebTypes";
import { constructSizeType } from "../Utils/ImGuiHelpers";
import { DEFAULT_MARGINS } from "../Utils/Defaults";

export interface ImElementParams {
    id: string;
    height: SizeType | number;
    width: SizeType | number;
    margin?: ImMarginParams;
    hAlign?: HorizontalAlignment;
    vAlign?: VerticalAlignment;
    backgroundColor?: string;
    onClick?: OnClickFunctionPtr;
}

export type LayoutFunctionPtr = (parent: ImElement, self: ImElement) => void;
export type OnClickFunctionPtr = (element: ImElement) => void;

export class ImElement {
    id: string;
    // index of the element within the elements array
    elementIdx: number = -1;


    // abs rect is all the space an element will take up including margin and padding
    absRect: Rect = new Rect(0, 0, 0, 0);

    // visible rect is the space only the visible parts of element will take up.  Essentially absRect - margin and padding
    visibleRect: Rect = new Rect(0, 0, 0, 0);

    height: SizeType = { val: 0, unit: "px" };
    calculatedHeight?: number;

    width: SizeType = { val: 0, unit: "px" };
    calculatedWidth?: number;

    margin: ImMargin;

    vAlign: VerticalAlignment = 'TOP';
    hAlign: HorizontalAlignment = 'LEFT';

    hasPerformedLayout: boolean = false;

    backgroundColor?: string;

    styleStr?: string;

    htmlDivElement?: HTMLDivElement;


    layout?: LayoutFunctionPtr = (p, c) => { };

    onClick?: OnClickFunctionPtr = (element: ImElement) => { };

    constructor(params: ImElementParams) {
        this.id = params.id;
        this.height = typeof params.height === 'number' ? constructSizeType(params.height, 'px') : params.height;
        this.width = typeof params.width === 'number' ? constructSizeType(params.width, 'px') : params.width;
        this.backgroundColor = params.backgroundColor;

        const margin = params.margin || DEFAULT_MARGINS;

        this.margin = {
            top: typeof margin.top === 'number' ? constructSizeType(margin.top, 'px') : margin.top,
            bottom: typeof margin.bottom === 'number' ? constructSizeType(margin.bottom, 'px') : margin.bottom,
            left: typeof margin.left === 'number' ? constructSizeType(margin.left, 'px') : margin.left,
            right: typeof margin.right === 'number' ? constructSizeType(margin.right, 'px') : margin.right,
        }

        if (params.vAlign) this.vAlign = params.vAlign;
        if (params.hAlign) this.hAlign = params.hAlign;

        this.onClick = params.onClick;
    }
}
