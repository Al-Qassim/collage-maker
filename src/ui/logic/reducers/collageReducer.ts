import {
  cloneLayout,
  emptyFrameIds,
  findFrame,
  findFrameBounds,
  removeFrameArea,
  replaceFrame,
  updateSplit,
} from "../layouts/layoutTree";
import {
  DEFAULT_IMAGE_TRANSFORM,
  type CanvasSettings,
  type CollageState,
  type FrameEdge,
  type FrameNode,
  type ImageTransformField,
  type LayoutNode,
  type SplitDirection,
  type SplitPosition,
} from "../../../models";
import type { CollageHistoryState } from "../CollageScreenState";
import { createBuiltInFeatureLayout } from "../layouts/builtInLayouts";
import {
  fitLayoutImages,
  generateImageLayout,
  imageFrames,
} from "../layouts/generateLayout";

interface AddedImage {
  source: string;
  alt: string;
  width: number;
  height: number;
}

export type CollageAction =
  | {
      type: "canvasChanged";
      field: keyof CanvasSettings;
      value: number;
    }
  | { type: "canvasSizeChanged"; width: number; height: number }
  | {
      type: "imagesAdded";
      frameId: string;
      images: AddedImage[];
      id: string;
    }
  | {
      type: "imageTransformChanged";
      frameId: string;
      field: ImageTransformField;
      value: number;
    }
  | { type: "frameImageRemoved"; frameId: string }
  | { type: "frameAreaRemoved"; frameId: string }
  | {
      type: "frameSplit";
      frameId: string;
      direction: SplitDirection;
      position: SplitPosition;
      id: string;
    }
  | {
      type: "imageMoved";
      sourceFrameId: string;
      targetFrameId: string;
      edge: FrameEdge;
      id: string;
    }
  | { type: "layoutApplied"; layout: LayoutNode }
  | { type: "splitResized"; splitId: string; ratio: number }
  | { type: "pageAdded"; pageId: string }
  | { type: "pageSelected"; pageId: string }
  | { type: "pageRemoved"; pageId: string }
  | { type: "layoutShuffled"; id: string; seed: number }
  | { type: "collageReset" };

export type HistoryAction =
  | { type: "apply"; action: CollageAction; record?: boolean }
  | { type: "checkpoint" }
  | { type: "undo" }
  | { type: "redo" };

const HISTORY_LIMIT = 64;

export function collageReducer(
  state: CollageState,
  action: CollageAction,
): CollageState {
  const next = reduceCollageState(state, action);
  return next === state ? state : syncActivePage(next);
}

function reduceCollageState(
  state: CollageState,
  action: CollageAction,
): CollageState {
  switch (action.type) {
    case "canvasSizeChanged": {
      const width = clampCanvasValue("width", action.width);
      const height = clampCanvasValue("height", action.height);
      if (state.canvas.width === width && state.canvas.height === height)
        return state;
      return { ...state, canvas: { ...state.canvas, width, height } };
    }
    case "canvasChanged": {
      const value = clampCanvasValue(action.field, action.value);
      if (state.canvas[action.field] === value) return state;
      return {
        ...state,
        canvas: { ...state.canvas, [action.field]: value },
      };
    }
    case "imagesAdded": {
      const targets = [
        action.frameId,
        ...emptyFrameIds(state.layout, action.frameId),
      ];
      if (action.images.length > targets.length) {
        const preservedFrames = imageFrames(state.layout).filter(
          (frame) => frame.id !== action.frameId,
        );
        const importedFrames = action.images.map((image, index) => ({
          id: `import-${action.id}-${index}`,
          type: "frame" as const,
          image: image.source,
          alt: image.alt,
          transform: {
            ...DEFAULT_IMAGE_TRANSFORM,
            baseWidth: image.width,
            baseHeight: image.height,
          },
        }));
        const layout = generateImageLayout(
          [...preservedFrames, ...importedFrames],
          action.id,
        );
        return { ...state, layout: fitLayoutImages(layout, state.canvas) };
      }

      let layout = state.layout;
      action.images.forEach((image, index) => {
        const frameId = targets[index];
        const frame = findFrame(layout, frameId);
        if (!frame) return;
        const bounds = findFrameBounds(
          layout,
          frameId,
          Math.max(1, state.canvas.width - state.canvas.spacing * 2),
          Math.max(1, state.canvas.height - state.canvas.spacing * 2),
          state.canvas.spacing,
        );
        const fitScale = bounds
          ? Math.max(bounds.width / image.width, bounds.height / image.height)
          : 1;
        layout = replaceFrame(layout, frameId, {
          ...frame,
          image: image.source,
          alt: image.alt,
          transform: {
            ...DEFAULT_IMAGE_TRANSFORM,
            baseWidth: image.width * fitScale,
            baseHeight: image.height * fitScale,
          },
        });
      });
      return { ...state, layout };
    }
    case "imageTransformChanged": {
      const frame = findFrame(state.layout, action.frameId);
      if (!frame) return state;
      const transform = frame.transform ?? DEFAULT_IMAGE_TRANSFORM;
      const value = clampTransformValue(action.field, action.value);
      if (transform[action.field] === value) return state;
      return {
        ...state,
        layout: replaceFrame(state.layout, action.frameId, {
          ...frame,
          transform: { ...transform, [action.field]: value },
        }),
      };
    }
    case "frameImageRemoved": {
      const frame = findFrame(state.layout, action.frameId);
      if (!frame) return state;
      return {
        ...state,
        layout: replaceFrame(state.layout, action.frameId, {
          ...frame,
          image: undefined,
          alt: undefined,
          transform: undefined,
        }),
      };
    }
    case "frameAreaRemoved": {
      const layout = removeFrameArea(state.layout, action.frameId);
      return layout === state.layout ? state : { ...state, layout };
    }
    case "frameSplit": {
      const frame = findFrame(state.layout, action.frameId);
      if (!frame) return state;
      const newFrameId = `frame-${action.id}`;
      const emptyFrame: FrameNode = { id: newFrameId, type: "frame" };
      const split = createSplit(
        frame,
        emptyFrame,
        action.direction,
        action.position,
        action.id,
      );
      return {
        ...state,
        layout: replaceFrame(state.layout, action.frameId, split),
      };
    }
    case "imageMoved": {
      const source = findFrame(state.layout, action.sourceFrameId);
      if (!source || action.sourceFrameId === action.targetFrameId)
        return state;
      const withoutSource = removeFrameArea(state.layout, action.sourceFrameId);
      const target = findFrame(withoutSource, action.targetFrameId);
      if (!target) return state;
      const direction = edgeDirection(action.edge);
      const position = edgePosition(action.edge);
      const movedFrame: FrameNode = {
        ...source,
        id: `frame-${action.id}`,
      };
      const split = createSplit(
        target,
        movedFrame,
        direction,
        position,
        action.id,
      );
      return {
        ...state,
        layout: replaceFrame(withoutSource, target.id, split),
      };
    }
    case "layoutApplied": {
      const layout = cloneLayout(action.layout);
      return { ...state, layout };
    }
    case "splitResized":
      return {
        ...state,
        layout: updateSplit(state.layout, action.splitId, action.ratio),
      };
    case "pageAdded": {
      const layout = createBuiltInFeatureLayout();
      return {
        ...state,
        layout,
        activePageId: action.pageId,
        pages: [...state.pages, { id: action.pageId, layout }],
      };
    }
    case "pageSelected": {
      const page = state.pages.find(
        (candidate) => candidate.id === action.pageId,
      );
      if (!page || page.id === state.activePageId) return state;
      return { ...state, activePageId: page.id, layout: page.layout };
    }
    case "pageRemoved": {
      if (state.pages.length === 1) return state;
      const pages = state.pages.filter((page) => page.id !== action.pageId);
      if (pages.length === state.pages.length) return state;
      if (action.pageId !== state.activePageId) return { ...state, pages };
      const page = pages[0];
      return { ...state, pages, activePageId: page.id, layout: page.layout };
    }
    case "layoutShuffled": {
      const frames = imageFrames(state.layout);
      if (frames.length < 2) return state;
      const layout = generateImageLayout(frames, action.id, action.seed);
      return { ...state, layout: fitLayoutImages(layout, state.canvas) };
    }
    case "collageReset": {
      const pageId = `page-${crypto.randomUUID()}`;
      const layout = createBuiltInFeatureLayout();
      return {
        ...state,
        layout,
        activePageId: pageId,
        pages: [{ id: pageId, layout }],
      };
    }
  }
}

