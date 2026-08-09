export type SplitDirection = "vertical" | "horizontal";

export type FrameNode = {
  id: string;
  type: "frame";
  image?: string;
  alt?: string;
};

export type SplitNode = {
  id: string;
  type: "split";
  direction: SplitDirection;
  ratio: number;
  first: LayoutNode;
  second: LayoutNode;
};

export type LayoutNode = FrameNode | SplitNode;

export type CanvasSettings = {
  width: number;
  height: number;
  spacing: number;
  radius: number;
};

export type CollageState = {
  title: string;
  canvas: CanvasSettings;
  selectedFrameId: string;
  layout: LayoutNode;
};

export type CollageInitialState = Partial<CollageState>;

export interface CollageCommands {
  selectFrame(frameId: string): void;
  changeCanvas(field: keyof CanvasSettings, value: number | string): void;
  splitFrame(direction: SplitDirection): void;
  resizeSplit(splitId: string, ratio: number): void;
  deleteSelected(): void;
  addImages(files: FileList | File[]): void;
  startNewLayout(): void;
}

export const initialImages = {
  ocean: "https://images.unsplash.com/photo-1494094897030-36c8caacdc07?auto=format&fit=crop&w=900&q=85",
  breakfast: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=900&q=85",
  flowers: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=800&q=85",
  walk: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=900&q=85",
};

export const DEFAULT_CANVAS: CanvasSettings = { width: 1080, height: 1350, spacing: 12, radius: 16 };
