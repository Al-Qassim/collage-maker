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
  const addImages = (frameId: string, files: FileList | File[]) => {
    const imageFiles = Array.from(files);
    if (!imageFiles.length) return;

    void Promise.allSettled(
      imageFiles.map(async (file) => {
        const source = URL.createObjectURL(file);
        const dimensions = await loadImageDimensions(source);
        return { source, alt: file.name, ...dimensions };
      }),
    ).then((results) => {
      const images = results.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : [],
      );
      if (!images.length) return;
      dispatch({
        type: "apply",
        action: {
          type: "imagesAdded",
          frameId,
          images,
          id: crypto.randomUUID(),
        },
      });
      services.analytics.track("images_imported", {
        image_count: images.length,
      });
    });
  };

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
      const marginHorizontal = Math.min(
        state.canvas.marginHorizontal,
        Math.max(0, (width - 1) / 2),
      );
      const marginVertical = Math.min(
        state.canvas.marginVertical,
        Math.max(0, (height - 1) / 2),
      );
      services.local.saveCanvasSettings({
        ...state.canvas,
        width,
        height,
        marginHorizontal,
        marginVertical,
      });
      dispatch({
        type: "apply",
        action: { type: "canvasSizeChanged", width, height },
      });
    },
    addImages: (frameId, files) => addImages(frameId, files),
    setFrameSize: (frameId, width, height) =>
      dispatch({
        type: "apply",
        action: { type: "frameSizeChanged", frameId, width, height },
      }),
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
    addPage: () => {
      dispatch({
        type: "apply",
        action: { type: "pageAdded", pageId: `page-${crypto.randomUUID()}` },
      });
      services.analytics.track("page_added", {
        page_count: state.pages.length + 1,
      });
    },
    selectPage: (pageId) =>
      dispatch({ type: "apply", action: { type: "pageSelected", pageId } }),
    removePage: (pageId) =>
      dispatch({ type: "apply", action: { type: "pageRemoved", pageId } }),
    shuffleLayout: () => {
      dispatch({
        type: "apply",
        action: {
          type: "layoutShuffled",
          id: crypto.randomUUID(),
          seed: Math.random(),
        },
      });
      services.analytics.track("layout_shuffled");
    },
    clearPage: () => {
      dispatch({
        type: "apply",
        action: { type: "pageCleared", id: crypto.randomUUID() },
      });
      services.analytics.track("page_cleared");
    },
    saveProject: async () => {
      await services.projectFiles.saveProject(state);
      services.analytics.track("project_saved", {
        page_count: state.pages.length,
      });
    },
    openProject: async (file) => {
      const projectState = await services.projectFiles.openProject(file);
      services.local.saveCanvasSettings(projectState.canvas);
      dispatch({
        type: "apply",
        action: { type: "projectOpened", state: projectState },
      });
      services.analytics.track("project_opened", {
        page_count: projectState.pages.length,
      });
    },
    undo: () => {
      const pageHistory = history.pastByPage[state.activePageId] ?? [];
      const previous = pageHistory[pageHistory.length - 1];
      if (previous) services.local.saveCanvasSettings(previous.canvas);
      dispatch({ type: "undo" });
    },
    redo: () => {
      const next = history.futureByPage[state.activePageId]?.[0];
      if (next) services.local.saveCanvasSettings(next.canvas);
      dispatch({ type: "redo" });
    },
    startNewCollage: () =>
      dispatch({ type: "apply", action: { type: "collageReset" } }),
    exportImages: async (format, scope, options) => {
      const pages =
        scope === "all"
          ? state.pages
          : state.pages.filter((page) => page.id === state.activePageId);
      for (const [index, page] of pages.entries()) {
        await services.imageExporter.exportImage(
          { ...state, layout: page.layout },
          format,
          options,
          scope === "all" ? `collage-page-${index + 1}` : undefined,
        );
      }
      services.analytics.track("images_exported", {
        export_format: format,
        export_scope: scope,
        page_count: pages.length,
        transparent_background: options.transparentBackground ? 1 : 0,
      });
    },
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
