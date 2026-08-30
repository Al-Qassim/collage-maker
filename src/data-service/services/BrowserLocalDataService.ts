import type { LocalDataService } from "../LocalDataService";
import type {
  CanvasSettings,
  ExportFormat,
  Language,
  SavedLayout,
  Theme,
} from "../../models";
import { readJson, readText, writeJson } from "./jsonStorage";

const keys = {
  canvas: "frame-collage-settings-v1",
  layouts: "frame-collage-saved-layouts-v1",
  zoom: "frame-collage-view-zoom-v1",
  theme: "frame-collage-theme-v1",
  language: "frame-collage-language-v1",
  exportFormat: "frame-collage-export-format-v1",
  alwaysShowMeasurements: "frame-collage-show-measurements-v1",
};

export class BrowserLocalDataService implements LocalDataService {
  loadCanvasSettings() {
    return readJson<CanvasSettings>(keys.canvas);
  }

  saveCanvasSettings(settings: CanvasSettings) {
    writeJson(keys.canvas, settings);
  }

  loadSavedLayouts() {
    return readJson<SavedLayout[]>(keys.layouts) ?? [];
  }

  saveSavedLayouts(layouts: SavedLayout[]) {
    writeJson(keys.layouts, layouts);
  }

  loadCanvasZoom() {
    const value = readJson<number>(keys.zoom);
    return Number.isFinite(value) ? value : undefined;
  }

  saveCanvasZoom(zoom: number) {
    writeJson(keys.zoom, zoom);
  }

  loadTheme() {
    const value = readJson<Theme>(keys.theme) ?? readText(keys.theme);
    return value === "light" || value === "dark" ? value : undefined;
  }

  saveTheme(theme: Theme) {
    writeJson(keys.theme, theme);
  }

  loadLanguage() {
    const value = readJson<Language>(keys.language) ?? readText(keys.language);
    return value === "en" || value === "ar" ? value : undefined;
  }

  saveLanguage(language: Language) {
    writeJson(keys.language, language);
  }

  loadExportFormat() {
    const value = readJson<ExportFormat>(keys.exportFormat);
    return value === "jpg" || value === "png" ? value : undefined;
  }

  saveExportFormat(format: ExportFormat) {
    writeJson(keys.exportFormat, format);
  }

  loadAlwaysShowMeasurements() {
    const value = readJson<boolean>(keys.alwaysShowMeasurements);
    return typeof value === "boolean" ? value : undefined;
  }

  saveAlwaysShowMeasurements(alwaysShow: boolean) {
    writeJson(keys.alwaysShowMeasurements, alwaysShow);
  }
}
