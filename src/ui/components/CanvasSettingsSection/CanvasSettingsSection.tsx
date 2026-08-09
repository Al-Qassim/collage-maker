import { useRef } from "react";
import type { CanvasSettings } from "../../../models";
import { CanvasSizeControl } from "../CanvasSizeControl/CanvasSizeControl";
import { useLocale } from "../LocaleProvider/LocaleProvider";
import styles from "./CanvasSettingsSection.module.css";

interface CanvasSettingsActions {
  changeSetting(field: keyof CanvasSettings, value: number): void;
  previewSetting(field: keyof CanvasSettings, value: number): void;
  commitSetting(field: keyof CanvasSettings, value: number): void;
  beginAdjustment(): void;
  setSize(width: number, height: number): void;
}

export function CanvasSettingsSection({
  canvas,
  actions,
}: {
  canvas: CanvasSettings;
  actions: CanvasSettingsActions;
}) {
  const { t } = useLocale();
  return (
    <section className={styles.section}>
      <div className={styles.heading}>{t("canvas")}</div>
      <CanvasSizeControl canvas={canvas} setSize={actions.setSize} />
      <RangeField
        field="spacing"
        label={t("spacing")}
        value={canvas.spacing}
        max={80}
        actions={actions}
      />
      <RangeField
        field="radius"
        label={t("cornerRadius")}
        value={canvas.radius}
        max={200}
        actions={actions}
      />
      <p className={styles.note}>{t("savedAutomatically")}</p>
    </section>
  );
}

function RangeField({
  field,
  label,
  value,
  max,
  actions,
}: {
  field: keyof CanvasSettings;
  label: string;
  value: number;
  max: number;
  actions: CanvasSettingsActions;
}) {
  const adjusting = useRef(false);

  const preview = (nextValue: number) => {
    if (!adjusting.current) {
      adjusting.current = true;
      actions.beginAdjustment();
    }
    actions.previewSetting(field, nextValue);
  };
  const commit = (finalValue: number) => {
    if (!adjusting.current) return;
    adjusting.current = false;
    actions.commitSetting(field, finalValue);
  };

  return (
    <label className={styles.range}>
      <span>{label}</span>
      <input
        type="range"
        name={`canvas-${field}`}
        min="0"
        max={max}
        value={value}
        onChange={(event) => preview(Number(event.target.value))}
        onPointerUp={(event) => commit(Number(event.currentTarget.value))}
        onPointerCancel={(event) => commit(Number(event.currentTarget.value))}
        onKeyUp={(event) => commit(Number(event.currentTarget.value))}
        onBlur={(event) => commit(Number(event.currentTarget.value))}
      />
      <output>{value}px</output>
    </label>
  );
}
