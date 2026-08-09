import { useState } from "react";
import type { LocalDataService } from "../../../data-service";
import { DEFAULT_EXPORT_FORMAT, type ExportFormat } from "../../../models";

export function useExportFormat(database: LocalDataService) {
  const [format, setFormatState] = useState<ExportFormat>(
    () => database.loadExportFormat() ?? DEFAULT_EXPORT_FORMAT,
  );

  const setFormat = (value: ExportFormat) => {
    database.saveExportFormat(value);
    setFormatState(value);
  };

  return { format, setFormat };
}
