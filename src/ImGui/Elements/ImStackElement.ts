import { ImContainer } from "./ImContainer";
import { ImElementParams } from "./ImElement";

export type ImStackOrientation = 'vertical' | 'horizontal';
export interface ImStackParams extends ImElementParams {
    orientation: ImStackOrientation;
}

export class ImStackElement extends ImContainer {
    orientation: ImStackOrientation;

    constructor(params: ImStackParams) {
        super(params as ImElementParams);
        this.orientation = params.orientation;
        this.styleStr = this.orientation === 'horizontal' ? 'display: flex; flex-direction: row;' : 'display: flex; flex-direction: column;';
    }
}