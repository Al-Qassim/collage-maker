import type {
  CollagePage,
  CollageProject,
  CollageState,
  LayoutNode,
} from "../../models";
import type { ProjectFileService } from "../ProjectFileService";

export class BrowserProjectFileService implements ProjectFileService {
  async saveProject(state: CollageState): Promise<void> {
    const cache = new Map<string, Promise<string>>();
    const pages = await Promise.all(
      state.pages.map(async (page) => ({
        ...page,
        layout: await embedLayoutImages(page.layout, cache),
      })),
    );
    const activePage = pages.find((page) => page.id === state.activePageId);
    const project: CollageProject = {
      version: 1,
      state: {
        ...state,
        pages,
        layout: activePage?.layout ?? pages[0].layout,
        activePageId: activePage?.id ?? pages[0].id,
      },
    };
    download(
      new Blob([JSON.stringify(project)], { type: "application/json" }),
      `${defaultProjectName()}.frame-collage.json`,
    );
  }

  async openProject(file: File): Promise<CollageState> {
    const value: unknown = JSON.parse(await file.text());
    if (!isCollageProject(value)) {
      throw new Error("This is not a valid Frame collage project.");
    }
    const activePage = value.state.pages.find(
      (page) => page.id === value.state.activePageId,
    );
    if (!activePage) {
      throw new Error("The project does not contain its active page.");
    }
    return {
      ...value.state,
      canvas: {
        ...value.state.canvas,
        margin: value.state.canvas.margin ?? 0,
      },
      layout: activePage.layout,
    };
  }
}

async function embedLayoutImages(
  node: LayoutNode,
  cache: Map<string, Promise<string>>,
): Promise<LayoutNode> {
  if (node.type === "frame") {
    if (!node.image || node.image.startsWith("data:")) return node;
    let encoded = cache.get(node.image);
    if (!encoded) {
      encoded = sourceToDataUrl(node.image);
      cache.set(node.image, encoded);
    }
    return { ...node, image: await encoded };
  }
  const [first, second] = await Promise.all([
    embedLayoutImages(node.first, cache),
    embedLayoutImages(node.second, cache),
  ]);
  return { ...node, first, second };
}

async function sourceToDataUrl(source: string): Promise<string> {
  const response = await fetch(source);
  if (!response.ok) throw new Error("A project image could not be saved.");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(new Error("A project image could not be saved."));
    reader.readAsDataURL(blob);
  });
}

function isCollageProject(value: unknown): value is CollageProject {
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.state)) {
    return false;
  }
  const state = value.state;
  return (
    isCanvas(state.canvas) &&
    typeof state.activePageId === "string" &&
    Array.isArray(state.pages) &&
    state.pages.length > 0 &&
    state.pages.every(isPage)
  );
}

function isCanvas(value: unknown): boolean {
  return (
    isRecord(value) &&
    [value.width, value.height, value.spacing, value.radius].every(
      (item) => typeof item === "number" && Number.isFinite(item),
    ) &&
    (value.margin === undefined ||
      (typeof value.margin === "number" && Number.isFinite(value.margin)))
  );
}

function isPage(value: unknown): value is CollagePage {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    isLayoutNode(value.layout)
  );
}

function isLayoutNode(value: unknown): value is LayoutNode {
  if (!isRecord(value) || typeof value.id !== "string") return false;
  if (value.type === "frame") {
    return value.image === undefined || typeof value.image === "string";
  }
  return (
    value.type === "split" &&
    (value.direction === "vertical" || value.direction === "horizontal") &&
    typeof value.ratio === "number" &&
    isLayoutNode(value.first) &&
    isLayoutNode(value.second)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function defaultProjectName(): string {
  const date = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return `frame-collage-${date}`;
}
