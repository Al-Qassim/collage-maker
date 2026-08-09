import type { CanvasSettings, CollageState, LayoutNode, SplitDirection } from "../models/collage";
import { findFrame, firstEmptyFrame, replaceFrame, updateSplit } from "../logic/tree";

type AddedImage = { src: string; name: string };
export type CollageAction =
  | { type: "frameSelected"; frameId: string }
  | { type: "canvasChanged"; field: keyof CanvasSettings; value: number }
  | { type: "frameDeleted"; frameId: string }
  | { type: "frameSplit"; frameId: string; direction: SplitDirection; id: string }
  | { type: "splitResized"; splitId: string; ratio: number }
  | { type: "imagesAdded"; images: AddedImage[] }
  | { type: "layoutReset" };

export function collageReducer(state: CollageState, action: CollageAction): CollageState {
  switch (action.type) {
    case "frameSelected": return { ...state, selectedFrameId: action.frameId };
    case "canvasChanged": return { ...state, canvas: { ...state.canvas, [action.field]: action.value } };
    case "frameDeleted": {
      const frame = findFrame(state.layout, action.frameId);
      return frame ? { ...state, layout: replaceFrame(state.layout, action.frameId, { ...frame, image: undefined, alt: undefined }) } : state;
    }
    case "frameSplit": {
      const current = findFrame(state.layout, action.frameId);
      if (!current) return state;
      const newFrameId = `frame-${action.id}`;
      const split: LayoutNode = { id: `split-${action.id}`, type: "split", direction: action.direction, ratio: .5, first: current, second: { id: newFrameId, type: "frame" } };
      return { ...state, layout: replaceFrame(state.layout, action.frameId, split), selectedFrameId: newFrameId };
    }
    case "splitResized": return { ...state, layout: updateSplit(state.layout, action.splitId, action.ratio) };
    case "imagesAdded": {
      let layout = state.layout;
      let selectedFrameId = state.selectedFrameId;
      action.images.forEach((image) => {
        const target = findFrame(layout, selectedFrameId) ?? firstEmptyFrame(layout);
        if (!target) return;
        layout = replaceFrame(layout, target.id, { ...target, image: image.src, alt: image.name });
        selectedFrameId = firstEmptyFrame(layout)?.id ?? target.id;
      });
      return { ...state, layout, selectedFrameId };
    }
    case "layoutReset": return { ...state, selectedFrameId: "frame-root", layout: { id: "frame-root", type: "frame" } };
    default: return state;
  }
}
