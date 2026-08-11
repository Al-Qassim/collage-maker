import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { DataServices } from "../../data-service";
import type { CollageState } from "../../models";
import type { CollageScreenCommands } from "./CollageScreenCommands";
import type {
  CollageInitialState,
  HistoryCapabilities,
} from "./CollageScreenState";
import { useCollageCommandImplementation } from "./commands/useCollageCommandImplementation";
import { historyReducer } from "./reducers/collageReducer";
import { createInitialHistoryState } from "./reducers/createInitialCollageState";

const StateContext = createContext<CollageState | undefined>(undefined);
const CommandsContext = createContext<CollageScreenCommands | undefined>(
  undefined,
);
const HistoryContext = createContext<HistoryCapabilities | undefined>(
  undefined,
);

export function CollageScreenProvider({
  services,
  children,
  initialState,
}: {
  services: DataServices;
  children: ReactNode;
  initialState?: CollageInitialState;
}) {
  const [history, dispatch] = useReducer(
    historyReducer,
    { database: services.local, initialState },
    createInitialHistoryState,
  );
  const commands = useCollageCommandImplementation({
    history,
    dispatch,
    services,
  });

  return (
    <CommandsContext.Provider value={commands}>
      <HistoryContext.Provider
        value={{
          canUndo:
            (history.pastByPage[history.present.activePageId]?.length ?? 0) > 0,
          canRedo:
            (history.futureByPage[history.present.activePageId]?.length ?? 0) >
            0,
        }}
      >
        <StateContext.Provider value={history.present}>
          {children}
        </StateContext.Provider>
      </HistoryContext.Provider>
    </CommandsContext.Provider>
  );
}

export function useCollageState(): CollageState {
  const value = useContext(StateContext);
  if (!value) throw new Error("CollageScreenProvider is missing");
  return value;
}

export function useCollageCommands(): CollageScreenCommands {
  const value = useContext(CommandsContext);
  if (!value) throw new Error("CollageScreenProvider is missing");
  return value;
}

export function useCollageHistory(): HistoryCapabilities {
  const value = useContext(HistoryContext);
  if (!value) throw new Error("CollageScreenProvider is missing");
  return value;
}
