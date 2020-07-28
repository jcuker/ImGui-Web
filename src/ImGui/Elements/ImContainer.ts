import { ImElement, ImElementParams } from "./ImElement";

export class ImContainer extends ImElement {
    // Holds the index to the child in the state array
    children: number[];

    constructor(params: ImElementParams) {
        super(params);
        this.children = [];
    }
}