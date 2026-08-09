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
        <h1 className={styles.visuallyHidden}>Photo Collage Editor</h1>
        <Inspector
          view={{
            canvas: view.collage.canvas,
            savedLayouts: view.savedLayouts,
            exportFormat: view.exportFormat,
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
            toggleTheme: actions.toggleTheme,
            toggleLanguage: actions.toggleLanguage,
            setExportFormat: actions.setExportFormat,
          }}
        />
        <section className={styles.workspace}>
          <EditorHeader
            view={{
              canUndo: view.canUndo,
              canRedo: view.canRedo,
              exporting: view.exporting,
              exportFormat: view.exportFormat,
            }}
            actions={{
              undo: actions.collage.undo,
              redo: actions.collage.redo,
              exportImage: actions.exportImage,
            }}
          />
          <ExportStatus view={view} />
          <CollageCanvas
            view={{
              layout: view.collage.layout,
              settings: view.collage.canvas,
            }}
            actions={canvasActions}
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
