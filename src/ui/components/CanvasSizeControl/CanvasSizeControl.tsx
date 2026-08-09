import { useEffect, useState, type KeyboardEvent } from "react";
import {
  CANVAS_SIZE_PRESETS,
  fromPixels,
  toPixels,
  type PresetGroup,
  type SizeUnit,
} from "../../logic/canvas-size/canvasSizePresets";
import type { CanvasSettings } from "../../../models";
import styles from "./CanvasSizeControl.module.css";
import { useLocale } from "../LocaleProvider/LocaleProvider";

export function CanvasSizeControl({
  canvas,
  setSize,
}: {
  canvas: CanvasSettings;
  setSize(width: number, height: number): void;
}) {
  const { t } = useLocale();
  const [customMode, setCustomMode] = useState(false);
  const [unit, setUnit] = useState<SizeUnit>("px");
  const preset = CANVAS_SIZE_PRESETS.find(
    (item) => item.width === canvas.width && item.height === canvas.height,
  );
  const selected = customMode ? "custom" : (preset?.id ?? "custom");

  const selectSize = (id: string) => {
    setCustomMode(id === "custom");
    const next = CANVAS_SIZE_PRESETS.find((item) => item.id === id);
    if (next) setSize(next.width, next.height);
  };

  return (
    <>
      <label className={styles.selectField}>
        <span>{t("size")}</span>
        <select
          name="canvas-size-preset"
          value={selected}
          onChange={(event) => selectSize(event.target.value)}
        >
          <PresetGroupOptions name="Screen" />
          <PresetGroupOptions name="Print" />
          <option value="custom">{t("customSize")}</option>
        </select>
      </label>
      {selected === "custom" && (
        <CustomSizeFields
          canvas={canvas}
          unit={unit}
          setUnit={setUnit}
          setSize={setSize}
        />
      )}
    </>
  );
}

function PresetGroupOptions({ name }: { name: PresetGroup }) {
  const { language, t } = useLocale();
  const presets = CANVAS_SIZE_PRESETS.filter((preset) => preset.group === name);
  return (
    <optgroup label={name === "Screen" ? t("screen") : t("print")}>
      {presets.map((preset) => (
        <option value={preset.id} key={preset.id}>
          {language === "ar" ? arabicPresetLabel(preset.id) : preset.label}
        </option>
      ))}
    </optgroup>
  );
}

function arabicPresetLabel(id: string): string {
  const labels: Record<string, string> = {
    portrait: "عمودي · 1080 × 1350 بكسل",
    story: "قصة · 1080 × 1920 بكسل",
    landscape: "أفقي HD · 1920 × 1080 بكسل",
    square: "مربع · 1080 × 1080 بكسل",
    "a4-p": "A4 عمودي · 210 × 297 مم",
    "a4-l": "A4 أفقي · 297 × 210 مم",
    "a3-p": "A3 عمودي · 297 × 420 مم",
    "a3-l": "A3 أفقي · 420 × 297 مم",
  };
  return labels[id] ?? id;
}

function CustomSizeFields({
  canvas,
  unit,
  setUnit,
  setSize,
}: {
  canvas: CanvasSettings;
  unit: SizeUnit;
  setUnit(unit: SizeUnit): void;
  setSize(width: number, height: number): void;
}) {
  const { t } = useLocale();
  return (
    <div className={styles.custom}>
      <div className={styles.dimensions}>
        <DimensionInput
          label={t("width")}
          value={fromPixels(canvas.width, unit)}
          onChange={(value) => setSize(toPixels(value, unit), canvas.height)}
        />
        <span aria-hidden="true">×</span>
        <DimensionInput
          label={t("height")}
          value={fromPixels(canvas.height, unit)}
          onChange={(value) => setSize(canvas.width, toPixels(value, unit))}
        />
      </div>
      <label className={styles.unitField}>
        <span>{t("unit")}</span>
        <select
          name="canvas-size-unit"
          value={unit}
          onChange={(event) => setUnit(event.target.value as SizeUnit)}
        >
          <option value="px">{t("pixels")}</option>
          <option value="in">{t("inches")}</option>
          <option value="mm">{t("millimeters")}</option>
          <option value="cm">{t("centimeters")}</option>
        </select>
      </label>
    </div>
  );
}

function DimensionInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange(value: number): void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") event.currentTarget.blur();
  };
  return (
    <label>
      <span>{label}</span>
      <input
        type="number"
        name={`canvas-${label.toLowerCase()}`}
        min="0.1"
        step="0.01"
        value={draft}
        inputMode="decimal"
        autoComplete="off"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => onChange(Number(draft))}
        onKeyDown={handleKeyDown}
      />
    </label>
  );
}
