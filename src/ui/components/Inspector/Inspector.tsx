import { Eraser, FilePlus2, FolderOpen, Save } from "lucide-react";
import { useRef } from "react";
import { CanvasSettingsSection } from "../CanvasSettingsSection/CanvasSettingsSection";
import styles from "./Inspector.module.css";
import { useLocale } from "../LocaleProvider/LocaleProvider";
import { SavedLayoutsSection } from "../SavedLayoutsSection/SavedLayoutsSection";
import { SidebarPreferences } from "../SidebarPreferences/SidebarPreferences";
import type {
  InspectorActions,
  InspectorView,
} from "../../logic/CollageScreenView";

export function Inspector({
  view,
  actions,
}: {
  view: InspectorView;
  actions: InspectorActions;
}) {
  const { t } = useLocale();
  const projectInput = useRef<HTMLInputElement>(null);
  return (
    <aside className={styles.properties} aria-label="Collage settings">
      <header className={styles.header}>
        <p>COLLAGE MAKER</p>
        <div className={styles.headerActions}>
          <button
            onClick={() => projectInput.current?.click()}
            aria-label={t("openProject")}
            title={t("openProject")}
          >
            <FolderOpen size={16} />
          </button>
          <button
            onClick={actions.saveProject}
            aria-label={t("saveProject")}
            title={t("saveProject")}
          >
            <Save size={16} />
          </button>
          <button
            onClick={actions.clearPage}
            disabled={!view.canClear}
            aria-label={t("clear")}
            title={t("clear")}
          >
            <Eraser size={15} />
          </button>
          <button
            onClick={actions.newCollage}
            aria-label={t("new")}
            title={t("new")}
          >
            <FilePlus2 size={16} />
          </button>
        </div>
        <input
          ref={projectInput}
          className={styles.hidden}
          type="file"
          accept=".json,.frame-collage.json,application/json"
          aria-label={t("openProject")}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) actions.openProject(file);
            event.target.value = "";
          }}
          tabIndex={-1}
        />
      </header>
      <div className={styles.sections}>
        <CanvasSettingsSection
          canvas={view.canvas}
          actions={{
            changeSetting: actions.changeCanvas,
            previewSetting: actions.previewCanvas,
            commitSetting: actions.commitCanvas,
            beginAdjustment: actions.beginAdjustment,
            setSize: actions.setCanvasSize,
          }}
        />
        <SavedLayoutsSection
          layouts={view.savedLayouts}
          actions={{
            save: actions.saveLayout,
            apply: actions.applyLayout,
            delete: actions.deleteLayout,
          }}
        />
      </div>
      <SidebarPreferences
        theme={view.preferences.theme}
        language={view.preferences.language}
        toggleTheme={actions.toggleTheme}
        toggleLanguage={actions.toggleLanguage}
      />
    </aside>
  );
}
