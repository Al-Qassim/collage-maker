import {
  DEFAULT_IMAGE_TRANSFORM,
  EMPTY_FRAME_INSETS,
  splitFrameInsets,
  type CanvasSettings,
  type FrameInsets,
  type FrameNode,
  type LayoutNode,
  type SplitDirection,
} from "../../../models";

export function imageFrames(node: LayoutNode): FrameNode[] {
  if (node.type === "frame") return node.image ? [node] : [];
  return [...imageFrames(node.first), ...imageFrames(node.second)];
}

export function generateImageLayout(
  frames: FrameNode[],
  idPrefix: string,
  seed = 0,
): LayoutNode {
  const random = createRandom(seed);
  const shuffled = seed ? shuffle(frames, random) : frames;
  let index = 0;

  const build = (items: FrameNode[], depth: number): LayoutNode => {
    if (items.length === 1) {
      return { ...items[0], id: `frame-${idPrefix}-${index++}` };
    }
    const midpoint = seed
      ? randomMidpoint(items.length, random)
      : Math.ceil(items.length / 2);
    const direction: SplitDirection = seed
      ? random() > 0.5
        ? "vertical"
        : "horizontal"
      : depth % 2 === 0
        ? "vertical"
        : "horizontal";
    const splitIndex = index++;
    return {
      id: `split-${idPrefix}-${splitIndex}`,
      type: "split",
      direction,
      ratio: 0.5,
      first: build(items.slice(0, midpoint), depth + 1),
      second: build(items.slice(midpoint), depth + 1),
    };
  };

  return build(shuffled, 0);
}

export function fitLayoutImages(
  layout: LayoutNode,
  canvas: CanvasSettings,
): LayoutNode {
  return fitNode(
    layout,
    Math.max(1, canvas.width - canvas.marginHorizontal * 2),
    Math.max(1, canvas.height - canvas.marginVertical * 2),
    canvas.spacing,
    EMPTY_FRAME_INSETS,
  );
}

function fitNode(
  node: LayoutNode,
  width: number,
  height: number,
  gap: number,
  insets: FrameInsets,
): LayoutNode {
  if (node.type === "frame") {
    if (!node.image) return node;
    const visibleWidth = Math.max(1, width - insets.left - insets.right);
    const visibleHeight = Math.max(1, height - insets.top - insets.bottom);
    const sourceWidth = node.transform?.baseWidth ?? visibleWidth;
    const sourceHeight = node.transform?.baseHeight ?? visibleHeight;
    const scale = Math.max(
      visibleWidth / sourceWidth,
      visibleHeight / sourceHeight,
    );
    return {
      ...node,
      transform: {
        ...DEFAULT_IMAGE_TRANSFORM,
        baseWidth: sourceWidth * scale,
        baseHeight: sourceHeight * scale,
      },
    };
  }

  const firstWidth = node.direction === "vertical" ? width * node.ratio : width;
  const firstHeight =
    node.direction === "horizontal" ? height * node.ratio : height;
  const secondWidth =
    node.direction === "vertical" ? width - firstWidth : width;
  const secondHeight =
    node.direction === "horizontal" ? height - firstHeight : height;
  const [firstInsets, secondInsets] = splitFrameInsets(
    insets,
    node.direction,
    gap,
  );
  return {
    ...node,
    first: fitNode(node.first, firstWidth, firstHeight, gap, firstInsets),
    second: fitNode(node.second, secondWidth, secondHeight, gap, secondInsets),
  };
}

function randomMidpoint(length: number, random: () => number): number {
  const minimum = Math.max(1, Math.floor(length * 0.35));
  const maximum = Math.min(length - 1, Math.ceil(length * 0.65));
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

function shuffle<T>(values: T[], random: () => number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function createRandom(seed: number): () => number {
  let value = Math.floor(seed * 2_147_483_647) || 1;
  return () => {
    value = (value * 48_271) % 2_147_483_647;
    return value / 2_147_483_647;
  };
}
