import { useRef } from "react";
import { useEditor } from "../store";
import { toSvgPoint } from "../lib/coords";

export function Canvas() {
  const project = useEditor((s) => s.project);
  const tool = useEditor((s) => s.tool);
  const selection = useEditor((s) => s.selection);
  const edgeFrom = useEditor((s) => s.edgeFrom);
  const { addPlace, addNode, select, moveItem, edgeClick } = useEditor();

  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ kind: "place" | "node"; id: string } | null>(null);

  const at = (e: { clientX: number; clientY: number }): { x: number; y: number } =>
    toSvgPoint(svgRef.current!, e.clientX, e.clientY);

  const onBgPointerDown = (e: React.PointerEvent): void => {
    const p = at(e);
    if (tool === "place") addPlace(p.x, p.y);
    else if (tool === "node") addNode(p.x, p.y);
    else select(null);
  };

  const startDrag = (e: React.PointerEvent, kind: "place" | "node", id: string): void => {
    e.stopPropagation();
    if (tool === "edge") {
      if (kind === "node") edgeClick(id);
      return;
    }
    select({ kind, id });
    if (tool === "select") {
      drag.current = { kind, id };
      svgRef.current?.setPointerCapture(e.pointerId);
    }
  };

  const onPointerMove = (e: React.PointerEvent): void => {
    if (!drag.current) return;
    const p = at(e);
    moveItem(drag.current.kind, drag.current.id, p.x, p.y);
  };
  const onPointerUp = (e: React.PointerEvent): void => {
    if (drag.current) {
      svgRef.current?.releasePointerCapture(e.pointerId);
      drag.current = null;
    }
  };

  const { venue, places, paths } = project;
  const nodeById = new Map(paths.nodes.map((n) => [n.id, n] as const));
  const isSel = (kind: "place" | "node", id: string): boolean =>
    selection?.kind === kind && selection.id === id;

  return (
    <div className="wf-canvas">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${venue.width} ${venue.height}`}
        className={`tool-${tool}`}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <image href={venue.image} x={0} y={0} width={venue.width} height={venue.height} preserveAspectRatio="none" />
        <rect className="wf-bg" x={0} y={0} width={venue.width} height={venue.height} fill="transparent" onPointerDown={onBgPointerDown} />

        {/* edges */}
        {paths.edges.map(([a, b], i) => {
          const na = nodeById.get(a), nb = nodeById.get(b);
          if (!na || !nb) return null;
          return <line key={`e${i}`} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="#2563eb" strokeWidth={4} strokeOpacity={0.6} strokeLinecap="round" />;
        })}

        {/* nodes */}
        {paths.nodes.map((n) => (
          <circle
            key={n.id}
            cx={n.x}
            cy={n.y}
            r={9}
            className={`wf-node${isSel("node", n.id) ? " sel" : ""}${edgeFrom === n.id ? " edgefrom" : ""}`}
            onPointerDown={(e) => startDrag(e, "node", n.id)}
          />
        ))}

        {/* places */}
        {places.map((p) => (
          <g key={p.id} className={`wf-place${isSel("place", p.id) ? " sel" : ""}`} onPointerDown={(e) => startDrag(e, "place", p.id)}>
            <circle cx={p.x} cy={p.y} r={16} fill={p.color || (p.role === "start" ? "#E11D48" : "#F58A14")} stroke="#fff" strokeWidth={3} />
            <circle cx={p.x} cy={p.y} r={5} fill="#fff" />
            <text x={p.x} y={p.y + 34} textAnchor="middle" fontSize={16} fontWeight={700} fill="#0F172A">{p.name}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
