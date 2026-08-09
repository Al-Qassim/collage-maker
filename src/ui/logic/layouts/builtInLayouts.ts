import type { LayoutNode, SavedLayout } from "../../../models";

export function createBuiltInLayouts(): SavedLayout[] {
  return [
    builtIn("builtin-single", frame("builtin-single-frame")),
    builtIn("builtin-columns", {
      id: "builtin-columns-split",
      type: "split",
      direction: "vertical",
      ratio: 0.5,
      first: frame("builtin-columns-left"),
      second: frame("builtin-columns-right"),
    }),
    builtIn("builtin-feature", createBuiltInFeatureLayout()),
  ];
}

export function createBuiltInFeatureLayout(): LayoutNode {
  return {
    id: "builtin-feature-root",
    type: "split",
    direction: "vertical",
    ratio: 0.5,
    first: frame("builtin-feature-left"),
    second: {
      id: "builtin-feature-right",
      type: "split",
      direction: "horizontal",
      ratio: 0.5,
      first: frame("builtin-feature-top"),
      second: {
        id: "builtin-feature-bottom",
        type: "split",
        direction: "vertical",
        ratio: 0.5,
        first: frame("builtin-feature-bottom-left"),
        second: frame("builtin-feature-bottom-right"),
      },
    },
  };
}

function builtIn(id: string, layout: LayoutNode): SavedLayout {
  return { id, layout, builtIn: true };
}

function frame(id: string): LayoutNode {
  return { id, type: "frame" };
}
