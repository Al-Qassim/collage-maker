import {
  DEFAULT_IMAGE_TRANSFORM,
  type CollageState,
  type ExportFormat,
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
    fileName?: string,
  ): Promise<void> {
    return exportCollage(state, format, fileName);
  }
}

async function exportCollage(
  state: CollageState,
  format: ExportFormat,
  fileName = defaultExportName(),
): Promise<void> {
  const canvas = document.createElement("canvas");
  canvas.width = state.canvas.width;
  canvas.height = state.canvas.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas export is not supported.");

  context.fillStyle = "#fffefa";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const inset = state.canvas.spacing;
  await drawNode(
    context,
    state.layout,
    {
      x: inset,
      y: inset,
      width: Math.max(1, canvas.width - inset * 2),
      height: Math.max(1, canvas.height - inset * 2),
    },
    state.canvas.spacing,
    state.canvas.radius,
  );

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

  if (node.direction === "vertical") {
    const available = Math.max(1, bounds.width - gap);
    const firstWidth = available * node.ratio;
    await Promise.all([
      drawNode(
        context,
        node.first,
        { ...bounds, width: firstWidth },
        gap,
        radius,
      ),
      drawNode(
        context,
        node.second,
        {
          x: bounds.x + firstWidth + gap,
          y: bounds.y,
          width: available - firstWidth,
          height: bounds.height,
        },
        gap,
        radius,
      ),
    ]);
    return;
  }

  const available = Math.max(1, bounds.height - gap);
  const firstHeight = available * node.ratio;
  await Promise.all([
    drawNode(
      context,
      node.first,
      { ...bounds, height: firstHeight },
      gap,
      radius,
    ),
    drawNode(
      context,
      node.second,
      {
        x: bounds.x,
        y: bounds.y + firstHeight + gap,
        width: bounds.width,
        height: available - firstHeight,
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
