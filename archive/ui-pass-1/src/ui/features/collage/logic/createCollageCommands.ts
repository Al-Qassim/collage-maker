import type { CollageCommands, CollageState } from "../models/collage";
import type { Dispatch } from "react";
import type { CollageAction } from "../state/collageReducer";

export function createCollageCommands({ state, dispatch }: { state: CollageState; dispatch: Dispatch<CollageAction> }): CollageCommands {
  return {
    selectFrame: (frameId) => dispatch({ type: "frameSelected", frameId }),
    changeCanvas: (field, value) => dispatch({ type: "canvasChanged", field, value: Number(value) }),
    splitFrame: (direction) => dispatch({ type: "frameSplit", frameId: state.selectedFrameId, direction, id: crypto.randomUUID() }),
    resizeSplit: (splitId, ratio) => dispatch({ type: "splitResized", splitId, ratio }),
    deleteSelected: () => dispatch({ type: "frameDeleted", frameId: state.selectedFrameId }),
    addImages: (files) => {
      const images = Array.from(files).filter((file) => file.type.startsWith("image/")).map((file) => ({ src: URL.createObjectURL(file), name: file.name }));
      if (images.length) dispatch({ type: "imagesAdded", images });
    },
    startNewLayout: () => dispatch({ type: "layoutReset" }),
  };
}
