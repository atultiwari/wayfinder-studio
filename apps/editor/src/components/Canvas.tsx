import { useEffect, useRef, useState } from "react";
import { useEditor } from "../store";
import { toSvgPoint } from "../lib/coords";

type View = [number, number, number, number]; // x, y, w, h

export function Canvas() {
  const project = useEditor((s) => s.project);
  const tool = useEditor((s) => s.tool);
  const selection = useEditor((s) => s.selection);
  const edgeFrom = useEditor((s) => s.edgeFrom);
  const { addPlace, addNode, select, moveItem, edgeClick } = useEditor();

  const { width: W, height: H, image } = project.venue;
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<View>([0, 0, W, H]);
  const drag = useRef<{ kind: "place" | "node"; id: string } | null>(null);
  const pan = useRef<{ sx: number; sy: number; view: View; moved: boolean } | null>(null);

  useEffect(() => setView([0, 0, W, H]), [W, H]);

  const at = (e: { clientX: number; clientY: number }): { x: number; y: number } =>
    toSvgPoint(svgRef.current!, e.clientX, e.clientY);

  const clampView = ([x, y, w, h]: View): View => [
    Math.min(Math.max(x, 0), Math.max(0, W - w)),
    Math.min(Math.max(y, 0), Math.max(0, H - h)),
    w,
    h,
  ];

  const zoomAt = (factor: number, cx: number, cy: number): void => {
    setView(([x, y, w, h]) => {
      const minW = W / 8;
      const nw = Math.min(Math.max(w * factor, minW), W);
      const nh = nw * (H / W);
      const nx = cx - (cx - x) * (nw / w);
      const ny = cy - (cy - y) * (nh / h);
      return clampView([nx, ny, nw, nh]);
    });
  };

  const onWheel = (e: React.WheelEvent): void => {
    e.preventDefault();
    const p = at(e);
    zoomAt(e.deltaY > 0 ? 1.12 : 1 / 1.12, p.x, p.y);
  };

  const onBgPointerDown = (e: React.PointerEvent): void => {
    const p = at(e);
    if (tool === "place") return addPlace(p.x, p.y);
    if (tool === "node") return addNode(p.x, p.y);
    // select tool: begin a pan; a click without movement clears selection
    pan.current = { sx: e.clientX, sy: e.clientY, view, moved: false };
    svgRef.current?.setPointerCapture(e.pointerId);
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
    if (drag.current) {
      const p = at(e);
      moveItem(drag.current.kind, drag.current.id, p.x, p.y);
      return;
    }
    if (pan.current) {
      const rect = svgRef.current!.getBoundingClientRect();
      const [, , w, h] = pan.current.view;
      const dx = ((e.clientX - pan.current.sx) / rect.width) * w;
      const dy = ((e.clientY - pan.current.sy) / rect.height) * h;
      if (Math.abs(e.clientX - pan.current.sx) + Math.abs(e.clientY - pan.current.sy) > 3) pan.current.moved = true;
      setView(clampView([pan.current.view[0] - dx, pan.current.view[1] - dy, w, h]));
    }
  };

  const onPointerUp = (e: React.PointerEvent): void => {
    if (drag.current) {
      svgRef.current?.releasePointerCapture(e.pointerId);
      drag.current = null;
    }
    if (pan.current) {
      svgRef.current?.releasePointerCapture(e.pointerId);
      if (!pan.current.moved && tool === "select") select(null);
      pan.current = null;
    }
  };

  const nodeById = new Map(project.paths.nodes.map((n) => [n.id, n] as const));
  const isSel = (kind: "place" | "node", id: string): boolean => selection?.kind === kind && selection.id === id;

  return (
    <div className="wf-canvas">
      <div className="wf-zoom">
        <button onClick={() => zoomAt(1 / 1.3, view[0] + view[2] / 2, view[1] + view[3] / 2)} aria-label="Zoom in">+</button>
        <button onClick={() => zoomAt(1.3, view[0] + view[2] / 2, view[1] + view[3] / 2)} aria-label="Zoom out">−</button>
        <button onClick={() => setView([0, 0, W, H])} aria-label="Fit">⤢</button>
      </div>
      <svg
        ref={svgRef}
        viewBox={view.join(" ")}
        className={`tool-${tool}`}
        onWheel={onWheel}
        onPointerDown={onBgPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <image href={image} x={0} y={0} width={W} height={H} preserveAspectRatio="none" />

        {project.paths.edges.map(([a, b], i) => {
          const na = nodeById.get(a), nb = nodeById.get(b);
          if (!na || !nb) return null;
          return <line key={`e${i}`} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="#2563eb" strokeWidth={4} strokeOpacity={0.6} strokeLinecap="round" />;
        })}

        {project.paths.nodes.map((n) => (
          <circle
            key={n.id}
            cx={n.x}
            cy={n.y}
            r={9}
            className={`wf-node${isSel("node", n.id) ? " sel" : ""}${edgeFrom === n.id ? " edgefrom" : ""}`}
            onPointerDown={(e) => startDrag(e, "node", n.id)}
          />
        ))}

        {project.places.map((p) => (
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
