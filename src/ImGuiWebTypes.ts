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

    canvasSize: Vec2<number>;

    domId: string;
    // should we print to console? If this is set try to render as little as possible
    debug: boolean;
}

export interface ImGuiState {
    // elements is an array that will hold all elements to render. The elements will be added in sequential order and will be accessed by their ids.
    elements: ImElement[];
    // Used to keep track of container elements. Anything within a Begin / End pair will be a container with 0 or more children.
    elementStack: number[];
    // all unique ids
    idSet: string[];
}

export type LayoutFunctionPtr = (parent: ImElement, self: ImElement) => void;
export type OnClickFunctionPtr = (element: ImElement) => void;

// classes

export interface ImElementParams {
    id: string;
    height: SizeType;
    width: SizeType;
    backgroundColor?: string;
    onClick?: OnClickFunctionPtr;
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

    public containsRect(other: Rect) {
        let contains = true;

        if (other.x1 < this.x1 || other.x2 > this.x2) contains = false;
        if (other.y1 < this.y1 || other.y2 > this.y2) contains = false;

        return contains;
    }

    public containsPoint(x: number, y: number) {
        let contains = true;

        if (x < this.x1 || x > this.x2) contains = false;
        if (y < this.y1 || y > this.y2) contains = false;

        return contains;
    }
};

// base class for all elements.
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


    // this will hold the indicies of the children in the element array
    children?: number[];


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


export interface ImRectElementParams extends ImElementParams {

}

export class ImRectElement extends ImElement {
    constructor(params: ImRectElementParams) {
        super(params as ImElementParams);
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
        this.orientation = params.orientation;
        this.styleStr = this.orientation === 'horizontal' ? 'display: flex; flex-direction: row;' : 'display: flex; flex-direction: column;';
    }
}

interface ImGuiGestureSystemState {
    startingEvent: MouseEvent | null;
    currentEvent: MouseEvent | null;
    eventInProgress?: 'click' | 'drag';
}

export interface ActionableEvent {
    eventType: 'click' | 'drag';
    x: number;
    y: number;
}

export class ImGuiGestureSystem {
    private state: ImGuiGestureSystemState;

    constructor() {
        // 'mousedown', 'mouseup', 'mouseenter', 'mousemove', 'mouseup', 
        ['click'].forEach((eventName: string) => {
            document.addEventListener(eventName, (event: MouseEvent) => {
                event.preventDefault();
                this.processEvent(event);
                console.log('Click at x: ', event.clientX, ' y: ', event.clientY);
            }, false);
        });
        this.resetState();
    }

    private resetState() {
        this.state = {
            startingEvent: null,
            currentEvent: null
        }
    }

    public processEvent(e: MouseEvent) {
        if (e.type === 'click') {
            this.state.eventInProgress = 'click';
            this.state.currentEvent = e;
            return;
        }

        if (!this.state.startingEvent) {
            this.state.startingEvent = e;
            this.state.eventInProgress = e.type === 'mousedown' ? 'click' : 'drag';

            return;
        }

        if (this.state.eventInProgress) {
            this.state.eventInProgress === 'click' ? this.handleClickGestureEvent(e) : this.handleDragGestureEvent(e);
        }
    }

    private handleClickGestureEvent(e: MouseEvent): void {
        if (e.type === 'mouseup') {
            this.state.currentEvent = e;
        }
    }

    private handleDragGestureEvent(e: MouseEvent): void {

    }

    public endOfFrame(): ActionableEvent | null {
        if (!this.state.eventInProgress) return;

        let actionable: ActionableEvent;

        if (this.state.eventInProgress === 'click') {
            // if we have two events there has been a 'click'
            if (this.state.currentEvent) {
                actionable = {
                    eventType: 'click',
                    x: this.state.currentEvent.clientX,
                    y: this.state.currentEvent.clientY
                }
            }
        }

        this.resetState();
        return actionable;
    }
}