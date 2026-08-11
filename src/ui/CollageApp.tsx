import { useEffect, useState } from "react";
import type { DataServices } from "../data-service";
import type { ExportScope } from "../models";
import { CollageMakerScreen } from "./components/CollageMakerScreen/CollageMakerScreen";
import {
  useCollageCommands,
  useCollageHistory,
  useCollageState,
} from "./logic/CollageScreenProvider";
import { useCanvasZoom } from "./logic/interactions/useCanvasZoom";
import { useEditorPreferences } from "./logic/interactions/useEditorPreferences";
import { useExportFormat } from "./logic/interactions/useExportFormat";
import { useEditorShortcuts } from "./logic/interactions/useEditorShortcuts";
import { useSavedLayouts } from "./logic/interactions/useSavedLayouts";
import { imageFrames } from "./logic/layouts/generateLayout";
import { hasCollageContent } from "./logic/layouts/layoutTree";

export function CollageApp({ services }: { services: DataServices }) {
  const state = useCollageState();
  const commands = useCollageCommands();
  const history = useCollageHistory();
  const canvasZoom = useCanvasZoom(services.local);
  const savedLayouts = useSavedLayouts(services.local);
  const preferences = useEditorPreferences(services.local);
  const exportFormat = useExportFormat(services.local);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string>();

  useEditorShortcuts(commands);

  useEffect(() => {
    if (!hasCollageContent(state.layout)) return;
    const warnAboutUnsavedCollage = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warnAboutUnsavedCollage);
    return () =>
      window.removeEventListener("beforeunload", warnAboutUnsavedCollage);
  }, [state.layout]);

  const exportImages = async (scope: ExportScope) => {
    setExporting(true);
    setExportError(undefined);
    try {
      await commands.exportImages(exportFormat.format, scope);
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : "The collage could not be exported.",
      );
    } finally {
      setExporting(false);
    }
  };

  const runProjectOperation = async (operation: () => Promise<void>) => {
    setExportError(undefined);
    try {
      await operation();
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : "The project operation could not be completed.",
      );
    }
  };

  const clearPage = () => {
    const message =
      preferences.language === "ar"
        ? "هل تريد مسح الصفحة الحالية بالكامل؟ يمكنك التراجع عن ذلك."
        : "Clear the current page, including its images and layout? You can undo this action.";
    if (window.confirm(message)) commands.clearPage();
  };

  const startNewCollage = () => {
    if (
      window.confirm(
        "Start a new collage? You can undo this after clearing the canvas.",
      )
    ) {
      commands.startNewCollage();
    }
  };

  return (
    <CollageMakerScreen
      view={{
        collage: state,
        canUndo: history.canUndo,
        canRedo: history.canRedo,
        canShuffle: imageFrames(state.layout).length > 1,
        canClear: hasCollageContent(state.layout),
        exporting,
        exportError,
        zoom: {
          value: canvasZoom.zoom,
          canZoomIn: canvasZoom.canZoomIn,
          canZoomOut: canvasZoom.canZoomOut,
        },
        savedLayouts: savedLayouts.layouts,
        exportFormat: exportFormat.format,
        preferences: {
          theme: preferences.theme,
          language: preferences.language,
        },
      }}
      actions={{
        collage: commands,
        zoom: {
          zoomIn: canvasZoom.zoomIn,
          zoomOut: canvasZoom.zoomOut,
          reset: canvasZoom.resetZoom,
        },
        newCollage: startNewCollage,
        clearPage,
        saveProject: () => runProjectOperation(commands.saveProject),
        openProject: (file) =>
          runProjectOperation(() => commands.openProject(file)),
        exportImages,
        setExportFormat: exportFormat.setFormat,
        saveLayout: () => savedLayouts.saveLayout(state.layout),
        deleteLayout: savedLayouts.deleteLayout,
        toggleTheme: preferences.toggleTheme,
        toggleLanguage: preferences.toggleLanguage,
      }}
    />
  );
}
