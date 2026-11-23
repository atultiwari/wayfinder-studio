import { lint } from "@wayfinder/schema";
import { useEditor } from "../store";

export function CheckPanel() {
  const project = useEditor((s) => s.project);
  const warnings = lint(project);
  return (
    <section className="wf-panel">
      <h3>Check</h3>
      <div className="wf-stats">
        <span>{project.places.length} places</span>
        <span>{project.paths.nodes.length} nodes</span>
        <span>{project.paths.edges.length} edges</span>
      </div>
      {warnings.length === 0 ? (
        <p className="wf-ok">✓ Ready to publish</p>
      ) : (
        <ul className="wf-warn">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
      )}
    </section>
  );
}
