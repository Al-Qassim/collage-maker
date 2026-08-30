import { CollageCanvas } from "../CollageCanvas/CollageCanvas";
import styles from "./CollageMakerScreen.module.css";
import { EditorHeader } from "../EditorHeader/EditorHeader";
import { Inspector } from "../Inspector/Inspector";
import { LocaleProvider } from "../LocaleProvider/LocaleProvider";
import type {
  CanvasActions,
  EditorActions,
  EditorView,
} from "../../logic/CollageScreenView";

export function CollageMakerScreen({
  view,
  actions,
}: {
  view: EditorView;
  actions: EditorActions;
}) {
  const canvasActions: CanvasActions = {
    addImages: actions.collage.addImages,
    removeImage: actions.collage.removeImage,
    removeArea: actions.collage.removeArea,
    beginAdjustment: actions.collage.beginAdjustment,
    resizeSplit: actions.collage.resizeSplit,
    setFrameSize: actions.collage.setFrameSize,
    changeImageTransform: actions.collage.changeImageTransform,
    splitFrame: actions.collage.splitFrame,
    moveImage: actions.collage.moveImage,
  };

  return (
    <LocaleProvider language={view.preferences.language}>
      <main className={styles.appShell}>
        <a className={styles.skipLink} href="#editor-canvas">
          Skip to Canvas
        </a>
        <Inspector
          view={{
            canvas: view.collage.canvas,
            canClear: view.canClear,
            alwaysShowMeasurements: view.alwaysShowMeasurements,
            savedLayouts: view.savedLayouts,
            preferences: view.preferences,
          }}
          actions={{
            changeCanvas: actions.collage.changeCanvas,
            previewCanvas: actions.collage.previewCanvas,
            commitCanvas: actions.collage.commitCanvas,
            beginAdjustment: actions.collage.beginAdjustment,
            setCanvasSize: actions.collage.setCanvasSize,
            saveLayout: actions.saveLayout,
            applyLayout: actions.collage.applyLayout,
            deleteLayout: actions.deleteLayout,
            newCollage: actions.newCollage,
            clearPage: actions.clearPage,
            saveProject: actions.saveProject,
            openProject: actions.openProject,
            setAlwaysShowMeasurements: actions.setAlwaysShowMeasurements,
            toggleTheme: actions.toggleTheme,
            toggleLanguage: actions.toggleLanguage,
          }}
        />
        <section className={styles.workspace}>
          <EditorHeader
            view={{
              canUndo: view.canUndo,
              canRedo: view.canRedo,
              canShuffle: view.canShuffle,
              exporting: view.exporting,
              exportFormat: view.exportFormat,
              pageCount: view.collage.pages.length,
            }}
            actions={{
              undo: actions.collage.undo,
              redo: actions.collage.redo,
              shuffle: actions.collage.shuffleLayout,
              setExportFormat: actions.setExportFormat,
              exportImages: actions.exportImages,
            }}
          />
          <ExportStatus view={view} />
          <CollageCanvas
            view={{
              layout: view.collage.layout,
              settings: view.collage.canvas,
              pages: view.collage.pages,
              activePageId: view.collage.activePageId,
              alwaysShowMeasurements: view.alwaysShowMeasurements,
            }}
            actions={canvasActions}
            pageActions={{
              add: actions.collage.addPage,
              select: actions.collage.selectPage,
              remove: actions.collage.removePage,
            }}
            zoom={view.zoom}
            zoomActions={actions.zoom}
          />
        </section>
      </main>
    </LocaleProvider>
  );
}

function ExportStatus({ view }: { view: EditorView }) {
  return (
    <>
      <span className={styles.visuallyHidden} aria-live="polite">
        {view.exporting ? "Exporting collage…" : ""}
      </span>
      {view.exportError && (
        <div className={styles.error} role="alert">
          {view.exportError}
        </div>
      )}
    </>
  );
}
