import { Plus, X } from "lucide-react";
import type { CSSProperties } from "react";
import type { CollagePage, LayoutNode } from "../../../models";
import { useLocale } from "../LocaleProvider/LocaleProvider";
import styles from "./PageBar.module.css";

export interface PageBarActions {
  add(): void;
  select(pageId: string): void;
  remove(pageId: string): void;
}

export function PageBar({
  pages,
  activePageId,
  actions,
}: {
  pages: CollagePage[];
  activePageId: string;
  actions: PageBarActions;
}) {
  const { t } = useLocale();
  return (
    <nav className={styles.bar} aria-label={t("pages")}>
      {pages.map((page, index) => (
        <div className={styles.pageItem} key={page.id}>
          <button
            className={`${styles.page} ${page.id === activePageId ? styles.active : ""}`}
            onClick={() => actions.select(page.id)}
            aria-label={`${t("page")} ${index + 1}`}
            aria-current={page.id === activePageId ? "page" : undefined}
            title={`${t("page")} ${index + 1}`}
          >
            <PageThumbnail layout={page.layout} />
            <span className={styles.number}>{index + 1}</span>
          </button>
          {pages.length > 1 && (
            <button
              className={styles.remove}
              onClick={() => actions.remove(page.id)}
              aria-label={`${t("removePage")} ${index + 1}`}
              title={t("removePage")}
            >
              <X size={11} />
            </button>
          )}
        </div>
      ))}
      <button
        className={styles.add}
        onClick={actions.add}
        aria-label={t("addPage")}
        title={t("addPage")}
      >
        <Plus size={17} />
      </button>
    </nav>
  );
}

function PageThumbnail({ layout }: { layout: LayoutNode }) {
  return (
    <span className={styles.thumbnail} aria-hidden="true">
      <ThumbnailNode node={layout} />
    </span>
  );
}

function ThumbnailNode({ node }: { node: LayoutNode }) {
  if (node.type === "frame") {
    const style = node.image
      ? { backgroundImage: `url("${node.image}")` }
      : undefined;
    return <span className={styles.frame} style={style} />;
  }
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
