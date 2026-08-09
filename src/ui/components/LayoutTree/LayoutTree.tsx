import { GripHorizontal, GripVertical } from "lucide-react";
import type { CSSProperties, PointerEvent } from "react";
import type { LayoutNode, SplitDirection } from "../../../models";
import { PhotoFrame } from "../PhotoFrame/PhotoFrame";
import styles from "./LayoutTree.module.css";
import type { CanvasActions } from "../../logic/CollageScreenView";

interface LayoutTreeProps {
  node: LayoutNode;
  actions: CanvasActions;
  canRemoveAreas: boolean;
  canvasScale: number;
  startResize(
    event: PointerEvent<HTMLButtonElement>,
    splitId: string,
    direction: SplitDirection,
  ): void;
}

export function LayoutTree(props: LayoutTreeProps) {
  if (props.node.type === "frame") {
    return (
      <PhotoFrame
        frame={props.node}
        canRemoveArea={props.canRemoveAreas}
        canvasScale={props.canvasScale}
        actions={props.actions}
      />
    );
  }

  const { node } = props;
  const style = createSplitStyle(node.direction, node.ratio);
  return (
    <div className={`${styles.split} ${styles[node.direction]}`} style={style}>
      <LayoutTree {...props} node={node.first} />
      <LayoutTree {...props} node={node.second} />
      <button
        className={styles.divider}
        onPointerDown={(event) =>
          props.startResize(event, node.id, node.direction)
        }
        aria-label={`Resize ${node.direction} divider`}
        title="Drag to resize"
      >
        {node.direction === "vertical" ? (
          <GripVertical size={14} />
        ) : (
          <GripHorizontal size={14} />
        )}
      </button>
    </div>
  );
}

function createSplitStyle(direction: SplitDirection, ratio: number) {
  const tracks = `${ratio}fr ${1 - ratio}fr`;
  const style =
    direction === "vertical"
      ? { gridTemplateColumns: tracks }
      : { gridTemplateRows: tracks };
  return {
    ...style,
    "--split-position": `${ratio * 100}%`,
  } as CSSProperties & { "--split-position": string };
}
