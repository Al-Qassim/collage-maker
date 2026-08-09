import { useState } from "react";
import type { LocalDataService } from "../../../data-service";
import type { LayoutNode, SavedLayout } from "../../../models";
import { createBuiltInLayouts } from "../layouts/builtInLayouts";
import { createReusableLayout } from "../layouts/layoutTree";

const MAX_CUSTOM_LAYOUTS = 24;

export function useSavedLayouts(database: LocalDataService) {
  const [customLayouts, setCustomLayouts] = useState<SavedLayout[]>(() =>
    database.loadSavedLayouts().filter((layout) => !layout.builtIn),
  );
  const builtInLayouts = createBuiltInLayouts();

  const saveLayout = (layout: LayoutNode) => {
    setCustomLayouts((current) => {
      const next = [
        ...current,
        {
          id: crypto.randomUUID(),
          layout: createReusableLayout(layout),
        },
      ].slice(-MAX_CUSTOM_LAYOUTS);
      database.saveSavedLayouts(next);
      return next;
    });
  };

  const deleteLayout = (layoutId: string) => {
    setCustomLayouts((current) => {
      const next = current.filter((layout) => layout.id !== layoutId);
      database.saveSavedLayouts(next);
      return next;
    });
  };

  return {
    layouts: [...builtInLayouts, ...customLayouts],
    saveLayout,
    deleteLayout,
  };
}
