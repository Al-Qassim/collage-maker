import { useState, type DragEvent, type MouseEvent } from "react";
import type { FrameEdge, SplitDirection, SplitPosition } from "../../../models";
import { FRAME_DRAG_TYPE } from "./dragTypes";

interface FrameActions {
  addImages(frameId: string, files: FileList | File[]): void;
  removeImage(frameId: string): void;
  removeArea(frameId: string): void;
  splitFrame(
    frameId: string,
    direction: SplitDirection,
    position: SplitPosition,
  ): void;
  moveImage(
    sourceFrameId: string,
    targetFrameId: string,
    edge: FrameEdge,
  ): void;
}

export function useFrameHoverActions(
  frameId: string,
  hasImage: boolean,
  canRemoveArea: boolean,
  actions: FrameActions,
) {
  const [hovered, setHovered] = useState(false);
  const [hoverEdge, setHoverEdge] = useState<FrameEdge>();
  const [dropEdge, setDropEdge] = useState<FrameEdge>();

  const trackEdge = (event: MouseEvent<HTMLDivElement>) => {
    setHoverEdge(
      edgeNearPointer(event.currentTarget, event.clientX, event.clientY),
    );
  };
  const dragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!event.dataTransfer.types.includes(FRAME_DRAG_TYPE)) return;
    setDropEdge(nearestEdge(event.currentTarget, event.clientX, event.clientY));
  };
  const drop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData(FRAME_DRAG_TYPE);
    if (sourceId) actions.moveImage(sourceId, frameId, dropEdge ?? "right");
    else if (event.dataTransfer.files.length) {
      actions.addImages(frameId, event.dataTransfer.files);
    }
    setDropEdge(undefined);
  };

  const overlayActions = {
    split: (edge: FrameEdge) => splitAtEdge(frameId, edge, actions),
    remove: () => {
      if (hasImage) actions.removeImage(frameId);
      else if (canRemoveArea) actions.removeArea(frameId);
    },
    startMove: (event: DragEvent<HTMLButtonElement>) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData(FRAME_DRAG_TYPE, frameId);
    },
  };

  return {
    hovered,
    activeEdge: dropEdge ?? hoverEdge,
    overlayActions,
    frameHandlers: {
      onMouseEnter: () => setHovered(true),
      onMouseMove: trackEdge,
      onMouseLeave: () => {
        setHovered(false);
        setHoverEdge(undefined);
      },
      onDragOver: dragOver,
      onDragLeave: () => setDropEdge(undefined),
      onDrop: drop,
    },
  };
}

function splitAtEdge(frameId: string, edge: FrameEdge, actions: FrameActions) {
  const vertical = edge === "left" || edge === "right";
  const before = edge === "left" || edge === "top";
  actions.splitFrame(
    frameId,
    vertical ? "vertical" : "horizontal",
    before ? "before" : "after",
  );
}

function edgeNearPointer(element: HTMLElement, x: number, y: number) {
  const bounds = element.getBoundingClientRect();
  const edge = nearestEdge(element, x, y);
  const vertical = edge === "left" || edge === "right";
  const distance = vertical
    ? Math.min(x - bounds.left, bounds.right - x)
    : Math.min(y - bounds.top, bounds.bottom - y);
  const cornerMargin = vertical
    ? Math.min(36, bounds.height * 0.2)
    : Math.min(36, bounds.width * 0.2);
  const centered = vertical
    ? y > bounds.top + cornerMargin && y < bounds.bottom - cornerMargin
    : x > bounds.left + cornerMargin && x < bounds.right - cornerMargin;
  return distance <= 54 && centered ? edge : undefined;
}

function nearestEdge(element: HTMLElement, x: number, y: number): FrameEdge {
  const bounds = element.getBoundingClientRect();
  const distances: Array<[FrameEdge, number]> = [
    ["top", y - bounds.top],
    ["right", bounds.right - x],
    ["bottom", bounds.bottom - y],
    ["left", x - bounds.left],
  ];
  distances.sort((first, second) => first[1] - second[1]);
  return distances[0][0];
}
