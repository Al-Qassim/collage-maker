import type { Dispatch } from "react";
import type { DataServices } from "../../../data-service";
import type { CollageScreenCommands } from "../CollageScreenCommands";
import type { CollageHistoryState } from "../CollageScreenState";
import type { HistoryAction } from "../reducers/collageReducer";

export function createCollageCommands({
  history,
  dispatch,
  services,
}: {
  history: CollageHistoryState;
  dispatch: Dispatch<HistoryAction>;
  services: DataServices;
}): CollageScreenCommands {
  const state = history.present;

  return {
    changeCanvas: (field, value) => {
      services.local.saveCanvasSettings({
        ...state.canvas,
        [field]: Number(value),
      });
      dispatch({
        type: "apply",
        action: { type: "canvasChanged", field, value: Number(value) },
      });
    },
    previewCanvas: (field, value) =>
      dispatch({
        type: "apply",
        action: { type: "canvasChanged", field, value },
        record: false,
      }),
    commitCanvas: (field, value) =>
      services.local.saveCanvasSettings({
        ...state.canvas,
        [field]: value,
      }),
    setCanvasSize: (width, height) => {
      services.local.saveCanvasSettings({ ...state.canvas, width, height });
      dispatch({
        type: "apply",
        action: { type: "canvasSizeChanged", width, height },
      });
    },
    addImages: (frameId, files) => {
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/"),
      );
      if (!imageFiles.length) return;

      void Promise.all(
        imageFiles.map(async (file) => {
          const source = URL.createObjectURL(file);
          const dimensions = await loadImageDimensions(source);
          return { source, alt: file.name, ...dimensions };
        }),
      ).then((images) =>
        dispatch({
          type: "apply",
          action: { type: "imagesAdded", frameId, images },
        }),
      );
    },
    changeImageTransform: (frameId, field, value) =>
      dispatch({
        type: "apply",
        action: { type: "imageTransformChanged", frameId, field, value },
        record: false,
      }),
    removeImage: (frameId) =>
      dispatch({
        type: "apply",
        action: { type: "frameImageRemoved", frameId },
      }),
    removeArea: (frameId) =>
      dispatch({
        type: "apply",
        action: { type: "frameAreaRemoved", frameId },
      }),
    splitFrame: (frameId, direction, position) =>
      dispatch({
        type: "apply",
        action: {
          type: "frameSplit",
          frameId,
          direction,
          position,
          id: crypto.randomUUID(),
        },
      }),
    moveImage: (sourceFrameId, targetFrameId, edge) =>
      dispatch({
        type: "apply",
        action: {
          type: "imageMoved",
          sourceFrameId,
          targetFrameId,
          edge,
          id: crypto.randomUUID(),
        },
      }),
    applyLayout: (layout) =>
      dispatch({ type: "apply", action: { type: "layoutApplied", layout } }),
    beginAdjustment: () => dispatch({ type: "checkpoint" }),
    resizeSplit: (splitId, ratio) =>
      dispatch({
        type: "apply",
        action: { type: "splitResized", splitId, ratio },
        record: false,
      }),
    undo: () => {
      const previous = history.past[history.past.length - 1];
      if (previous) services.local.saveCanvasSettings(previous.canvas);
      dispatch({ type: "undo" });
    },
    redo: () => {
      const next = history.future[0];
      if (next) services.local.saveCanvasSettings(next.canvas);
      dispatch({ type: "redo" });
    },
    startNewCollage: () =>
      dispatch({ type: "apply", action: { type: "collageReset" } }),
    exportImage: (format, fileName) =>
      services.imageExporter.exportImage(state, format, fileName),
  };
}

function loadImageDimensions(
  source: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("The image could not be loaded."));
    image.src = source;
  });
}
