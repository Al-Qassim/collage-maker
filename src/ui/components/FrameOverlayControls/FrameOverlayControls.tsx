import { Columns2, Hand, Rows2, Trash2 } from "lucide-react";
import type { DragEvent } from "react";
import type { FrameEdge } from "../../../models";
import styles from "./FrameOverlayControls.module.css";

export interface OverlayActions {
  split(edge: FrameEdge): void;
  remove(): void;
  startMove(event: DragEvent<HTMLButtonElement>): void;
}

export function FrameOverlayControls({
  showMove,
  showTrash,
  hovered,
  activeEdge,
  actions,
}: {
  showMove: boolean;
  showTrash: boolean;
  hovered: boolean;
  activeEdge?: FrameEdge;
  actions: OverlayActions;
}) {
  const visibility = hovered ? styles.visible : "";
  return (
    <>
      {showMove && (
        <button
          className={`${styles.action} ${styles.move} ${visibility}`}
          draggable
          onDragStart={actions.startMove}
          onClick={(event) => event.preventDefault()}
          aria-label="Drag area to another position"
          title="Drag area to another position"
        >
          <Hand size={14} />
        </button>
      )}
      {showTrash && (
        <button
          className={`${styles.action} ${styles.remove} ${visibility}`}
          onClick={actions.remove}
          aria-label="Remove photo"
          title="Remove photo"
        >
          <Trash2 size={14} />
        </button>
      )}
      {activeEdge && (
        <button
          className={`${styles.action} ${styles.edge} ${styles[activeEdge]} ${styles.visible}`}
          onClick={() => actions.split(activeEdge)}
          aria-label={`Split at ${activeEdge} edge`}
          title={`Split at ${activeEdge} edge`}
        >
          {activeEdge === "left" || activeEdge === "right" ? (
            <Columns2 size={15} />
          ) : (
            <Rows2 size={15} />
          )}
        </button>
      )}
    </>
  );
}
