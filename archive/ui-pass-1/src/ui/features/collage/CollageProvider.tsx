import { createContext, useContext, useReducer, type ReactNode } from "react";
import { useCollageCommandImplementation } from "./logic/useCollageCommandImplementation";
import type { CollageCommands, CollageInitialState, CollageState } from "./models/collage";
import { createInitialCollageState } from "./state/createInitialCollageState";
import { collageReducer } from "./state/collageReducer";

const StateContext = createContext<CollageState | undefined>(undefined);
const CommandsContext = createContext<CollageCommands | undefined>(undefined);

export function CollageProvider({ children, initialState }: { children: ReactNode; initialState?: CollageInitialState }) {
  const [state, dispatch] = useReducer(collageReducer, initialState, createInitialCollageState);
  const commands = useCollageCommandImplementation({ state, dispatch });
  return <CommandsContext.Provider value={commands}><StateContext.Provider value={state}>{children}</StateContext.Provider></CommandsContext.Provider>;
}

export function useCollageState(): CollageState {
  const value = useContext(StateContext);
  if (!value) throw new Error("CollageProvider is missing");
  return value;
}

export function useCollageCommands(): CollageCommands {
  const value = useContext(CommandsContext);
  if (!value) throw new Error("CollageProvider is missing");
  return value;
}
