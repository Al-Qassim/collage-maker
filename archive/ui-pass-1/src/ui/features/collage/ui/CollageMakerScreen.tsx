import { findFrame } from "../logic/tree";
import type { CollageCommands, CollageState } from "../models/collage";
import { CollageCanvas } from "./CollageCanvas";
import { Icon } from "./Icon";
import { Inspector } from "./Inspector";

export function CollageMakerScreen({ state, commands }: { state: CollageState; commands: CollageCommands }) {
  const selectedFrame = findFrame(state.layout, state.selectedFrameId);
  return <main className="app-shell">
    <aside className="rail"><div className="brand-mark">F<span>.</span></div><nav className="rail-nav" aria-label="Primary navigation"><button className="rail-item active"><Icon name="grid"/><span>Collage</span></button><button className="rail-item"><Icon name="folder"/><span>Projects</span></button></nav><div className="rail-bottom"><button className="rail-item"><Icon name="help"/><span>Support</span></button><button className="avatar" aria-label="Your profile">JT</button></div></aside>
    <section className="workspace"><header className="topbar"><div className="crumb"><span>My collages</span><span className="slash">/</span><strong>{state.title}</strong><span className="saved-dot"/><small>Saved</small></div><div className="top-actions"><div className="history"><button className="tool-button" aria-label="Undo"><Icon name="undo"/></button><button className="tool-button muted" aria-label="Redo"><Icon name="redo"/></button></div><button className="share-button"><Icon name="download" size={16}/> Export</button></div></header>
      <CollageCanvas layout={state.layout} canvas={state.canvas} selectedFrameId={state.selectedFrameId} onSelect={commands.selectFrame} onAddImages={commands.addImages} onResizeSplit={commands.resizeSplit}/>
    </section>
    <Inspector selectedFrame={selectedFrame} canvas={state.canvas} onAddImages={commands.addImages} onDelete={commands.deleteSelected} onSplit={commands.splitFrame} onCanvasChange={commands.changeCanvas} onNewLayout={commands.startNewLayout}/>
  </main>;
}
