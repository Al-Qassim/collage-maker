import type { AnalyticsService } from "./AnalyticsService";
import type { ImageExportService } from "./ImageExportService";
import type { LocalDataService } from "./LocalDataService";
import type { ProjectFileService } from "./ProjectFileService";

export interface DataServices {
  analytics: AnalyticsService;
  local: LocalDataService;
  imageExporter: ImageExportService;
  projectFiles: ProjectFileService;
}
