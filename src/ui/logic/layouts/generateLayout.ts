import {
  DEFAULT_IMAGE_TRANSFORM,
  fitLayoutSpacing,
  getLayoutSplitDimensions,
  type CanvasSettings,
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
  if (!seed) return generateEqualGrid(frames, idPrefix);

  const random = createRandom(seed);
  const shuffled = shuffle(frames, random);
  let index = 0;
  const build = (items: FrameNode[]): LayoutNode => {
    if (items.length === 1) {
      return { ...items[0], id: `frame-${idPrefix}-${index++}` };
    }
    const midpoint = randomMidpoint(items.length, random);
    const direction: SplitDirection =
      random() > 0.5 ? "vertical" : "horizontal";
    const splitIndex = index++;
    return {
      id: `split-${idPrefix}-${splitIndex}`,
      type: "split",
      direction,
      ratio: 0.5,
      first: build(items.slice(0, midpoint)),
      second: build(items.slice(midpoint)),
    };
  };

  return build(shuffled);
}

function generateEqualGrid(frames: FrameNode[], idPrefix: string): LayoutNode {
  if (frames.length === 0) {
    return { id: `frame-${idPrefix}-0`, type: "frame" };
  }
  let index = 0;
  const frameNode = (frame: FrameNode): FrameNode => ({
    ...frame,
    id: `frame-${idPrefix}-${index++}`,
  });
  const combine = (
    nodes: LayoutNode[],
    direction: SplitDirection,
  ): LayoutNode => {
    if (nodes.length === 1) return nodes[0];
    const splitIndex = index++;
    return {
      id: `split-${idPrefix}-${splitIndex}`,
      type: "split",
      direction,
      ratio: 1 / nodes.length,
      first: nodes[0],
      second: combine(nodes.slice(1), direction),
    };
  };

  const columnCount = Math.ceil(Math.sqrt(frames.length));
  const rowCount = Math.ceil(frames.length / columnCount);
  const rows: LayoutNode[] = [];
  let offset = 0;
  for (let row = 0; row < rowCount; row += 1) {
    const remaining = frames.length - offset;
    const rowSize = Math.ceil(remaining / (rowCount - row));
    const rowFrames = frames.slice(offset, offset + rowSize).map(frameNode);
    rows.push(combine(rowFrames, "vertical"));
    offset += rowSize;
  }
  return combine(rows, "horizontal");
}

export function fitLayoutImages(
  layout: LayoutNode,
  canvas: CanvasSettings,
): LayoutNode {
  const width = Math.max(1, canvas.width - canvas.marginHorizontal * 2);
  const height = Math.max(1, canvas.height - canvas.marginVertical * 2);
  const spacing = fitLayoutSpacing(layout, width, height, canvas.spacing);
  return fitNode(layout, width, height, spacing);
}

function fitNode(
  node: LayoutNode,
  width: number,
  height: number,
  gap: number,
): LayoutNode {
  if (node.type === "frame") {
    if (!node.image) return node;
    const sourceWidth = node.transform?.baseWidth ?? width;
    const sourceHeight = node.transform?.baseHeight ?? height;
    const scale = Math.max(width / sourceWidth, height / sourceHeight);
    return {
      ...node,
      transform: {
        ...DEFAULT_IMAGE_TRANSFORM,
        baseWidth: sourceWidth * scale,
        baseHeight: sourceHeight * scale,
      },
    };
  }

  const geometry = getLayoutSplitDimensions(node, width, height, gap);
  return {
    ...node,
    first: fitNode(
      node.first,
      geometry.first.width,
      geometry.first.height,
      gap,
    ),
    second: fitNode(
      node.second,
      geometry.second.width,
      geometry.second.height,
      gap,
    ),
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
