export const PRINT_DPI = 300;
export const PIXELS_PER_CENTIMETER = PRINT_DPI / 2.54;

export function centimetersToPixels(centimeters: number): number {
  return centimeters * PIXELS_PER_CENTIMETER;
}

export function pixelsToCentimeters(pixels: number): number {
  return pixels / PIXELS_PER_CENTIMETER;
}

export function formatCentimeters(pixels: number): string {
  return pixelsToCentimeters(pixels).toFixed(2);
}