function syncActivePage(state: CollageState): CollageState {
  const activePage = state.pages.find((page) => page.id === state.activePageId);
  if (!activePage || activePage.layout === state.layout) return state;
  return {
    ...state,
    pages: state.pages.map((page) =>
      page.id === state.activePageId ? { ...page, layout: state.layout } : page,
    ),
  };
}

function createSplit(
  current: FrameNode,
  added: FrameNode,
  direction: SplitDirection,
  position: SplitPosition,
  id: string,
): LayoutNode {
  return {
    id: `split-${id}`,
    type: "split",
    direction,
    ratio: 0.5,
    first: position === "before" ? added : current,
    second: position === "before" ? current : added,
  };
}

function edgeDirection(edge: FrameEdge): SplitDirection {
  return edge === "left" || edge === "right" ? "vertical" : "horizontal";
}

function edgePosition(edge: FrameEdge): SplitPosition {
  return edge === "left" || edge === "top" ? "before" : "after";
}

export function historyReducer(
  history: CollageHistoryState,
  action: HistoryAction,
): CollageHistoryState {
  if (action.type === "undo") {
    const previous = history.past[history.past.length - 1];
    if (!previous) return history;
    return {
      past: history.past.slice(0, -1),
      present: previous,
      future: [history.present, ...history.future].slice(0, HISTORY_LIMIT),
    };
  }

  if (action.type === "redo") {
    const next = history.future[0];
    if (!next) return history;
    return {
      past: [...history.past, history.present].slice(-HISTORY_LIMIT),
      present: next,
      future: history.future.slice(1),
    };
  }

  if (action.type === "checkpoint") {
    return {
      past: [...history.past, history.present].slice(-HISTORY_LIMIT),
      present: history.present,
      future: [],
    };
  }

  const present = collageReducer(history.present, action.action);
  if (present === history.present) return history;
  if (action.record === false) return { ...history, present };

  return {
    past: [...history.past, history.present].slice(-HISTORY_LIMIT),
    present,
    future: [],
  };
}

function clampTransformValue(
  field: ImageTransformField,
  value: number,
): number {
  const limits: Record<ImageTransformField, [number, number]> = {
    zoom: [0.1, 10],
    offsetX: [-1000, 1000],
    offsetY: [-1000, 1000],
  };
  const [min, max] = limits[field];
  const precision = field === "zoom" ? 100 : 1;
  return (
    Math.round(Math.min(max, Math.max(min, value)) * precision) / precision
  );
}

function clampCanvasValue(field: keyof CanvasSettings, value: number): number {
  const limits: Record<keyof CanvasSettings, [number, number]> = {
    width: [100, 8000],
    height: [100, 8000],
    spacing: [0, 80],
    radius: [0, 200],
  };
  const [min, max] = limits[field];
  return Math.round(Math.min(max, Math.max(min, value || min)));
}
