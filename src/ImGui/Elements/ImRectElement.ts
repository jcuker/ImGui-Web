import { ImElement, ImElementParams } from "./ImElement";

export interface ImRectElementParams extends ImElementParams {

}

export class ImRectElement extends ImElement {
    constructor(params: ImRectElementParams) {
        super(params as ImElementParams);
    }
}