import type {
  CanvasSettings,
  ExportFormat,
  Language,
  SavedLayout,
  Theme,
} from "../models";

export interface LocalDataService {
  loadCanvasSettings(): CanvasSettings | undefined;
  saveCanvasSettings(settings: CanvasSettings): void;
  loadSavedLayouts(): SavedLayout[];
  saveSavedLayouts(layouts: SavedLayout[]): void;
  loadCanvasZoom(): number | undefined;
  saveCanvasZoom(zoom: number): void;
  loadTheme(): Theme | undefined;
  saveTheme(theme: Theme): void;
  loadLanguage(): Language | undefined;
  saveLanguage(language: Language): void;
  loadExportFormat(): ExportFormat | undefined;
  saveExportFormat(format: ExportFormat): void;
}
