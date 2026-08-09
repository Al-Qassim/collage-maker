import { useEffect } from "react";
import type { CollageScreenCommands } from "../CollageScreenCommands";

export function useEditorShortcuts(commands: CollageScreenCommands): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.matches("input, textarea, [contenteditable='true']")) return;
      if (
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "z"
      ) {
        return;
      }

      event.preventDefault();
      if (event.shiftKey) commands.redo();
      else commands.undo();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commands]);
}
