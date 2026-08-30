import type {
  CanvasSettings,
  CollagePage,
  CollageState,
  ExportFormat,
  ExportScope,
  FrameEdge,
  ImageTransformField,
  LayoutNode,
  SavedLayout,
  SplitDirection,
  SplitPosition,
  Language,
  Theme,
} from "../../models";
import type { CollageScreenCommands } from "./CollageScreenCommands";

export interface CanvasView {
  layout: LayoutNode;
  settings: CanvasSettings;
  pages: CollagePage[];
  activePageId: string;
}

export interface CanvasActions {
  addImages(frameId: string, files: FileList | File[]): void;
  removeImage(frameId: string): void;
  removeArea(frameId: string): void;
  beginAdjustment(): void;
  resizeSplit(splitId: string, ratio: number): void;
  setFrameSize(frameId: string, width?: number, height?: number): void;
  changeImageTransform(
    frameId: string,
    field: ImageTransformField,
    value: number,
  ): void;
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
}

export interface PageActions {
  add(): void;
  select(pageId: string): void;
  remove(pageId: string): void;
}

export interface CanvasZoomView {
  value: number;
  canZoomIn: boolean;
  canZoomOut: boolean;
}

export interface CanvasZoomActions {
  zoomIn(): void;
  zoomOut(): void;
  reset(): void;
}

export interface InspectorView {
  canvas: CanvasSettings;
  canClear: boolean;
  savedLayouts: SavedLayout[];
  preferences: { theme: Theme; language: Language };
}

export interface InspectorActions {
  changeCanvas(field: keyof CanvasSettings, value: number | string): void;
  previewCanvas(field: keyof CanvasSettings, value: number): void;
  commitCanvas(field: keyof CanvasSettings, value: number): void;
  beginAdjustment(): void;
  setCanvasSize(width: number, height: number): void;
  saveLayout(): void;
  applyLayout(layout: LayoutNode): void;
  deleteLayout(layoutId: string): void;
  newCollage(): void;
  clearPage(): void;
  saveProject(): void;
  openProject(file: File): void;
  toggleTheme(): void;
  toggleLanguage(): void;
}

export interface EditorView {
  collage: CollageState;
  canUndo: boolean;
  canRedo: boolean;
  canShuffle: boolean;
  canClear: boolean;
  exporting: boolean;
  exportError?: string;
  zoom: CanvasZoomView;
  savedLayouts: SavedLayout[];
  exportFormat: ExportFormat;
  preferences: { theme: Theme; language: Language };
}

export interface EditorActions {
  collage: CollageScreenCommands;
  zoom: CanvasZoomActions;
  newCollage(): void;
  clearPage(): void;
  saveProject(): void;
  openProject(file: File): void;
  exportImages(scope: ExportScope): void;
  setExportFormat(format: ExportFormat): void;
  saveLayout(): void;
  deleteLayout(layoutId: string): void;
  toggleTheme(): void;
  toggleLanguage(): void;
}
