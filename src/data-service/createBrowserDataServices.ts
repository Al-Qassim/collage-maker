import type { DataServices } from "./DataServices";
import { BrowserAnalyticsService } from "./services/BrowserAnalyticsService";
import { BrowserImageExportService } from "./services/BrowserImageExportService";
import { BrowserLocalDataService } from "./services/BrowserLocalDataService";
import { BrowserProjectFileService } from "./services/BrowserProjectFileService";

export function createBrowserDataServices(): DataServices {
  return {
    analytics: new BrowserAnalyticsService(
      import.meta.env.VITE_GA_MEASUREMENT_ID,
    ),
    local: new BrowserLocalDataService(),
    imageExporter: new BrowserImageExportService(),
    projectFiles: new BrowserProjectFileService(),
  };
}
