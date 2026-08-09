import { useMemo, type Dispatch } from "react";
import type { DataServices } from "../../../data-service";
import type { CollageScreenCommands } from "../CollageScreenCommands";
import type { CollageHistoryState } from "../CollageScreenState";
import type { HistoryAction } from "../reducers/collageReducer";
import { createCollageCommands } from "./createCollageCommands";

export function useCollageCommandImplementation({
  history,
  dispatch,
  services,
}: {
  history: CollageHistoryState;
  dispatch: Dispatch<HistoryAction>;
  services: DataServices;
}): CollageScreenCommands {
  return useMemo(
    () => createCollageCommands({ history, dispatch, services }),
    [history, dispatch, services],
  );
}
