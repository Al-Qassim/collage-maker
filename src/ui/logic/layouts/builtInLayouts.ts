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
    builtIn("builtin-grid-3x3", createBuiltInGrid()),
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

function createBuiltInGrid(): LayoutNode {
  const rows = Array.from({ length: 3 }, (_, row) =>
    equalLine(
      Array.from({ length: 3 }, (_, column) =>
        frame(`builtin-grid-${row}-${column}`),
      ),
      "vertical",
      `builtin-grid-row-${row}`,
    ),
  );
  return equalLine(rows, "horizontal", "builtin-grid");
}

function equalLine(
  nodes: LayoutNode[],
  direction: "vertical" | "horizontal",
  idPrefix: string,
): LayoutNode {
  if (nodes.length === 1) return nodes[0];
  return {
    id: `${idPrefix}-split-${nodes.length}`,
    type: "split",
    direction,
    ratio: 1 / nodes.length,
    first: nodes[0],
    second: equalLine(nodes.slice(1), direction, idPrefix),
  };
}

function builtIn(id: string, layout: LayoutNode): SavedLayout {
  return { id, layout, builtIn: true };
}

function frame(id: string): LayoutNode {
  return { id, type: "frame" };
}
