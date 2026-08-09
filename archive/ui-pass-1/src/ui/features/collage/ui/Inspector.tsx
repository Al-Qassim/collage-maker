import { useRef, type ChangeEvent } from "react";
import type { CanvasSettings, FrameNode, SplitDirection } from "../models/collage";
import { Icon } from "./Icon";

type Props = { selectedFrame?: FrameNode; canvas: CanvasSettings; onAddImages: (files: FileList) => void; onDelete: () => void; onSplit: (direction: SplitDirection) => void; onCanvasChange: (field: keyof CanvasSettings, value: number | string) => void; onNewLayout: () => void };
export function Inspector({ selectedFrame, canvas, onAddImages, onDelete, onSplit, onCanvasChange, onNewLayout }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const pickImages = (event: ChangeEvent<HTMLInputElement>) => { if (event.target.files) onAddImages(event.target.files); event.target.value = ""; };
  return <aside className="properties">
    <div className="panel-header"><div><p>COLLAGE EDITOR</p><h1>Sunday stories</h1></div><button className="more-button" aria-label="More options">•••</button></div>
    <div className="panel-scroll">
      <section className="inspector-section selected-frame"><div className="section-heading"><span>Selected frame</span><button className="text-action">Deselect</button></div>
        <div className={`image-thumb ${selectedFrame?.image ? "" : "no-image"}`}>{selectedFrame?.image ? <img src={selectedFrame.image} alt={selectedFrame.alt ?? "Selected image"}/> : <span>Empty frame</span>}<button className="change-image" onClick={() => input.current?.click()}><Icon name="image" size={15}/>{selectedFrame?.image ? "Change" : "Add image"}</button></div>
        <input className="visually-hidden" ref={input} type="file" accept="image/*" multiple onChange={pickImages}/>
        <div className="frame-operations"><button onClick={() => input.current?.click()}><Icon name="copy" size={16}/><span>Replace</span></button><button onClick={onDelete}><Icon name="trash" size={16}/><span>Remove</span></button></div>
      </section>
      <section className="inspector-section"><div className="section-heading"><span>Split this frame</span><span className="small-note">Add an image area</span></div><div className="split-buttons"><button onClick={() => onSplit("vertical")}><span className="split-icon"><Icon name="vertical"/></span><span>Vertical</span></button><button onClick={() => onSplit("horizontal")}><span className="split-icon"><Icon name="horizontal"/></span><span>Horizontal</span></button></div></section>
      <section className="inspector-section canvas-settings"><div className="section-heading"><span>Canvas</span><span className="canvas-dimensions">{canvas.width} × {canvas.height}</span></div>
        <div className="dimension-inputs"><label>W <input type="number" min="100" max="4000" value={canvas.width} onChange={(e) => onCanvasChange("width", e.target.value)}/></label><span>×</span><label>H <input type="number" min="100" max="4000" value={canvas.height} onChange={(e) => onCanvasChange("height", e.target.value)}/></label></div>
        <RangeRow label="Spacing" value={canvas.spacing} onChange={(value) => onCanvasChange("spacing", value)}/><RangeRow label="Corner radius" value={canvas.radius} onChange={(value) => onCanvasChange("radius", value)}/>
      </section>
      <section className="inspector-section layout-section"><div className="section-heading"><span>Custom layout</span><button className="text-action" onClick={onNewLayout}>Start over</button></div><p className="layout-copy">Split any frame, then drag its divider into place. Every area holds one image.</p><button className="layout-button" onClick={onNewLayout}><Icon name="sparkle" size={16}/><span>Start a new layout</span><Icon name="chevron" size={16}/></button></section>
    </div>
    <div className="help-card"><div className="help-icon"><Icon name="help" size={17}/></div><div><strong>Need a hand?</strong><p>See how custom layouts work</p></div><Icon name="chevron" size={16}/></div>
  </aside>;
}
function RangeRow({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <div className="canvas-row"><label>{label}</label><div className="range-wrap"><input type="range" min="0" max="30" value={value} onChange={(e) => onChange(Number(e.target.value))}/><output>{value}</output></div></div>; }
