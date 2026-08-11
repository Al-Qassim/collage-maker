import type { CanvasSettings, CollageState, LayoutNode } from "../../models";

export type CollageInitialState = Partial<CollageState>;

export interface PageHistorySnapshot {
  canvas: CanvasSettings;
  layout: LayoutNode;
}

export interface CollageHistoryState {
  pastByPage: Record<string, PageHistorySnapshot[]>;
  present: CollageState;
  futureByPage: Record<string, PageHistorySnapshot[]>;
}

export interface HistoryCapabilities {
  canUndo: boolean;
  canRedo: boolean;
}
