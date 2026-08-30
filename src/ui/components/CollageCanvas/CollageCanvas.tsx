import { Minus, Plus } from "lucide-react";
import { EMPTY_FRAME_INSETS } from "../../../models";
import { useRef, type CSSProperties } from "react";
import { formatCentimeters } from "../../logic/canvas-size/centimeters";
import { useCanvasFitScale } from "../../logic/interactions/useCanvasFitScale";
import { useSplitResizer } from "../../logic/interactions/useSplitResizer";
import { LayoutTree } from "../LayoutTree/LayoutTree";
import { PageBar } from "../PageBar/PageBar";
import { useLocale } from "../LocaleProvider/LocaleProvider";
import styles from "./CollageCanvas.module.css";
import type {
  CanvasActions,
  CanvasView,
  CanvasZoomActions,
  PageActions,
  CanvasZoomView,
} from "../../logic/CollageScreenView";

interface CollageCanvasProps {
  view: CanvasView;
  actions: CanvasActions;
  zoom: CanvasZoomView;
  zoomActions: CanvasZoomActions;
  pageActions: PageActions;
}

export function CollageCanvas({
  view,
  actions,
  zoom,
  zoomActions,
  pageActions,
}: CollageCanvasProps) {
  const { t } = useLocale();
  const viewport = useRef<HTMLDivElement>(null);
  const fitScale = useCanvasFitScale(
    viewport,
    view.settings.width,
    view.settings.height,
  );
  const startResize = useSplitResizer(
    actions.beginAdjustment,
    actions.resizeSplit,
  );
  const canvasScale = fitScale * zoom.value;
  const canvasStyle = createCanvasStyle(view, canvasScale);

  return (
    <div className={styles.canvasStage} id="editor-canvas" tabIndex={-1}>
      <PageBar
        pages={view.pages}
        activePageId={view.activePageId}
        actions={pageActions}
      />
      <div className={styles.stageLabel}>
        {view.settings.width} × {view.settings.height} px ·{" "}
        {formatCentimeters(view.settings.width)} ×{" "}
        {formatCentimeters(view.settings.height)} cm
      </div>
      <div ref={viewport} className={styles.canvasScrollContent}>
        <div className={styles.collageCanvas} style={canvasStyle}>
          <LayoutTree
            node={view.layout}
            actions={actions}
            canRemoveAreas={view.layout.type === "split"}
            canvasScale={canvasScale}
            width={Math.max(
              1,
              view.settings.width - view.settings.marginHorizontal * 2,
            )}
            height={Math.max(
              1,
              view.settings.height - view.settings.marginVertical * 2,
            )}
            gap={view.settings.spacing}
            canResizeWidth={false}
            canResizeHeight={false}
            alwaysShowMeasurements={view.alwaysShowMeasurements}
            insets={EMPTY_FRAME_INSETS}
            startResize={startResize}
          />
        </div>
      </div>
      <CanvasZoomControls view={zoom} actions={zoomActions} />
      <p className={styles.stageTip}>{t("canvasTip")}</p>
    </div>
  );
}

function CanvasZoomControls({
  view,
  actions,
}: {
  view: CanvasZoomView;
  actions: CanvasZoomActions;
}) {
  const { t } = useLocale();
  return (
    <div className={styles.canvasZoomControl} aria-label="Canvas zoom">
      <button
        onClick={actions.zoomOut}
        disabled={!view.canZoomOut}
        aria-label={t("zoomOut")}
        title={t("zoomOut")}
      >
        <Minus size={16} />
      </button>
      <button
        className={styles.zoomValue}
        onClick={actions.reset}
        title="Reset canvas zoom"
      >
        {Math.round(view.value * 100)}%
      </button>
      <button
        onClick={actions.zoomIn}
        disabled={!view.canZoomIn}
        aria-label={t("zoomIn")}
        title={t("zoomIn")}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

function createCanvasStyle(view: CanvasView, scale: number): CSSProperties {
  const { settings } = view;
  return {
    "--margin-horizontal": `${settings.marginHorizontal * scale}px`,
    "--margin-vertical": `${settings.marginVertical * scale}px`,
    "--radius": `${settings.radius * scale}px`,
    width: `${settings.width * scale}px`,
    aspectRatio: `${settings.width} / ${settings.height}`,
  } as CSSProperties;
}
