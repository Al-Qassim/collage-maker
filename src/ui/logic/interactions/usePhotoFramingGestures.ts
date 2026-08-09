import { useEffect, useRef, type PointerEvent, type WheelEvent } from "react";
import {
  DEFAULT_IMAGE_TRANSFORM,
  type FrameNode,
  type ImageTransformField,
} from "../../../models";

interface Dependencies {
  frame: FrameNode;
  beginAdjustment(): void;
  changeTransform(
    frameId: string,
    field: ImageTransformField,
    value: number,
  ): void;
}

export function usePhotoFramingGestures({
  frame,
  beginAdjustment,
  changeTransform,
}: Dependencies) {
  const pointer = useRef<PointerStart | undefined>(undefined);
  const didDrag = useRef(false);
  const wheelActive = useRef(false);
  const wheelTimer = useRef<number | undefined>(undefined);
  const transform = frame.transform ?? DEFAULT_IMAGE_TRANSFORM;
  const wheelZoom = useRef(transform.zoom);

  if (!wheelActive.current) wheelZoom.current = transform.zoom;
  useEffect(() => () => window.clearTimeout(wheelTimer.current), []);

  const startDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (!frame.image || event.button !== 0) return;
    didDrag.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointer.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      offsetX: transform.offsetX,
      offsetY: transform.offsetY,
      started: false,
    };
  };

  const drag = (event: PointerEvent<HTMLButtonElement>) => {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (!start.started && Math.hypot(deltaX, deltaY) < 3) return;
    if (!start.started) {
      start.started = true;
      didDrag.current = true;
      beginAdjustment();
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    changeTransform(
      frame.id,
      "offsetX",
      start.offsetX + (deltaX / bounds.width) * 100,
    );
    changeTransform(
      frame.id,
      "offsetY",
      start.offsetY + (deltaY / bounds.height) * 100,
    );
  };

  const stopDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointer.current?.id !== event.pointerId) return;
    pointer.current = undefined;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const zoom = (event: WheelEvent<HTMLButtonElement>) => {
    if (!frame.image || event.ctrlKey) return;
    event.preventDefault();
    if (!wheelActive.current) {
      beginAdjustment();
      wheelActive.current = true;
    }
    window.clearTimeout(wheelTimer.current);
    wheelZoom.current = clampZoom(
      wheelZoom.current + (event.deltaY < 0 ? 0.05 : -0.05),
    );
    changeTransform(frame.id, "zoom", wheelZoom.current);
    wheelTimer.current = window.setTimeout(() => {
      wheelActive.current = false;
    }, 250);
  };

  return { didDrag, startDrag, drag, stopDrag, zoom };
}

interface PointerStart {
  id: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  started: boolean;
}

function clampZoom(value: number): number {
  return Math.min(10, Math.max(0.1, value));
}
