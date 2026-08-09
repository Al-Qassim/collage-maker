import { Download, Redo2, Undo2 } from "lucide-react";
import type { ExportFormat } from "../../../models";
import styles from "./EditorHeader.module.css";
import { useLocale } from "../LocaleProvider/LocaleProvider";

interface HeaderView {
  canUndo: boolean;
  canRedo: boolean;
  exporting: boolean;
  exportFormat: ExportFormat;
}

interface HeaderActions {
  undo(): void;
  redo(): void;
  exportImage(): void;
}

export function EditorHeader({
  view,
  actions,
}: {
  view: HeaderView;
  actions: HeaderActions;
}) {
  const { t } = useLocale();
  return (
    <header className={styles.header}>
      <div className={styles.actions}>
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
        <button
          className={styles.export}
          onClick={actions.exportImage}
          disabled={view.exporting}
        >
          <Download size={17} />
          {view.exporting
            ? t("exporting")
            : `${t("export")} ${view.exportFormat.toUpperCase()}`}
        </button>
      </div>
    </header>
  );
}
