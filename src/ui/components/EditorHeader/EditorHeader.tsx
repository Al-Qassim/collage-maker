import { Download, Redo2, Shuffle, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ExportFormat, ExportScope } from "../../../models";
import { ExportDialog } from "../ExportDialog/ExportDialog";
import styles from "./EditorHeader.module.css";
import { useLocale } from "../LocaleProvider/LocaleProvider";

interface HeaderView {
  canUndo: boolean;
  canRedo: boolean;
  canShuffle: boolean;
  exporting: boolean;
  exportFormat: ExportFormat;
  pageCount: number;
}

interface HeaderActions {
  undo(): void;
  redo(): void;
  shuffle(): void;
  setExportFormat(format: ExportFormat): void;
  exportImages(scope: ExportScope): void;
}

export function EditorHeader({
  view,
  actions,
}: {
  view: HeaderView;
  actions: HeaderActions;
}) {
  const { t } = useLocale();
  const [showExport, setShowExport] = useState(false);
  const exportWrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showExport) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!exportWrap.current?.contains(event.target as Node)) {
        setShowExport(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowExport(false);
    };
    window.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [showExport]);

  const exportImages = (scope: ExportScope) => {
    actions.exportImages(scope);
    setShowExport(false);
  };
  return (
    <header className={styles.header}>
      <div className={styles.actions}>
        <div className={styles.utilityActions}>
          <button
            onClick={actions.shuffle}
            disabled={!view.canShuffle}
            aria-label={t("shuffle")}
            title={t("shuffle")}
          >
            <Shuffle size={17} />
          </button>
        </div>
        <div className={styles.history} aria-label="Edit history">
          <button
            onClick={actions.undo}
            disabled={!view.canUndo}
            aria-label={t("undo")}
            title={`${t("undo")} (⌘Z)`}
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={actions.redo}
            disabled={!view.canRedo}
            aria-label={t("redo")}
            title={`${t("redo")} (⇧⌘Z)`}
          >
            <Redo2 size={18} />
          </button>
        </div>
        <div ref={exportWrap} className={styles.exportWrap}>
          <button
            className={styles.export}
            onClick={() => setShowExport((visible) => !visible)}
            disabled={view.exporting}
            aria-expanded={showExport}
            aria-haspopup="dialog"
          >
            <Download size={17} />
            {view.exporting
              ? t("exporting")
              : `${t("export")} ${view.exportFormat.toUpperCase()}`}
          </button>
          {showExport && (
            <ExportDialog
              format={view.exportFormat}
              pageCount={view.pageCount}
              exporting={view.exporting}
              setFormat={actions.setExportFormat}
              exportImages={exportImages}
            />
          )}
        </div>
      </div>
    </header>
  );
}
