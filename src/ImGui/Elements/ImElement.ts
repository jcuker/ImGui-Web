import { SizeType, Rect } from "../ImGuiWebTypes";

export interface ImElementParams {
    id: string;
    height: SizeType;
    width: SizeType;
    backgroundColor?: string;
    onClick?: OnClickFunctionPtr;
}

export type LayoutFunctionPtr = (parent: ImElement, self: ImElement) => void;
export type OnClickFunctionPtr = (element: ImElement) => void;

export class ImElement {
    id: string;
    // index of the element within the elements array
    elementIdx: number = -1;
    absRect: Rect = new Rect(0, 0, 0, 0);

    height: SizeType = { val: 0, unit: "px" };
    calculatedHeight?: number;

    width: SizeType = { val: 0, unit: "px" };
    calculatedWidth?: number;

    hasPerformedLayout: boolean = false;

    backgroundColor?: string;

    styleStr?: string;

    htmlDivElement?: HTMLDivElement;


    layout?: LayoutFunctionPtr = (p, c) => { };

    onClick?: OnClickFunctionPtr = (element: ImElement) => { };

    constructor(params: ImElementParams) {
        this.id = params.id;
        this.height = params.height;
        this.width = params.width;
        this.backgroundColor = params.backgroundColor;
        this.onClick = params.onClick;
    }
}
