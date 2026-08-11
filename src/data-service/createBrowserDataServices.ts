import type { DataServices } from "./DataServices";
import { BrowserImageExportService } from "./services/BrowserImageExportService";
import { BrowserLocalDataService } from "./services/BrowserLocalDataService";
import { BrowserProjectFileService } from "./services/BrowserProjectFileService";

export function createBrowserDataServices(): DataServices {
  return {
    local: new BrowserLocalDataService(),
    imageExporter: new BrowserImageExportService(),
    projectFiles: new BrowserProjectFileService(),
  };
}
