import type { LayoutNode } from "./LayoutNode";

export interface SavedLayout {
  id: string;
  layout: LayoutNode;
  builtIn?: boolean;
}
