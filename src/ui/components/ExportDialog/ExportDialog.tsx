import { Download } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { ExportFormat, ExportScope } from "../../../models";
import { useLocale } from "../LocaleProvider/LocaleProvider";
import styles from "./ExportDialog.module.css";

export function ExportDialog({
  format,
  pageCount,
  exporting,
  setFormat,
  exportImages,
}: {
  format: ExportFormat;
  pageCount: number;
  exporting: boolean;
  setFormat(format: ExportFormat): void;
  exportImages(scope: ExportScope, transparentBackground: boolean): void;
}) {
  const { t } = useLocale();
  const [scope, setScope] = useState<ExportScope>("current");
  const [transparentBackground, setTransparentBackground] = useState(false);
  return (
    <div className={styles.dialog} role="dialog" aria-label={t("export")}>
      <OptionGroup label={t("exportFormat")}>
        <Option
          name="export-format-dialog"
          value="jpg"
          label={t("jpg")}
          checked={format === "jpg"}
          onChange={() => setFormat("jpg")}
        />
        <Option
          name="export-format-dialog"
          value="png"
          label={t("png")}
          checked={format === "png"}
          onChange={() => setFormat("png")}
        />
      </OptionGroup>
      <OptionGroup label={t("exportPages")}>
        <Option
          name="export-scope"
          value="current"
          label={t("thisPage")}
          checked={scope === "current"}
          onChange={() => setScope("current")}
        />
        <Option
          name="export-scope"
          value="all"
          label={`${t("allPages")} (${pageCount})`}
          checked={scope === "all"}
          onChange={() => setScope("all")}
        />
      </OptionGroup>
      <label
        className={`${styles.checkbox} ${format !== "png" ? styles.disabled : ""}`}
      >
        <input
          type="checkbox"
          checked={transparentBackground}
          disabled={format !== "png"}
          onChange={(event) => setTransparentBackground(event.target.checked)}
        />
        <span>
          <strong>{t("transparentBackground")}</strong>
          <small>{t("pngOnly")}</small>
        </span>
      </label>
      <button
        className={styles.download}
        onClick={() => exportImages(scope, transparentBackground)}
        disabled={exporting}
      >
        <Download size={15} />
        {exporting ? t("exporting") : t("download")}
      </button>
    </div>
  );
}

function OptionGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.group}>
      <span className={styles.heading}>{label}</span>
      <div className={styles.options}>{children}</div>
    </div>
  );
}

function Option({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange(): void;
}) {
  return (
    <label className={styles.option}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span>{label}</span>
    </label>
  );
}
