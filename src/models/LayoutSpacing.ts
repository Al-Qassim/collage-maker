import type { LayoutNode } from "./LayoutNode";
import type { SplitNode } from "./SplitNode";

export interface LayoutSpacingExtent {
  width: number;
  height: number;
}

export interface LayoutChildDimensions {
  width: number;
  height: number;
}

export interface LayoutSplitDimensions {
  first: LayoutChildDimensions;
  second: LayoutChildDimensions;
}

export function getLayoutSpacingExtent(
  node: LayoutNode,
  spacing: number,
): LayoutSpacingExtent {
  if (node.type === "frame") return { width: 0, height: 0 };
  const first = getLayoutSpacingExtent(node.first, spacing);
  const second = getLayoutSpacingExtent(node.second, spacing);
  if (node.direction === "vertical") {
    return {
      width: first.width + spacing + second.width,
      height: Math.min(first.height, second.height),
    };
  }
  return {
    width: Math.min(first.width, second.width),
    height: first.height + spacing + second.height,
  };
}

export function fitLayoutSpacing(
  node: LayoutNode,
  width: number,
  height: number,
  requestedSpacing: number,
): number {
  if (requestedSpacing <= 0) return 0;
  const units = getMaximumLayoutSpacingExtent(node);
  const widthLimit = units.width > 0 ? (width - 1) / units.width : Infinity;
  const heightLimit = units.height > 0 ? (height - 1) / units.height : Infinity;
  return Math.max(0, Math.min(requestedSpacing, widthLimit, heightLimit));
}

function getMaximumLayoutSpacingExtent(node: LayoutNode): LayoutSpacingExtent {
  if (node.type === "frame") return { width: 0, height: 0 };
  const first = getMaximumLayoutSpacingExtent(node.first);
  const second = getMaximumLayoutSpacingExtent(node.second);
  if (node.direction === "vertical") {
    return {
      width: first.width + 1 + second.width,
      height: Math.max(first.height, second.height),
    };
  }
  return {
    width: Math.max(first.width, second.width),
    height: first.height + 1 + second.height,
  };
}

export function getLayoutSplitDimensions(
  node: SplitNode,
  width: number,
  height: number,
  spacing: number,
): LayoutSplitDimensions {
  const firstExtent = getLayoutSpacingExtent(node.first, spacing);
  const secondExtent = getLayoutSpacingExtent(node.second, spacing);
  if (node.direction === "vertical") {
    const contentWidth = Math.max(
      0,
      width - firstExtent.width - spacing - secondExtent.width,
    );
    return {
      first: {
        width: firstExtent.width + contentWidth * node.ratio,
        height,
      },
      second: {
        width: secondExtent.width + contentWidth * (1 - node.ratio),
        height,
      },
    };
  }

  const contentHeight = Math.max(
    0,
    height - firstExtent.height - spacing - secondExtent.height,
  );
  return {
    first: {
      width,
      height: firstExtent.height + contentHeight * node.ratio,
    },
    second: {
      width,
      height: secondExtent.height + contentHeight * (1 - node.ratio),
    },
  };
}
