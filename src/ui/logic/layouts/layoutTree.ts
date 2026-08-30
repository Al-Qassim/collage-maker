import {
  fitLayoutSpacing,
  getLayoutSpacingExtent,
  getLayoutSplitDimensions,
  type FrameNode,
  type LayoutNode,
} from "../../../models";
import { snapSplitRatio } from "./snapSplitRatio";

export function findFrame(
  node: LayoutNode,
  frameId: string,
): FrameNode | undefined {
  if (node.type === "frame") {
    return node.id === frameId ? node : undefined;
  }

  return findFrame(node.first, frameId) ?? findFrame(node.second, frameId);
}

export function findFrameBounds(
  node: LayoutNode,
  frameId: string,
  width: number,
  height: number,
  requestedSpacing: number,
): { width: number; height: number } | undefined {
  const spacing = fitLayoutSpacing(node, width, height, requestedSpacing);
  return findVisibleFrameBounds(node, frameId, width, height, spacing);
}

function findVisibleFrameBounds(
  node: LayoutNode,
  frameId: string,
  width: number,
  height: number,
  spacing: number,
): { width: number; height: number } | undefined {
  if (node.type === "frame") {
    return node.id === frameId ? { width, height } : undefined;
  }

  const geometry = getLayoutSplitDimensions(node, width, height, spacing);
  return (
    findVisibleFrameBounds(
      node.first,
      frameId,
      geometry.first.width,
      geometry.first.height,
      spacing,
    ) ??
    findVisibleFrameBounds(
      node.second,
      frameId,
      geometry.second.width,
      geometry.second.height,
      spacing,
    )
  );
}

export function resizeFrameToDimensions(
  node: LayoutNode,
  frameId: string,
  width: number | undefined,
  height: number | undefined,
  canvasWidth: number,
  canvasHeight: number,
  requestedSpacing: number,
): LayoutNode {
  const spacing = fitLayoutSpacing(
    node,
    canvasWidth,
    canvasHeight,
    requestedSpacing,
  );
  let resized = node;
  if (width !== undefined) {
    resized = resizeFrameDimension(
      resized,
      frameId,
      "width",
      width,
      canvasWidth,
      canvasHeight,
      spacing,
    ).node;
  }
  if (height !== undefined) {
    resized = resizeFrameDimension(
      resized,
      frameId,
      "height",
      height,
      canvasWidth,
      canvasHeight,
      spacing,
    ).node;
  }
  return resized;
}

interface DimensionResizeResult {
  node: LayoutNode;
  found: boolean;
  resized: boolean;
  size: number;
}

function resizeFrameDimension(
  node: LayoutNode,
  frameId: string,
  dimension: "width" | "height",
  target: number,
  width: number,
  height: number,
  spacing: number,
): DimensionResizeResult {
  if (node.type === "frame") {
    const found = node.id === frameId;
    return {
      node,
      found,
      resized: false,
      size: found ? (dimension === "width" ? width : height) : 0,
    };
  }

  const geometry = getLayoutSplitDimensions(node, width, height, spacing);
  const firstResult = resizeFrameDimension(
    node.first,
    frameId,
    dimension,
    target,
    geometry.first.width,
    geometry.first.height,
    spacing,
  );
  const inFirst = firstResult.found;
  const childResult = inFirst
    ? firstResult
    : resizeFrameDimension(
        node.second,
        frameId,
        dimension,
        target,
        geometry.second.width,
        geometry.second.height,
        spacing,
      );
  if (!childResult.found) {
    return { node, found: false, resized: false, size: 0 };
  }

  const childKey = inFirst ? "first" : "second";
  const withChild =
    childResult.node === node[childKey]
      ? node
      : { ...node, [childKey]: childResult.node };
  const matchingDirection =
    (dimension === "width" && node.direction === "vertical") ||
    (dimension === "height" && node.direction === "horizontal");
  if (childResult.resized || !matchingDirection) {
    return {
      node: withChild,
      found: true,
      resized: childResult.resized,
      size: childResult.size,
    };
  }

  const firstExtent = getLayoutSpacingExtent(node.first, spacing);
  const secondExtent = getLayoutSpacingExtent(node.second, spacing);
  const firstFixed =
    dimension === "width" ? firstExtent.width : firstExtent.height;
  const secondFixed =
    dimension === "width" ? secondExtent.width : secondExtent.height;
  const parentSize = dimension === "width" ? width : height;
  const contentSize = Math.max(
    1,
    parentSize - firstFixed - spacing - secondFixed,
  );
  const currentChildSize = inFirst
    ? dimension === "width"
      ? geometry.first.width
      : geometry.first.height
    : dimension === "width"
      ? geometry.second.width
      : geometry.second.height;
  const desiredChildSize = currentChildSize + target - childResult.size;
  const desiredShare = inFirst
    ? (desiredChildSize - firstFixed) / contentSize
    : (desiredChildSize - secondFixed) / contentSize;
  const ratio = inFirst ? desiredShare : 1 - desiredShare;
  return {
    node: { ...withChild, ratio: Math.min(0.9, Math.max(0.1, ratio)) },
    found: true,
    resized: true,
    size: target,
  };
}

export function replaceFrame(
  node: LayoutNode,
  frameId: string,
  replacement: LayoutNode,
): LayoutNode {
  if (node.type === "frame") {
    return node.id === frameId ? replacement : node;
  }

  return {
    ...node,
    first: replaceFrame(node.first, frameId, replacement),
    second: replaceFrame(node.second, frameId, replacement),
  };
}

export function updateSplit(
  node: LayoutNode,
  splitId: string,
  ratio: number,
): LayoutNode {
  if (node.type === "frame") return node;
  if (node.id === splitId) {
    const clampedRatio = Math.min(0.9, Math.max(0.1, ratio));
    return { ...node, ratio: snapSplitRatio(clampedRatio) };
  }

  return {
    ...node,
    first: updateSplit(node.first, splitId, ratio),
    second: updateSplit(node.second, splitId, ratio),
  };
}

export function removeFrameArea(node: LayoutNode, frameId: string): LayoutNode {
  if (node.type === "frame") return node;
  if (node.first.type === "frame" && node.first.id === frameId) {
    return node.second;
  }
  if (node.second.type === "frame" && node.second.id === frameId) {
    return node.first;
  }
  return {
    ...node,
    first: removeFrameArea(node.first, frameId),
    second: removeFrameArea(node.second, frameId),
  };
}

export function emptyFrameIds(
  node: LayoutNode,
  excludedFrameId?: string,
): string[] {
  if (node.type === "frame") {
    return !node.image && node.id !== excludedFrameId ? [node.id] : [];
  }
  return [
    ...emptyFrameIds(node.first, excludedFrameId),
    ...emptyFrameIds(node.second, excludedFrameId),
  ];
}

export function createReusableLayout(node: LayoutNode): LayoutNode {
  if (node.type === "frame") {
    return { id: node.id, type: "frame" };
  }
  return {
    ...node,
    first: createReusableLayout(node.first),
    second: createReusableLayout(node.second),
  };
}

export function cloneLayout(node: LayoutNode): LayoutNode {
  if (node.type === "frame") {
    return { id: `frame-${crypto.randomUUID()}`, type: "frame" };
  }
  return {
    ...node,
    id: `split-${crypto.randomUUID()}`,
    first: cloneLayout(node.first),
    second: cloneLayout(node.second),
  };
}

export function hasCollageContent(node: LayoutNode): boolean {
  if (node.type === "frame") return Boolean(node.image);
  return true;
}
