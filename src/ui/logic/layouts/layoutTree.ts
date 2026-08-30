import type { FrameNode, LayoutNode } from "../../../models";
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
  gap: number,
): { width: number; height: number } | undefined {
  if (node.type === "frame") {
    return node.id === frameId ? { width, height } : undefined;
  }

  const available =
    node.direction === "vertical"
      ? Math.max(1, width - gap)
      : Math.max(1, height - gap);
  const firstWidth =
    node.direction === "vertical" ? available * node.ratio : width;
  const firstHeight =
    node.direction === "horizontal" ? available * node.ratio : height;
  const secondWidth =
    node.direction === "vertical" ? available - firstWidth : width;
  const secondHeight =
    node.direction === "horizontal" ? available - firstHeight : height;

  return (
    findFrameBounds(node.first, frameId, firstWidth, firstHeight, gap) ??
    findFrameBounds(node.second, frameId, secondWidth, secondHeight, gap)
  );
}

export function resizeFrameToDimensions(
  node: LayoutNode,
  frameId: string,
  width: number | undefined,
  height: number | undefined,
  canvasWidth: number,
  canvasHeight: number,
  gap: number,
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
      gap,
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
      gap,
    ).node;
  }
  return resized;
}

interface DimensionResizeResult {
  node: LayoutNode;
  found: boolean;
  resized: boolean;
}

function resizeFrameDimension(
  node: LayoutNode,
  frameId: string,
  dimension: "width" | "height",
  target: number,
  width: number,
  height: number,
  gap: number,
): DimensionResizeResult {
  if (node.type === "frame") {
    return { node, found: node.id === frameId, resized: false };
  }

  const available =
    node.direction === "vertical"
      ? Math.max(1, width - gap)
      : Math.max(1, height - gap);
  const firstWidth =
    node.direction === "vertical" ? available * node.ratio : width;
  const firstHeight =
    node.direction === "horizontal" ? available * node.ratio : height;
  const secondWidth =
    node.direction === "vertical" ? available - firstWidth : width;
  const secondHeight =
    node.direction === "horizontal" ? available - firstHeight : height;
  const firstResult = resizeFrameDimension(
    node.first,
    frameId,
    dimension,
    target,
    firstWidth,
    firstHeight,
    gap,
  );
  const inFirst = firstResult.found;
  const childResult = inFirst
    ? firstResult
    : resizeFrameDimension(
        node.second,
        frameId,
        dimension,
        target,
        secondWidth,
        secondHeight,
        gap,
      );
  if (!childResult.found) return { node, found: false, resized: false };

  const childKey = inFirst ? "first" : "second";
  const withChild =
    childResult.node === node[childKey]
      ? node
      : { ...node, [childKey]: childResult.node };
  const matchingDirection =
    (dimension === "width" && node.direction === "vertical") ||
    (dimension === "height" && node.direction === "horizontal");
  if (childResult.resized || !matchingDirection) {
    return { node: withChild, found: true, resized: childResult.resized };
  }

  const desiredShare = Math.min(0.9, Math.max(0.1, target / available));
  const ratio = inFirst ? desiredShare : 1 - desiredShare;
  return {
    node: { ...withChild, ratio },
    found: true,
    resized: true,
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
