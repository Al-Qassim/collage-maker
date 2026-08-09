import { ImagePlus } from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import { useFrameHoverActions } from "../../logic/interactions/useFrameHoverActions";
import { usePhotoFramingGestures } from "../../logic/interactions/usePhotoFramingGestures";
import { DEFAULT_IMAGE_TRANSFORM, type FrameNode } from "../../../models";
import { FrameOverlayControls } from "../FrameOverlayControls/FrameOverlayControls";
import styles from "./PhotoFrame.module.css";
import { useLocale } from "../LocaleProvider/LocaleProvider";
import type { CanvasActions } from "../../logic/CollageScreenView";

export function PhotoFrame({
  frame,
  canRemoveArea,
  canvasScale,
  actions,
}: {
  frame: FrameNode;
  canRemoveArea: boolean;
  canvasScale: number;
  actions: CanvasActions;
}) {
  const { t } = useLocale();
  const input = useRef<HTMLInputElement>(null);
  const hoverActions = useFrameHoverActions(
    frame.id,
    Boolean(frame.image),
    canRemoveArea,
    actions,
  );
  const gestures = usePhotoFramingGestures({
    frame,
    beginAdjustment: actions.beginAdjustment,
    changeTransform: actions.changeImageTransform,
  });

  const choosePhotos = () => {
    if (gestures.didDrag.current) {
      gestures.didDrag.current = false;
      return;
    }
    input.current?.click();
  };
  const className = [styles.frame, frame.image ? styles.hasImage : styles.empty]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} {...hoverActions.frameHandlers}>
      <button
        className={styles.content}
        onClick={choosePhotos}
        onPointerDown={gestures.startDrag}
        onPointerMove={gestures.drag}
        onPointerUp={gestures.stopDrag}
        onPointerCancel={gestures.stopDrag}
        onWheel={gestures.zoom}
        aria-label={frame.image ? "Replace or reposition photo" : "Add photos"}
      >
        <FrameContent
          frame={frame}
          addLabel={t("addPhotos")}
          dropLabel={t("dropPhotos")}
          canvasScale={canvasScale}
        />
      </button>
      <FrameOverlayControls
        showMove={canRemoveArea}
        showTrash={Boolean(frame.image) || canRemoveArea}
        hovered={hoverActions.hovered}
        actions={hoverActions.overlayActions}
      />
      <input
        ref={input}
        className={styles.visuallyHidden}
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => pickPhotos(event, frame.id, actions)}
        tabIndex={-1}
        aria-label="Choose photos"
      />
    </div>
  );
}

function FrameContent({
  frame,
  addLabel,
  dropLabel,
  canvasScale,
}: {
  frame: FrameNode;
  addLabel: string;
  dropLabel: string;
  canvasScale: number;
}) {
  if (!frame.image) {
    return (
      <span className={styles.emptyContent}>
        <span className={styles.emptyIcon}>
          <ImagePlus size={22} />
        </span>
        <strong>{addLabel}</strong>
        <small>{dropLabel}</small>
      </span>
    );
  }

  const transform = frame.transform ?? DEFAULT_IMAGE_TRANSFORM;
  const hasFixedSize = Boolean(transform.baseWidth && transform.baseHeight);
  return (
    <img
      className={styles.photo}
      src={frame.image}
      alt={frame.alt ?? "Collage photo"}
      draggable="false"
      style={{
        width: hasFixedSize
          ? `${transform.baseWidth! * canvasScale}px`
          : "100%",
        height: hasFixedSize
          ? `${transform.baseHeight! * canvasScale}px`
          : "100%",
        left: `calc(50% + ${transform.offsetX}%)`,
        top: `calc(50% + ${transform.offsetY}%)`,
        transform: `translate(-50%, -50%) scale(${transform.zoom})`,
      }}
    />
  );
}

function pickPhotos(
  event: ChangeEvent<HTMLInputElement>,
  frameId: string,
  actions: CanvasActions,
) {
  if (event.target.files?.length) {
    actions.addImages(frameId, event.target.files);
  }
  event.target.value = "";
}
