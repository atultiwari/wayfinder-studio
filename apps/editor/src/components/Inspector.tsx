import { useEditor } from "../store";
import { StallList } from "./StallList";

export function Inspector() {
  const project = useEditor((s) => s.project);
  const selection = useEditor((s) => s.selection);
  const { updatePlace, attachToNearestNode, deleteSelected } = useEditor();

  if (!selection) {
    return (
      <section className="wf-panel">
        <h3>Inspector</h3>
        <p className="wf-muted">Select an item to edit it. Use the tools to add places, nodes and edges.
          Attach each place to a nearby node so it can be routed to.</p>
      </section>
    );
  }

  if (selection.kind === "node") {
    return (
      <section className="wf-panel">
        <h3>Node “{selection.id}”</h3>
        <p className="wf-muted">Drag to move. Use <b>+ Edge</b> then click two nodes to connect them.</p>
        <button className="danger" onClick={deleteSelected}>Delete node</button>
      </section>
    );
  }

  const place = project.places.find((p) => p.id === selection.id);
  if (!place) return null;

  return (
    <section className="wf-panel">
      <h3>Place</h3>
      <label>Name<input value={place.name} onChange={(e) => updatePlace(place.id, { name: e.target.value })} /></label>
      <label>Role
        <select value={place.role} onChange={(e) => updatePlace(place.id, { role: e.target.value as "start" | "destination" })}>
          <option value="destination">destination</option>
          <option value="start">start (you are here)</option>
        </select>
      </label>
      <label>Colour<input type="color" value={place.color ?? "#F58A14"} onChange={(e) => updatePlace(place.id, { color: e.target.value })} /></label>
      <div className="wf-row">
        <span className="wf-muted">Path node: {place.nodeId ?? "— none —"}</span>
        <button onClick={() => attachToNearestNode(place.id)} disabled={project.paths.nodes.length === 0}>Attach to nearest</button>
      </div>
      <button className="danger" onClick={deleteSelected}>Delete place</button>
      <StallList placeId={place.id} />
    </section>
  );
}
