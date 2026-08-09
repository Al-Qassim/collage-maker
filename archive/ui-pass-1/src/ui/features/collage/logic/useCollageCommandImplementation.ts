import { useMemo, type Dispatch } from "react";
import type { CollageCommands, CollageState } from "../models/collage";
import type { CollageAction } from "../state/collageReducer";
import { createCollageCommands } from "./createCollageCommands";

export function useCollageCommandImplementation({ state, dispatch }: { state: CollageState; dispatch: Dispatch<CollageAction> }): CollageCommands {
  return useMemo(() => createCollageCommands({ state, dispatch }), [state, dispatch]);
}
