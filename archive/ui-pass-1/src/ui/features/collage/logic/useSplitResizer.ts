import type { PointerEvent } from "react";
import type { SplitDirection } from "../models/collage";

export function useSplitResizer(resizeSplit: (splitId: string, ratio: number) => void) {
  return (event: PointerEvent<HTMLButtonElement>, splitId: string, direction: SplitDirection) => {
    event.preventDefault();
    const container = event.currentTarget.parentElement;
    if (!container) return;
    const bounds = container.getBoundingClientRect();
    const update = (move: globalThis.PointerEvent) => {
      const ratio = direction === "vertical" ? (move.clientX - bounds.left) / bounds.width : (move.clientY - bounds.top) / bounds.height;
      resizeSplit(splitId, ratio);
    };
    const stop = () => {
      window.removeEventListener("pointermove", update);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", update);
    window.addEventListener("pointerup", stop, { once: true });
  };
}
