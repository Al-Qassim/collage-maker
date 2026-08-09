import { DEFAULT_CANVAS, initialImages, type CollageInitialState, type CollageState } from "../models/collage";

export function createInitialCollageState(overrides?: CollageInitialState): CollageState {
  return {
    title: "Sunday stories",
    canvas: DEFAULT_CANVAS,
    selectedFrameId: "flowers",
    layout: {
      id: "root", type: "split", direction: "horizontal", ratio: .72,
      first: {
        id: "top-split", type: "split", direction: "vertical", ratio: .62,
        first: { id: "ocean", type: "frame", image: initialImages.ocean, alt: "Aerial ocean waves" },
        second: {
          id: "right-split", type: "split", direction: "horizontal", ratio: .53,
          first: { id: "breakfast", type: "frame", image: initialImages.breakfast, alt: "Breakfast table" },
          second: { id: "flowers", type: "frame", image: initialImages.flowers, alt: "Purple flowers in hand" },
        },
      },
      second: { id: "walk", type: "frame", image: initialImages.walk, alt: "Person walking by the water" },
    },
    ...overrides,
  };
}
