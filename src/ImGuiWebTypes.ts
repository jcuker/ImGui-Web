import { thisTypeAnnotation } from "@babel/types";

export interface Vec2<t> {
    x: t;
    y: t;
};

export type SizeUnit = 'px' | 'em' | 'rem' | '%';
export interface SizeType {
    val: number;
    unit: SizeUnit;
}

export interface ImConfig {
    // elements is an array that will hold all elements to render. The elements will be added in sequential order and will be accessed by their ids.
    elements: ImElement[];
    canvasSize: Vec2<number>;
    // Used to keep track of container elements. Anything within a Begin / End pair will be a container with 0 or more children.
    elementStack: number[];
    // id of the dom element to treat as root
    domId: string;
    // should we print to console? If this is set try to render as little as possible
    debug: boolean;
}

export type LayoutFunctionPtr = (parent: ImElement, self: ImElement) => void;
// classes

export interface ImElementParams {
    id: string;
    height: SizeType;
    width: SizeType;
    backgroundColor?: string;
}


export class Rect {
    x1: number;
    x2: number;
    y1: number;
    y2: number;

    constructor(x1: number, x2: number, y1: number, y2: number) {
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
    }

    public clipAgainst(rect: Rect): void { }

    public moveHorizontally(by: number) {
        this.x1 += by;
        this.x2 += by;
    }

    public moveVertically(by: number) {
        this.y1 += by;
        this.y2 += by;
    }
};

// base class for all elements.
export class ImElement {
    id: string;
    // index of the element within the elements array
    elementIdx: number = -1;
    absRect: Rect = new Rect(-1, -1, -1, -1);

    height: SizeType = { val: 0, unit: "px" };
    calculatedHeight?: number;

    width: SizeType = { val: 0, unit: "px" };
    calculatedWidth?: number;

    hasPerformedLayout: boolean = false;

    backgroundColor?: string;



    // this will hold the indicies of the children in the element array
    children?: number[];


    htmlDivElement?: HTMLDivElement;


    layout: LayoutFunctionPtr = (p, c) => { };

    constructor(params: ImElementParams) {
        this.id = params.id;
        this.height = params.height;
        this.width = params.width;
        this.backgroundColor = params.backgroundColor;
    }
}


export interface ImRectElementParams extends ImElementParams {

}

export class ImRectElement extends ImElement {
    constructor(params: ImRectElementParams) {
        super(params as ImElementParams);
    }
    layout = (parent: ImElement, self: ImElement) => {

    }
}

export type ImStackOrientation = 'vertical' | 'horizontal';
export interface ImStackParams extends ImElementParams {
    orientation: ImStackOrientation;
}

export class ImStack extends ImElement {
    orientation: ImStackOrientation;

    constructor(params: ImStackParams) {
        super(params as ImElementParams);
        this.children = [];
    }
}