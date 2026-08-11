import type { LocalDataService } from "../../../data-service";
import {
  DEFAULT_CANVAS_SETTINGS,
  type CanvasSettings,
  type CollageState,
} from "../../../models";
import { createBuiltInFeatureLayout } from "../layouts/builtInLayouts";
import type {
  CollageHistoryState,
  CollageInitialState,
} from "../CollageScreenState";

export function createInitialCollageState(
  database: LocalDataService,
  overrides?: CollageInitialState,
): CollageState {
  const layout = overrides?.layout ?? createBuiltInFeatureLayout();
  const activePageId = overrides?.activePageId ?? "page-initial";
  return {
    canvas: normalizeCanvasSettings(database.loadCanvasSettings()),
    layout,
    pages: overrides?.pages ?? [{ id: activePageId, layout }],
    activePageId,
    ...overrides,
  };
}

export function createInitialHistoryState({
  database,
  initialState,
}: {
  database: LocalDataService;
  initialState?: CollageInitialState;
}): CollageHistoryState {
  const present = createInitialCollageState(database, initialState);
  return {
    pastByPage: { [present.activePageId]: [] },
    present,
    futureByPage: { [present.activePageId]: [] },
  };
}

function normalizeCanvasSettings(settings?: CanvasSettings): CanvasSettings {
  if (!settings) return DEFAULT_CANVAS_SETTINGS;
  return {
    width: clamp(settings.width, 100, 8000, DEFAULT_CANVAS_SETTINGS.width),
    height: clamp(settings.height, 100, 8000, DEFAULT_CANVAS_SETTINGS.height),
    spacing: clamp(settings.spacing, 0, 80, DEFAULT_CANVAS_SETTINGS.spacing),
    radius: clamp(settings.radius, 0, 200, DEFAULT_CANVAS_SETTINGS.radius),
  };
}

function clamp(value: number, min: number, max: number, fallback: number) {
  return Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}
