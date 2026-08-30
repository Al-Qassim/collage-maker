import type { CollageState, ExportFormat, ImageExportOptions } from "../models";

export interface ImageExportService {
  exportImage(
    state: CollageState,
    format: ExportFormat,
    options: ImageExportOptions,
    fileName?: string,
  ): Promise<void>;
}
