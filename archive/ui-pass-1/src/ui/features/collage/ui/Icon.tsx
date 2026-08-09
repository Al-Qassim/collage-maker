import type { ReactNode } from "react";

type IconName = "grid" | "folder" | "help" | "undo" | "redo" | "download" | "image" | "vertical" | "horizontal" | "trash" | "copy" | "chevron" | "info" | "sparkle" | "plus";
export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    folder: <path d="M3 6.5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8.8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.5 2.5 0 1 1 4.1 1.9c-1.2.9-1.7 1.3-1.7 2.6M12 16.8h.01"/></>,
    undo: <><path d="M9 7 4 12l5 5"/><path d="M20 17a8 8 0 0 0-8-8H4"/></>, redo: <><path d="m15 7 5 5-5 5"/><path d="M4 17a8 8 0 0 1 8-8h8"/></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M5 21h14"/></>, plus: <path d="M12 5v14M5 12h14"/>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.3"/><path d="m4 17 5-5 3.5 3.5 2.5-2.5L20 18"/></>,
    vertical: <><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M12 4v16"/></>, horizontal: <><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 12h18"/></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l.7 13h8.6L17 7"/></>, copy: <><rect x="8" y="8" width="12" height="12" rx="1"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>, info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>, sparkle: <path d="m12 3 1.65 5.35L19 10l-5.35 1.65L12 17l-1.65-5.35L5 10l5.35-1.65L12 3Z"/>,
  };
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
