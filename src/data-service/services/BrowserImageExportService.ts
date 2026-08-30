import {
  DEFAULT_IMAGE_TRANSFORM,
  fitLayoutSpacing,
  getLayoutSplitDimensions,
  type CollageState,
  type ExportFormat,
  type ImageExportOptions,
  type ImageTransform,
  type LayoutNode,
} from "../../models";
import type { ImageExportService } from "../ImageExportService";

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class BrowserImageExportService implements ImageExportService {
  exportImage(
    state: CollageState,
    format: ExportFormat,
    options: ImageExportOptions,
    fileName?: string,
  ): Promise<void> {
    return exportCollage(state, format, options, fileName);
  }
}

async function exportCollage(
  state: CollageState,
  format: ExportFormat,
  options: ImageExportOptions,
  fileName = defaultExportName(),
): Promise<void> {
  const canvas = document.createElement("canvas");
  canvas.width = state.canvas.width;
  canvas.height = state.canvas.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas export is not supported.");

  if (format === "jpg" || !options.transparentBackground) {
    context.fillStyle = "#fffefa";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  const insetX = state.canvas.marginHorizontal;
  const insetY = state.canvas.marginVertical;
  const bounds = {
    x: insetX,
    y: insetY,
    width: Math.max(1, canvas.width - insetX * 2),
    height: Math.max(1, canvas.height - insetY * 2),
  };
  const spacing = fitLayoutSpacing(
    state.layout,
    bounds.width,
    bounds.height,
    state.canvas.spacing,
  );
  await drawNode(context, state.layout, bounds, spacing, state.canvas.radius);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) =>
        value
          ? resolve(value)
          : reject(new Error("The image could not be created.")),
      format === "jpg" ? "image/jpeg" : "image/png",
      format === "jpg" ? 0.92 : undefined,
    );
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeFileName(fileName)}.${format}`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

async function drawNode(
  context: CanvasRenderingContext2D,
  node: LayoutNode,
  bounds: Bounds,
  gap: number,
  radius: number,
): Promise<void> {
  if (node.type === "frame") {
    if (node.image) {
      const image = await loadImage(node.image);
      drawCoverImage(
        context,
        image,
        bounds,
        radius,
        node.transform ?? DEFAULT_IMAGE_TRANSFORM,
      );
    }
    return;
  }

  const geometry = getLayoutSplitDimensions(
    node,
    bounds.width,
    bounds.height,
    gap,
  );
  if (node.direction === "vertical") {
    await Promise.all([
      drawNode(
        context,
        node.first,
        { ...bounds, width: geometry.first.width },
        gap,
        radius,
      ),
      drawNode(
        context,
        node.second,
        {
          x: bounds.x + geometry.first.width + gap,
          y: bounds.y,
          width: geometry.second.width,
          height: bounds.height,
        },
        gap,
        radius,
      ),
    ]);
    return;
  }

  await Promise.all([
    drawNode(
      context,
      node.first,
      { ...bounds, height: geometry.first.height },
      gap,
      radius,
    ),
    drawNode(
      context,
      node.second,
      {
        x: bounds.x,
        y: bounds.y + geometry.first.height + gap,
        width: bounds.width,
        height: geometry.second.height,
      },
      gap,
      radius,
    ),
  ]);
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  bounds: Bounds,
  radius: number,
  transform: ImageTransform,
): void {
  const coverScale = Math.max(
    bounds.width / image.width,
    bounds.height / image.height,
  );
  const baseWidth = transform.baseWidth ?? image.width * coverScale;
  const baseHeight = transform.baseHeight ?? image.height * coverScale;
  const width = baseWidth * transform.zoom;
  const height = baseHeight * transform.zoom;
  const x =
    bounds.x +
    (bounds.width - width) / 2 +
    (transform.offsetX / 100) * bounds.width;
  const y =
    bounds.y +
    (bounds.height - height) / 2 +
    (transform.offsetY / 100) * bounds.height;

  context.save();
  roundedRectangle(
    context,
    bounds,
    Math.min(radius, bounds.width / 2, bounds.height / 2),
  );
  context.clip();
  context.drawImage(image, x, y, width, height);
  context.restore();
}

function roundedRectangle(
  context: CanvasRenderingContext2D,
  bounds: Bounds,
  radius: number,
): void {
  context.beginPath();
  context.roundRect(bounds.x, bounds.y, bounds.width, bounds.height, radius);
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (!source.startsWith("blob:") && !source.startsWith("data:")) {
      image.crossOrigin = "anonymous";
    }
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("One of the photos could not be loaded."));
    image.src = source;
  });
}

function safeFileName(title: string): string {
  return (
    title
      .trim()
      .replace(/[^\p{L}\p{N}_-]+/gu, "-")
      .replace(/^-|-$/g, "") || "collage"
  );
}

function defaultExportName(): string {
  const parts = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `collage-maker-${value("year")}-${value("month")}-${value("day")}`;
}
