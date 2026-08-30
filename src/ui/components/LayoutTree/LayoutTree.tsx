import { GripHorizontal, GripVertical } from "lucide-react";
import type { CSSProperties, PointerEvent } from "react";
import {
  getLayoutSpacingExtent,
  getLayoutSplitDimensions,
  type LayoutNode,
  type SplitDirection,
} from "../../../models";
import type { CanvasActions } from "../../logic/CollageScreenView";
import type { SplitResizeGeometry } from "../../logic/interactions/useSplitResizer";
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
  startResize(
    event: PointerEvent<HTMLButtonElement>,
    splitId: string,
    direction: SplitDirection,
    geometry: SplitResizeGeometry,
  ): void;
}

export function LayoutTree(props: LayoutTreeProps) {
  if (props.node.type === "frame") {
    return (
      <PhotoFrame
        frame={props.node}
        canRemoveArea={props.canRemoveAreas}
        canvasScale={props.canvasScale}
        width={Math.max(1, props.width)}
        height={Math.max(1, props.height)}
        canResizeWidth={props.canResizeWidth}
        canResizeHeight={props.canResizeHeight}
        alwaysShowMeasurements={props.alwaysShowMeasurements}
        actions={props.actions}
      />
    );
  }

  const { node } = props;
  const geometry = getLayoutSplitDimensions(
    node,
    props.width,
    props.height,
    props.gap,
  );
  const firstExtent = getLayoutSpacingExtent(node.first, props.gap);
  const secondExtent = getLayoutSpacingExtent(node.second, props.gap);
  const resizeGeometry: SplitResizeGeometry = {
    size: node.direction === "vertical" ? props.width : props.height,
    firstFixed:
      node.direction === "vertical" ? firstExtent.width : firstExtent.height,
    secondFixed:
      node.direction === "vertical" ? secondExtent.width : secondExtent.height,
    gap: props.gap,
  };
  const style = createSplitStyle(
    node.direction,
    geometry.first,
    geometry.second,
    props.gap,
    props.canvasScale,
  );
  const canResizeWidth = props.canResizeWidth || node.direction === "vertical";
  const canResizeHeight =
    props.canResizeHeight || node.direction === "horizontal";

  return (
    <div className={`${styles.split} ${styles[node.direction]}`} style={style}>
      <LayoutTree
        {...props}
        node={node.first}
        width={geometry.first.width}
        height={geometry.first.height}
        canResizeWidth={canResizeWidth}
        canResizeHeight={canResizeHeight}
      />
      <LayoutTree
        {...props}
        node={node.second}
        width={geometry.second.width}
        height={geometry.second.height}
        canResizeWidth={canResizeWidth}
        canResizeHeight={canResizeHeight}
      />
      <button
        className={styles.divider}
        onPointerDown={(event) =>
          props.startResize(event, node.id, node.direction, resizeGeometry)
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

function createSplitStyle(
  direction: SplitDirection,
  first: { width: number; height: number },
  second: { width: number; height: number },
  gap: number,
  scale: number,
) {
  const firstSize = direction === "vertical" ? first.width : first.height;
  const secondSize = direction === "vertical" ? second.width : second.height;
  const totalSize = firstSize + gap + secondSize;
  const tracks = `${firstSize}fr ${secondSize}fr`;
  const style =
    direction === "vertical"
      ? {
          gridTemplateColumns: tracks,
          columnGap: `${gap * scale}px`,
        }
      : {
          gridTemplateRows: tracks,
          rowGap: `${gap * scale}px`,
        };
  return {
    ...style,
    "--split-position": `${((firstSize + gap / 2) / totalSize) * 100}%`,
  } as CSSProperties & { "--split-position": string };
}
