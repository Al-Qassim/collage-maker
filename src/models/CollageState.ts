import type { CanvasSettings } from "./CanvasSettings";
import type { CollagePage } from "./CollagePage";
import type { LayoutNode } from "./LayoutNode";

export interface CollageState {
  canvas: CanvasSettings;
  layout: LayoutNode;
  pages: CollagePage[];
  activePageId: string;
}
