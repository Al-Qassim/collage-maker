import { useState, type DragEvent } from "react";
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
  imageSource: string | undefined,
  canRemoveArea: boolean,
  actions: FrameActions,
) {
  const [hovered, setHovered] = useState(false);
  const hasImage = Boolean(imageSource);
  const [dropEdge, setDropEdge] = useState<FrameEdge>();
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
      const preview = createDragPreview(imageSource);
      event.dataTransfer.setDragImage(preview, 38, 29);
      window.setTimeout(() => preview.remove(), 0);
    },
  };

  return {
    hovered,
    dragEdge: dropEdge,
    overlayActions,
    frameHandlers: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onDragOver: dragOver,
      onDragLeave: () => setDropEdge(undefined),
      onDrop: drop,
    },
  };
}

function createDragPreview(imageSource?: string): HTMLDivElement {
  const preview = document.createElement("div");
  Object.assign(preview.style, {
    position: "fixed",
    top: "-1000px",
    left: "-1000px",
    width: "76px",
    height: "58px",
    boxSizing: "border-box",
    border: imageSource ? "2px solid white" : "2px dashed #789487",
    borderRadius: "7px",
    backgroundColor: "#dce9df",
    backgroundImage: imageSource ? `url(\"${imageSource}\")` : "none",
    backgroundPosition: "center",
    backgroundSize: "cover",
    boxShadow: "0 5px 14px rgb(18 22 20 / 32%)",
  });
  if (!imageSource) {
    const divider = document.createElement("span");
    Object.assign(divider.style, {
      position: "absolute",
      top: "7px",
      bottom: "7px",
      left: "50%",
      borderLeft: "1px dashed #789487",
    });
    preview.append(divider);
  }
  document.body.append(preview);
  return preview;
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
