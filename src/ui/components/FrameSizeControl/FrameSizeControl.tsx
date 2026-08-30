import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  centimetersToPixels,
  formatCentimeters,
} from "../../logic/canvas-size/centimeters";
import { useLocale } from "../LocaleProvider/LocaleProvider";
import styles from "./FrameSizeControl.module.css";

export function FrameSizeControl({
  width,
  height,
  canResizeWidth,
  canResizeHeight,
  visible,
  setSize,
}: {
  width: number;
  height: number;
  canResizeWidth: boolean;
  canResizeHeight: boolean;
  visible: boolean;
  setSize(width?: number, height?: number): void;
}) {
  const { t } = useLocale();
  const control = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [widthDraft, setWidthDraft] = useState(formatCentimeters(width));
  const [heightDraft, setHeightDraft] = useState(formatCentimeters(height));

  useEffect(() => setWidthDraft(formatCentimeters(width)), [width]);
  useEffect(() => setHeightDraft(formatCentimeters(height)), [height]);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!control.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);

  const apply = (event: FormEvent) => {
    event.preventDefault();
    const nextWidth = Number(widthDraft);
    const nextHeight = Number(heightDraft);
    setSize(
      canResizeWidth && nextWidth > 0
        ? centimetersToPixels(nextWidth)
        : undefined,
      canResizeHeight && nextHeight > 0
        ? centimetersToPixels(nextHeight)
        : undefined,
    );
    setOpen(false);
  };

  return (
    <div
      ref={control}
      className={`${styles.control} ${visible || open ? styles.visible : ""}`}
    >
      <button
        className={styles.badge}
        onClick={() => setOpen((visible) => !visible)}
        aria-expanded={open}
        title={t("editFrameSize")}
      >
        {formatCentimeters(width)} × {formatCentimeters(height)} cm
      </button>
      {open && (
        <form className={styles.panel} onSubmit={apply}>
          <strong className={styles.heading}>{t("frameSize")}</strong>
          <div className={styles.fields}>
            <DimensionField
              label={t("width")}
              value={widthDraft}
              disabled={!canResizeWidth}
              setValue={setWidthDraft}
            />
            <DimensionField
              label={t("height")}
              value={heightDraft}
              disabled={!canResizeHeight}
              setValue={setHeightDraft}
            />
          </div>
          {(!canResizeWidth || !canResizeHeight) && (
            <p className={styles.note}>{t("fixedFrameDimension")}</p>
          )}
          <button
            className={styles.apply}
            type="submit"
            disabled={!canResizeWidth && !canResizeHeight}
          >
            {t("applySize")}
          </button>
        </form>
      )}
    </div>
  );
}

function DimensionField({
  label,
  value,
  disabled,
  setValue,
}: {
  label: string;
  value: string;
  disabled: boolean;
  setValue(value: string): void;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <span className={styles.inputWrap}>
        <input
          type="number"
          min="0.1"
          step="0.01"
          value={value}
          disabled={disabled}
          inputMode="decimal"
          onChange={(event) => setValue(event.target.value)}
        />
        <small>cm</small>
      </span>
    </label>
  );
}
