import { Images, Plus, Shuffle, Trash2 } from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import type { CollagePage, LayoutNode } from "../../../models";
import { useLocale } from "../LocaleProvider/LocaleProvider";
import styles from "./PagesSection.module.css";

interface PageActions {
  add(): void;
  select(pageId: string): void;
  remove(pageId: string): void;
  shuffle(): void;
  importImages(files: FileList | File[]): void;
}

export function PagesSection({
  pages,
  activePageId,
  actions,
}: {
  pages: CollagePage[];
  activePageId: string;
  actions: PageActions;
}) {
  const { t } = useLocale();
  const input = useRef<HTMLInputElement>(null);
  const activeLayout = pages.find((page) => page.id === activePageId)?.layout;
  const canShuffle = activeLayout ? countImages(activeLayout) > 1 : false;
  const importImages = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) actions.importImages(event.target.files);
    event.target.value = "";
  };

  return (
    <section className={styles.section}>
      <div className={styles.heading}>{t("pages")}</div>
      <div className={styles.tools}>
        <button className={styles.tool} onClick={() => input.current?.click()}>
          <Images size={14} />
          {t("importImages")}
        </button>
        <button
          className={styles.tool}
          onClick={actions.shuffle}
          disabled={!canShuffle}
        >
          <Shuffle size={14} />
          {t("shuffle")}
        </button>
      </div>
      <div className={styles.pages}>
        {pages.map((page, index) => (
          <div className={styles.pageRow} key={page.id}>
            <button
              className={`${styles.page} ${page.id === activePageId ? styles.active : ""}`}
              onClick={() => actions.select(page.id)}
              aria-current={page.id === activePageId ? "page" : undefined}
            >
              {t("page")} {index + 1}
            </button>
            {pages.length > 1 && (
              <button
                className={styles.remove}
                onClick={() => actions.remove(page.id)}
                aria-label={`${t("removePage")} ${index + 1}`}
                title={t("removePage")}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>
      <button className={styles.addPage} onClick={actions.add}>
        <Plus size={14} />
        {t("addPage")}
      </button>
      <input
        ref={input}
        className={styles.hidden}
        type="file"
        accept="image/*"
        multiple
        onChange={importImages}
        tabIndex={-1}
      />
    </section>
  );
}

function countImages(node: LayoutNode): number {
  if (node.type === "frame") return node.image ? 1 : 0;
  return countImages(node.first) + countImages(node.second);
}
