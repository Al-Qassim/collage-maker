import { Play, Save, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";
import type { LayoutNode, SavedLayout } from "../../../models";
import styles from "./SavedLayoutsSection.module.css";
import { useLocale } from "../LocaleProvider/LocaleProvider";

interface SavedLayoutActions {
  save(): void;
  apply(layout: LayoutNode): void;
  delete(layoutId: string): void;
}

export function SavedLayoutsSection({
  layouts,
  actions,
}: {
  layouts: SavedLayout[];
  actions: SavedLayoutActions;
}) {
  const { t } = useLocale();
  return (
    <section className={styles.section}>
      <div className={styles.heading}>{t("savedLayouts")}</div>
      <p className={styles.copy}>{t("savedLayoutsCopy")}</p>
      <button className={styles.save} onClick={actions.save}>
        <Save size={15} />
        {t("saveLayout")}
      </button>
      {layouts.length ? (
        <LayoutList layouts={layouts} actions={actions} />
      ) : (
        <p className={styles.empty}>{t("noLayouts")}</p>
      )}
    </section>
  );
}

function LayoutList({
  layouts,
  actions,
}: {
  layouts: SavedLayout[];
  actions: SavedLayoutActions;
}) {
  return (
    <div className={styles.list}>
      {layouts.map((layout, index) => (
        <div className={styles.item} key={layout.id}>
          <button
            className={styles.preview}
            onClick={() => actions.apply(layout.layout)}
            aria-label={`Use saved layout ${index + 1}`}
            title="Use this layout"
          >
            <LayoutThumbnail layout={layout.layout} />
            <Play className={styles.playIcon} size={16} />
          </button>
          {!layout.builtIn && (
            <button
              className={styles.delete}
              onClick={() => confirmDelete(layout.id, actions)}
              aria-label={`Delete saved layout ${index + 1}`}
              title="Delete this layout"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function LayoutThumbnail({ layout }: { layout: LayoutNode }) {
  return (
    <div className={styles.thumbnail} aria-hidden="true">
      <ThumbnailNode node={layout} />
    </div>
  );
}

function ThumbnailNode({ node }: { node: LayoutNode }) {
  if (node.type === "frame") return <span className={styles.frame} />;
  const tracks = `${node.ratio}fr ${1 - node.ratio}fr`;
  const style =
    node.direction === "vertical"
      ? { gridTemplateColumns: tracks }
      : { gridTemplateRows: tracks };
  return (
    <span className={styles.split} style={style as CSSProperties}>
      <ThumbnailNode node={node.first} />
      <ThumbnailNode node={node.second} />
    </span>
  );
}

function confirmDelete(layoutId: string, actions: SavedLayoutActions) {
  if (window.confirm("Delete this saved layout?")) actions.delete(layoutId);
}
