import type { ImageTransform } from "./ImageTransform";

export interface FrameNode {
  id: string;
  type: "frame";
  image?: string;
  alt?: string;
  transform?: ImageTransform;
}
