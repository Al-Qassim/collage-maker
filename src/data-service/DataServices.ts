import type { ImageExportService } from "./ImageExportService";
import type { LocalDataService } from "./LocalDataService";

export interface DataServices {
  local: LocalDataService;
  imageExporter: ImageExportService;
}
