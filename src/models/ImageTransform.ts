export interface ImageTransform {
  zoom: number;
  offsetX: number;
  offsetY: number;
  baseWidth?: number;
  baseHeight?: number;
}

export type ImageTransformField = "zoom" | "offsetX" | "offsetY";

export const DEFAULT_IMAGE_TRANSFORM: ImageTransform = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
};
