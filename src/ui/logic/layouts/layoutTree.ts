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
