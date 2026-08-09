import type { DataServices } from "./DataServices";
import { BrowserImageExportService } from "./services/BrowserImageExportService";
import { BrowserLocalDataService } from "./services/BrowserLocalDataService";

export function createBrowserDataServices(): DataServices {
  return {
    local: new BrowserLocalDataService(),
    imageExporter: new BrowserImageExportService(),
  };
}
