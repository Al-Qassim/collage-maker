import { useRef } from "react";
import type { CanvasSettings } from "../../../models";
import {
  centimetersToPixels,
  formatCentimeters,
  pixelsToCentimeters,
} from "../../logic/canvas-size/centimeters";
import { CanvasSizeControl } from "../CanvasSizeControl/CanvasSizeControl";
import { useLocale } from "../LocaleProvider/LocaleProvider";
import styles from "./CanvasSettingsSection.module.css";

interface CanvasSettingsActions {
  changeSetting(field: keyof CanvasSettings, value: number): void;
  previewSetting(field: keyof CanvasSettings, value: number): void;
  commitSetting(field: keyof CanvasSettings, value: number): void;
  beginAdjustment(): void;
  setAlwaysShowMeasurements(alwaysShow: boolean): void;
  setSize(width: number, height: number): void;
}

export function CanvasSettingsSection({
  canvas,
  alwaysShowMeasurements,
  actions,
}: {
  canvas: CanvasSettings;
  alwaysShowMeasurements: boolean;
  actions: CanvasSettingsActions;
}) {
  const { t } = useLocale();
  const shortestSide = Math.min(canvas.width, canvas.height);
  const maximumHorizontalMargin = Math.max(
    0.1,
    pixelsToCentimeters(canvas.width / 2),
  );
  const maximumVerticalMargin = Math.max(
    0.1,
    pixelsToCentimeters(canvas.height / 2),
  );
  const maximumSpacing = Math.max(0.1, pixelsToCentimeters(shortestSide / 3));
  const maximumRadius = Math.max(0.1, pixelsToCentimeters(shortestSide / 2));
  return (
    <section className={styles.section}>
      <div className={styles.heading}>{t("canvas")}</div>
      <CanvasSizeControl canvas={canvas} setSize={actions.setSize} />
      <CentimeterRangeField
        field="marginHorizontal"
        label={t("horizontalMargin")}
        value={canvas.marginHorizontal}
        maxCentimeters={maximumHorizontalMargin}
        actions={actions}
      />
      <CentimeterRangeField
        field="marginVertical"
        label={t("verticalMargin")}
        value={canvas.marginVertical}
        maxCentimeters={maximumVerticalMargin}
        actions={actions}
      />
      <CentimeterRangeField
        field="spacing"
        label={t("spacing")}
        value={canvas.spacing}
        maxCentimeters={maximumSpacing}
        actions={actions}
      />
      <CentimeterRangeField
        field="radius"
        label={t("cornerRadius")}
        value={canvas.radius}
        maxCentimeters={maximumRadius}
        actions={actions}
      />
      <label className={styles.measurementToggle}>
        <input
          type="checkbox"
          checked={alwaysShowMeasurements}
          onChange={(event) =>
            actions.setAlwaysShowMeasurements(event.target.checked)
          }
        />
        <span>{t("alwaysShowMeasurements")}</span>
      </label>
      <p className={styles.note}>{t("centimeterNote")}</p>
    </section>
  );
}

function CentimeterRangeField({
  field,
  label,
  value,
  maxCentimeters,
  actions,
}: {
  field: keyof CanvasSettings;
  label: string;
  value: number;
  maxCentimeters: number;
  actions: CanvasSettingsActions;
}) {
  const adjusting = useRef(false);
  const centimeterValue = pixelsToCentimeters(value);

  const preview = (nextCentimeters: number) => {
    if (!adjusting.current) {
      adjusting.current = true;
      actions.beginAdjustment();
    }
    actions.previewSetting(field, centimetersToPixels(nextCentimeters));
  };
  const commit = (finalCentimeters: number) => {
    if (!adjusting.current) return;
    adjusting.current = false;
    actions.commitSetting(field, centimetersToPixels(finalCentimeters));
  };

  return (
    <div className={styles.range}>
      <label htmlFor={`canvas-${field}`}>{label}</label>
      <input
        id={`canvas-${field}`}
        type="range"
        name={`canvas-${field}`}
        min="0"
        max={maxCentimeters}
        step="0.01"
        value={centimeterValue}
        onChange={(event) => preview(Number(event.target.value))}
        onPointerUp={(event) => commit(Number(event.currentTarget.value))}
        onPointerCancel={(event) => commit(Number(event.currentTarget.value))}
        onKeyUp={(event) => commit(Number(event.currentTarget.value))}
        onBlur={(event) => commit(Number(event.currentTarget.value))}
      />
      <output htmlFor={`canvas-${field}`}>{formatCentimeters(value)} cm</output>
    </div>
  );
}
