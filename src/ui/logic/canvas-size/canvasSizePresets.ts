export type SizeUnit = "px" | "in" | "mm" | "cm";
export type PresetGroup = "Screen" | "Print";

export interface SizePreset {
  id: string;
  label: string;
  width: number;
  height: number;
  group: PresetGroup;
}

export const CANVAS_SIZE_PRESETS: SizePreset[] = [
  preset("portrait", "Portrait · 1080 × 1350 px", 1080, 1350, "Screen"),
  preset("story", "Story · 1080 × 1920 px", 1080, 1920, "Screen"),
  preset("landscape", "Landscape HD · 1920 × 1080 px", 1920, 1080, "Screen"),
  preset("square", "Square · 1080 × 1080 px", 1080, 1080, "Screen"),
  preset("a4-p", "A4 Portrait · 210 × 297 mm", 2480, 3508, "Print"),
  preset("a4-l", "A4 Landscape · 297 × 210 mm", 3508, 2480, "Print"),
  preset("a3-p", "A3 Portrait · 297 × 420 mm", 3508, 4961, "Print"),
  preset("a3-l", "A3 Landscape · 420 × 297 mm", 4961, 3508, "Print"),
];

export function toPixels(value: number, unit: SizeUnit): number {
  return Math.round(value * unitFactor(unit));
}

export function fromPixels(value: number, unit: SizeUnit): number {
  return Number((value / unitFactor(unit)).toFixed(unit === "px" ? 0 : 2));
}

function unitFactor(unit: SizeUnit): number {
  const dpi = 300;
  return { px: 1, in: dpi, mm: dpi / 25.4, cm: dpi / 2.54 }[unit];
}

function preset(
  id: string,
  label: string,
  width: number,
  height: number,
  group: PresetGroup,
): SizePreset {
  return { id, label, width, height, group };
}
