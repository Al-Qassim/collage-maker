import type { SplitDirection } from "./SplitDirection";

export interface FrameInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const EMPTY_FRAME_INSETS: FrameInsets = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

export function splitFrameInsets(
  parent: FrameInsets,
  direction: SplitDirection,
  spacing: number,
): [FrameInsets, FrameInsets] {
  const halfSpacing = spacing / 2;
  if (direction === "vertical") {
    return [
      { ...parent, right: halfSpacing },
      { ...parent, left: halfSpacing },
    ];
  }
  return [
    { ...parent, bottom: halfSpacing },
    { ...parent, top: halfSpacing },
  ];
}
