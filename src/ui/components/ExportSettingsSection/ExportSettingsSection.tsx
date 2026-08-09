import type { ExportFormat } from "../../../models";
import { useLocale } from "../LocaleProvider/LocaleProvider";
import styles from "./ExportSettingsSection.module.css";

export function ExportSettingsSection({
  format,
  setFormat,
}: {
  format: ExportFormat;
  setFormat(format: ExportFormat): void;
}) {
  const { t } = useLocale();
  return (
    <section className={styles.section}>
      <div className={styles.heading}>{t("exportFormat")}</div>
      <div className={styles.options}>
        <FormatOption
          format="jpg"
          label={t("jpg")}
          selected={format === "jpg"}
          setFormat={setFormat}
        />
        <FormatOption
          format="png"
          label={t("png")}
          selected={format === "png"}
          setFormat={setFormat}
        />
      </div>
    </section>
  );
}

function FormatOption({
  format,
  label,
  selected,
  setFormat,
}: {
  format: ExportFormat;
  label: string;
  selected: boolean;
  setFormat(format: ExportFormat): void;
}) {
  return (
    <label className={styles.option}>
      <input
        type="radio"
        name="export-format"
        value={format}
        checked={selected}
        onChange={() => setFormat(format)}
      />
      <span>{label}</span>
    </label>
  );
}
