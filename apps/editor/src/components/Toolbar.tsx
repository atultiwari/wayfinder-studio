import { useRef, useState } from "react";
import { parseProject } from "@wayfinder/schema";
import { useEditor, type Tool } from "../store";
import { loadImageFile } from "../lib/image";
import { publish, previewUrl, exportJson } from "../lib/publish";
import { DeployDialog } from "./DeployDialog";

const TOOLS: { id: Tool; label: string }[] = [
  { id: "select", label: "Select" },
  { id: "place", label: "+ Place" },
  { id: "node", label: "+ Node" },
  { id: "edge", label: "+ Edge" },
];

export function Toolbar() {
  const tool = useEditor((s) => s.tool);
  const project = useEditor((s) => s.project);
  const { setTool, setProjectName, setVenueImage, loadProject, loadSample, newProject } = useEditor();
  const imageInput = useRef<HTMLInputElement>(null);
  const jsonInput = useRef<HTMLInputElement>(null);
  const [deployOpen, setDeployOpen] = useState(false);

  const onImage = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { image, width, height } = await loadImageFile(file);
    setVenueImage(image, width, height);
    e.target.value = "";
  };

  const onJson = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      loadProject(parseProject(JSON.parse(await file.text())));
    } catch (err) {
      alert("Invalid project file: " + (err instanceof Error ? err.message : String(err)));
    }
    e.target.value = "";
  };

  const onPublish = (): void => {
    const r = publish(project);
    if (!r.ok) alert("Cannot publish — fix these first:\n\n" + (r.errors ?? []).join("\n"));
  };

  return (
    <>
    <header className="wf-toolbar">
      <div className="wf-brand">Wayfinder Studio</div>
      <input className="wf-name" value={project.name} onChange={(e) => setProjectName(e.target.value)} aria-label="Project name" />

      <div className="wf-tools">
        {TOOLS.map((t) => (
          <button key={t.id} className={tool === t.id ? "on" : ""} onClick={() => setTool(t.id)}>{t.label}</button>
        ))}
      </div>

      <div className="wf-actions">
        <button onClick={() => imageInput.current?.click()}>Load image</button>
        <button onClick={loadSample}>Sample</button>
        <button onClick={newProject}>New</button>
        <button onClick={() => jsonInput.current?.click()}>Import</button>
        <button onClick={() => exportJson(project)}>Export</button>
        <button onClick={() => window.open(previewUrl(project), "_blank")}>Preview</button>
        <button onClick={onPublish}>Publish</button>
        <button className="primary" onClick={() => setDeployOpen(true)}>Deploy</button>
      </div>

      <input ref={imageInput} type="file" accept="image/*" hidden onChange={onImage} />
      <input ref={jsonInput} type="file" accept="application/json,.json" hidden onChange={onJson} />
    </header>
    {deployOpen && <DeployDialog onClose={() => setDeployOpen(false)} />}
    </>
  );
}
