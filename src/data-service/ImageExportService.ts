import type { CollageState, ExportFormat } from "../models";

export interface ImageExportService {
  exportImage(
    state: CollageState,
    format: ExportFormat,
    fileName?: string,
  ): Promise<void>;
}
