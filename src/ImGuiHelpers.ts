import { SizeUnit, SizeType } from "./ImGuiWebTypes";

export const constructSizeType = (val: number, unit: SizeUnit): SizeType => ({ val, unit });

