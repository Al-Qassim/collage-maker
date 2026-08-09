import type { CollageState } from "../../models";

export type CollageInitialState = Partial<CollageState>;

export interface CollageHistoryState {
  past: CollageState[];
  present: CollageState;
  future: CollageState[];
}

export interface HistoryCapabilities {
  canUndo: boolean;
  canRedo: boolean;
}
