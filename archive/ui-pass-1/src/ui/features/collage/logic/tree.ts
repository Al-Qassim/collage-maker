import type { FrameNode, LayoutNode } from "../models/collage";

export function findFrame(node: LayoutNode, frameId: string): FrameNode | undefined {
  if (node.type === "frame") return node.id === frameId ? node : undefined;
  return findFrame(node.first, frameId) ?? findFrame(node.second, frameId);
}

export function replaceFrame(node: LayoutNode, frameId: string, replacement: LayoutNode): LayoutNode {
  if (node.type === "frame") return node.id === frameId ? replacement : node;
  return { ...node, first: replaceFrame(node.first, frameId, replacement), second: replaceFrame(node.second, frameId, replacement) };
}

export function updateSplit(node: LayoutNode, splitId: string, ratio: number): LayoutNode {
  if (node.type === "frame") return node;
  if (node.id === splitId) return { ...node, ratio: Math.min(.9, Math.max(.1, ratio)) };
  return { ...node, first: updateSplit(node.first, splitId, ratio), second: updateSplit(node.second, splitId, ratio) };
}

export function firstEmptyFrame(node: LayoutNode): FrameNode | undefined {
  if (node.type === "frame") return node.image ? undefined : node;
  return firstEmptyFrame(node.first) ?? firstEmptyFrame(node.second);
}
