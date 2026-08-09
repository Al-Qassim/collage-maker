import type { LayoutNode } from "./LayoutNode";
import type { SplitDirection } from "./SplitDirection";

export interface SplitNode {
  id: string;
  type: "split";
  direction: SplitDirection;
  ratio: number;
  first: LayoutNode;
  second: LayoutNode;
}
