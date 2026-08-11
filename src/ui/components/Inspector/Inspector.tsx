import { FilePlus2 } from "lucide-react";
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
  return (
    <aside className={styles.properties} aria-label="Collage settings">
      <header className={styles.header}>
        <div>
          <p>COLLAGE MAKER</p>
          <h2>{t("settings")}</h2>
        </div>
        <button onClick={actions.newCollage} title="New collage">
          <FilePlus2 size={17} />
          {t("new")}
        </button>
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
      <div className={styles.shortcuts}>
        <span>{t("undo")}</span>
        <kbd>⌘ Z</kbd>
        <span>{t("redo")}</span>
        <kbd>⇧ ⌘ Z</kbd>
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
