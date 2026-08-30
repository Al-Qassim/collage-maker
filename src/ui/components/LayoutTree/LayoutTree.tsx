import { GripHorizontal, GripVertical } from "lucide-react";
import type { CSSProperties, PointerEvent } from "react";
import {
  splitFrameInsets,
  type FrameInsets,
  type LayoutNode,
  type SplitDirection,
} from "../../../models";
import type { CanvasActions } from "../../logic/CollageScreenView";
import { PhotoFrame } from "../PhotoFrame/PhotoFrame";
import styles from "./LayoutTree.module.css";

interface LayoutTreeProps {
  node: LayoutNode;
  actions: CanvasActions;
  canRemoveAreas: boolean;
  canvasScale: number;
  width: number;
  height: number;
  gap: number;
  canResizeWidth: boolean;
  canResizeHeight: boolean;
  alwaysShowMeasurements: boolean;
  insets: FrameInsets;
  startResize(
    event: PointerEvent<HTMLButtonElement>,
    splitId: string,
    direction: SplitDirection,
  ): void;
}

export function LayoutTree(props: LayoutTreeProps) {
  if (props.node.type === "frame") return <FrameLeaf {...props} />;

  const { node } = props;
  const style = createSplitStyle(node.direction, node.ratio);
  const firstWidth =
    node.direction === "vertical" ? props.width * node.ratio : props.width;
  const firstHeight =
    node.direction === "horizontal" ? props.height * node.ratio : props.height;
  const secondWidth =
    node.direction === "vertical" ? props.width - firstWidth : props.width;
  const secondHeight =
    node.direction === "horizontal" ? props.height - firstHeight : props.height;
  const [firstInsets, secondInsets] = splitFrameInsets(
    props.insets,
    node.direction,
    props.gap,
  );
  const canResizeWidth = props.canResizeWidth || node.direction === "vertical";
  const canResizeHeight =
    props.canResizeHeight || node.direction === "horizontal";

  return (
    <div className={`${styles.split} ${styles[node.direction]}`} style={style}>
      <LayoutTree
        {...props}
        node={node.first}
        width={firstWidth}
        height={firstHeight}
        canResizeWidth={canResizeWidth}
        canResizeHeight={canResizeHeight}
        insets={firstInsets}
      />
      <LayoutTree
        {...props}
        node={node.second}
        width={secondWidth}
        height={secondHeight}
        canResizeWidth={canResizeWidth}
        canResizeHeight={canResizeHeight}
        insets={secondInsets}
      />
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

function FrameLeaf(props: LayoutTreeProps) {
  if (props.node.type !== "frame") return null;
  const { insets } = props;
  const width = Math.max(1, props.width - insets.left - insets.right);
  const height = Math.max(1, props.height - insets.top - insets.bottom);
  const style = {
    paddingTop: `${insets.top * props.canvasScale}px`,
    paddingRight: `${insets.right * props.canvasScale}px`,
    paddingBottom: `${insets.bottom * props.canvasScale}px`,
    paddingLeft: `${insets.left * props.canvasScale}px`,
  };
  return (
    <div className={styles.frameSlot} style={style}>
      <PhotoFrame
        frame={props.node}
        canRemoveArea={props.canRemoveAreas}
        canvasScale={props.canvasScale}
        width={width}
        height={height}
        canResizeWidth={props.canResizeWidth}
        canResizeHeight={props.canResizeHeight}
        alwaysShowMeasurements={props.alwaysShowMeasurements}
        actions={props.actions}
      />
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
