import { useState } from "react";
import type { LocalDataService } from "../../../data-service";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.25;

export function useCanvasZoom(database: LocalDataService) {
  const [zoom, setZoom] = useState(() =>
    clampZoom(database.loadCanvasZoom() ?? 1),
  );

  const updateZoom = (next: number) => {
    const value = clampZoom(next);
    database.saveCanvasZoom(value);
    setZoom(value);
  };

  return {
    zoom,
    canZoomIn: zoom < MAX_ZOOM,
    canZoomOut: zoom > MIN_ZOOM,
    zoomIn: () => updateZoom(zoom + ZOOM_STEP),
    zoomOut: () => updateZoom(zoom - ZOOM_STEP),
    resetZoom: () => updateZoom(1),
  };
}

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}
