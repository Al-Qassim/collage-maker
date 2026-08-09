import type {
  CanvasSettings,
  ExportFormat,
  FrameEdge,
  ImageTransformField,
  LayoutNode,
  SplitDirection,
  SplitPosition,
} from "../../models";

export interface CollageScreenCommands {
  changeCanvas(field: keyof CanvasSettings, value: number | string): void;
  previewCanvas(field: keyof CanvasSettings, value: number): void;
  commitCanvas(field: keyof CanvasSettings, value: number): void;
  setCanvasSize(width: number, height: number): void;
  addImages(frameId: string, files: FileList | File[]): void;
  changeImageTransform(
    frameId: string,
    field: ImageTransformField,
    value: number,
  ): void;
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
  applyLayout(layout: LayoutNode): void;
  beginAdjustment(): void;
  resizeSplit(splitId: string, ratio: number): void;
  undo(): void;
  redo(): void;
  startNewCollage(): void;
  exportImage(format: ExportFormat, fileName?: string): Promise<void>;
}
