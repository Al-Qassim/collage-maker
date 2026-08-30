import { useState } from "react";
import type { LocalDataService } from "../../../data-service";

export function useMeasurementPreference(database: LocalDataService) {
  const [alwaysShowMeasurements, setAlwaysShowState] = useState(
    () => database.loadAlwaysShowMeasurements() ?? false,
  );

  const setAlwaysShowMeasurements = (alwaysShow: boolean) => {
    database.saveAlwaysShowMeasurements(alwaysShow);
    setAlwaysShowState(alwaysShow);
  };

  return { alwaysShowMeasurements, setAlwaysShowMeasurements };
}
