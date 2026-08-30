import type { PointerEvent } from "react";
import type { SplitDirection } from "../../../models";

export interface SplitResizeGeometry {
  size: number;
  firstFixed: number;
  secondFixed: number;
  gap: number;
}

export function useSplitResizer(
  beginResize: () => void,
  resizeSplit: (splitId: string, ratio: number) => void,
) {
  return (
    event: PointerEvent<HTMLButtonElement>,
    splitId: string,
    direction: SplitDirection,
    geometry: SplitResizeGeometry,
  ) => {
    event.preventDefault();
    const container = event.currentTarget.parentElement;
    if (!container) return;

    beginResize();
    document.body.classList.add("is-resizing");
    const bounds = container.getBoundingClientRect();
    const update = (move: globalThis.PointerEvent) => {
      const pointerFraction =
        direction === "vertical"
          ? (move.clientX - bounds.left) / bounds.width
          : (move.clientY - bounds.top) / bounds.height;
      const pointerPosition = pointerFraction * geometry.size;
      const contentSize = Math.max(
        1,
        geometry.size -
          geometry.firstFixed -
          geometry.gap -
          geometry.secondFixed,
      );
      const ratio =
        (pointerPosition - geometry.firstFixed - geometry.gap / 2) /
        contentSize;
      resizeSplit(splitId, ratio);
    };
    const stop = () => {
      window.removeEventListener("pointermove", update);
      window.removeEventListener("pointerup", stop);
      document.body.classList.remove("is-resizing");
    };

    window.addEventListener("pointermove", update);
    window.addEventListener("pointerup", stop, { once: true });
  };
}
