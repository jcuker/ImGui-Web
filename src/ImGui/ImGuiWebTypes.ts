import { ImElement } from "./Elements";

export interface Vec2<t> {
    x: t;
    y: t;
};

export type SizeUnit = 'px' | 'em' | 'rem' | '%';

export interface SizeType {
    val: number;
    unit: SizeUnit;
}

// classes
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

export interface ImConfig {
    // Size of the root element. Ideally would want to infer this from DOM first.
    canvasSize: Vec2<number>;
    // Id of the root element's div.
    domId: string;
}

export interface ImGuiState {
    // elements is an array that will hold all elements to render. The elements will be added in sequential order and will be accessed by their ids.
    elements: ImElement[];
    // Used to keep track of container elements. Anything within a Begin / End pair will be a container with 0 or more children.
    elementStack: number[];
    // all unique ids
    idSet: string[];
}