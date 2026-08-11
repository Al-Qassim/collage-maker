import { Minus, Plus } from "lucide-react";
import { useRef, type CSSProperties } from "react";
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
        {view.settings.width} × {view.settings.height} px
      </div>
      <div ref={viewport} className={styles.canvasScrollContent}>
        <div className={styles.collageCanvas} style={canvasStyle}>
          <LayoutTree
            node={view.layout}
            actions={actions}
            canRemoveAreas={view.layout.type === "split"}
            canvasScale={canvasScale}
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
    "--gap": `${Math.min(settings.spacing * scale, 48)}px`,
    "--radius": `${Math.min(settings.radius * scale, 160)}px`,
    width: `${settings.width * scale}px`,
    aspectRatio: `${settings.width} / ${settings.height}`,
  } as CSSProperties;
}
