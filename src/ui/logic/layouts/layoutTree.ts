import {
  EMPTY_FRAME_INSETS,
  splitFrameInsets,
  type FrameInsets,
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
  spacing: number,
): { width: number; height: number } | undefined {
  return findVisibleFrameBounds(
    node,
    frameId,
    width,
    height,
    spacing,
    EMPTY_FRAME_INSETS,
  );
}

function findVisibleFrameBounds(
  node: LayoutNode,
  frameId: string,
  width: number,
  height: number,
  spacing: number,
  insets: FrameInsets,
): { width: number; height: number } | undefined {
  if (node.type === "frame") {
    return node.id === frameId
      ? visibleDimensions(width, height, insets)
      : undefined;
  }

  const geometry = splitGeometry(node, width, height, insets, spacing);
  return (
    findVisibleFrameBounds(
      node.first,
      frameId,
      geometry.first.width,
      geometry.first.height,
      spacing,
      geometry.first.insets,
    ) ??
    findVisibleFrameBounds(
      node.second,
      frameId,
      geometry.second.width,
      geometry.second.height,
      spacing,
      geometry.second.insets,
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
  spacing: number,
): LayoutNode {
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
      EMPTY_FRAME_INSETS,
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
      EMPTY_FRAME_INSETS,
    ).node;
  }
  return resized;
}

interface DimensionResizeResult {
  node: LayoutNode;
  found: boolean;
  resized: boolean;
  inset: number;
}

function resizeFrameDimension(
  node: LayoutNode,
  frameId: string,
  dimension: "width" | "height",
  target: number,
  width: number,
  height: number,
  spacing: number,
  insets: FrameInsets,
): DimensionResizeResult {
  if (node.type === "frame") {
    const found = node.id === frameId;
    const inset =
      dimension === "width"
        ? insets.left + insets.right
        : insets.top + insets.bottom;
    return { node, found, resized: false, inset: found ? inset : 0 };
  }

  const geometry = splitGeometry(node, width, height, insets, spacing);
  const firstResult = resizeFrameDimension(
    node.first,
    frameId,
    dimension,
    target,
    geometry.first.width,
    geometry.first.height,
    spacing,
    geometry.first.insets,
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
        geometry.second.insets,
      );
  if (!childResult.found) {
    return { node, found: false, resized: false, inset: 0 };
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
      inset: childResult.inset,
    };
  }

  const available = dimension === "width" ? width : height;
  const desiredShare = Math.min(
    0.9,
    Math.max(0.1, (target + childResult.inset) / available),
  );
  const ratio = inFirst ? desiredShare : 1 - desiredShare;
  return {
    node: { ...withChild, ratio },
    found: true,
    resized: true,
    inset: childResult.inset,
  };
}

interface ChildGeometry {
  width: number;
  height: number;
  insets: FrameInsets;
}

function splitGeometry(
  node: Exclude<LayoutNode, FrameNode>,
  width: number,
  height: number,
  insets: FrameInsets,
  spacing: number,
): { first: ChildGeometry; second: ChildGeometry } {
  const [firstInsets, secondInsets] = splitFrameInsets(
    insets,
    node.direction,
    spacing,
  );
  if (node.direction === "vertical") {
    const firstWidth = width * node.ratio;
    return {
      first: { width: firstWidth, height, insets: firstInsets },
      second: { width: width - firstWidth, height, insets: secondInsets },
    };
  }
  const firstHeight = height * node.ratio;
  return {
    first: { width, height: firstHeight, insets: firstInsets },
    second: { width, height: height - firstHeight, insets: secondInsets },
  };
}

function visibleDimensions(width: number, height: number, insets: FrameInsets) {
  return {
    width: Math.max(1, width - insets.left - insets.right),
    height: Math.max(1, height - insets.top - insets.bottom),
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
