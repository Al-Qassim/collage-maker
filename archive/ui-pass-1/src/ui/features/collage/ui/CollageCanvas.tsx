import type { CSSProperties, DragEvent, PointerEvent } from "react";
import { useSplitResizer } from "../logic/useSplitResizer";
import type { CanvasSettings, LayoutNode, SplitDirection } from "../models/collage";
import { Icon } from "./Icon";

type Props = { layout: LayoutNode; canvas: CanvasSettings; selectedFrameId: string; onSelect: (id: string) => void; onAddImages: (files: FileList) => void; onResizeSplit: (id: string, ratio: number) => void };

export function CollageCanvas({ layout, canvas, selectedFrameId, onSelect, onAddImages, onResizeSplit }: Props) {
  const startResize = useSplitResizer(onResizeSplit);
  const canvasStyle = { "--gap": `${canvas.spacing}px`, "--radius": `${canvas.radius}px`, aspectRatio: `${canvas.width} / ${canvas.height}` } as CSSProperties;
  return <div className="canvas-stage">
    <div className="stage-label">CANVAS <span>{canvas.width} × {canvas.height} px</span></div>
    <div className="collage-canvas dynamic-canvas" style={canvasStyle}>
      <LayoutTree node={layout} selectedFrameId={selectedFrameId} onSelect={onSelect} onAddImages={onAddImages} onResizeStart={startResize}/>
    </div>
    <div className="stage-tip"><Icon name="info" size={14}/> Drop photos into a frame · Drag dividers to resize</div>
    <div className="zoom-control"><span>−</span><strong>78%</strong><span>+</span></div>
  </div>;
}

function LayoutTree({ node, selectedFrameId, onSelect, onAddImages, onResizeStart }: { node: LayoutNode; selectedFrameId: string; onSelect: (id: string) => void; onAddImages: (files: FileList) => void; onResizeStart: (event: PointerEvent<HTMLButtonElement>, id: string, direction: SplitDirection) => void }) {
  if (node.type === "frame") {
    const selected = node.id === selectedFrameId;
    const drop = (event: DragEvent<HTMLButtonElement>) => { event.preventDefault(); if (event.dataTransfer.files.length) onAddImages(event.dataTransfer.files); };
    return <button className={`collage-frame ${selected ? "selected" : ""} ${node.image ? "" : "empty"}`} onClick={() => onSelect(node.id)} onDragOver={(event) => event.preventDefault()} onDrop={drop} aria-label={`Frame ${node.id}`}>
      {node.image ? <img src={node.image} alt={node.alt ?? "Collage image"}/> : <span className="empty-frame"><Icon name="plus" size={20}/><small>Drop image</small></span>}
      {selected && <><span className="selection-border"/><span className="selection-tag">Frame selected</span><i className="handle handle-top"/><i className="handle handle-right"/><i className="handle handle-bottom"/><i className="handle handle-left"/></>}
    </button>;
  }
  const style = (node.direction === "vertical" ? { gridTemplateColumns: `${node.ratio}fr ${1 - node.ratio}fr` } : { gridTemplateRows: `${node.ratio}fr ${1 - node.ratio}fr` }) as CSSProperties & { "--split-position": string };
  style["--split-position"] = `${node.ratio * 100}%`;
  return <div className={`layout-split ${node.direction}`} style={style}>
    <LayoutTree node={node.first} selectedFrameId={selectedFrameId} onSelect={onSelect} onAddImages={onAddImages} onResizeStart={onResizeStart}/>
    <LayoutTree node={node.second} selectedFrameId={selectedFrameId} onSelect={onSelect} onAddImages={onAddImages} onResizeStart={onResizeStart}/>
    <button className="splitter" onPointerDown={(event) => onResizeStart(event, node.id, node.direction)} aria-label={`Resize ${node.direction} split`} />
  </div>;
}
