import type { Paths, Place, Project } from "@wayfinder/schema";

export interface Point {
  x: number;
  y: number;
}

export interface Step {
  kind: "start" | "left" | "right" | "straight" | "arrive";
  text: string;
}

/** Dijkstra over the path graph by euclidean edge weight. Returns [] if unreachable. */
export function shortestPath(paths: Paths, from: string, to: string): string[] {
  const nodes = new Map(paths.nodes.map((n) => [n.id, n] as const));
  if (!nodes.has(from) || !nodes.has(to)) return [];
  if (from === to) return [from];

  const adj = new Map<string, Array<[string, number]>>();
  const link = (a: string, b: string): void => {
    const A = nodes.get(a)!, B = nodes.get(b)!;
    const d = Math.hypot(A.x - B.x, A.y - B.y);
    const list = adj.get(a) ?? [];
    list.push([b, d]);
    adj.set(a, list);
  };
  for (const [a, b] of paths.edges) {
    link(a, b);
    link(b, a);
  }

  const dist = new Map<string, number>();
  const prev = new Map<string, string>();
  const todo = new Set(nodes.keys());
  for (const id of todo) dist.set(id, Infinity);
  dist.set(from, 0);

  while (todo.size) {
    let u: string | null = null;
    let best = Infinity;
    for (const k of todo) {
      const d = dist.get(k)!;
      if (d < best) {
        best = d;
        u = k;
      }
    }
    if (u === null) break;
    todo.delete(u);
    if (u === to) break;
    for (const [v, d] of adj.get(u) ?? []) {
      const nd = dist.get(u)! + d;
      if (nd < dist.get(v)!) {
        dist.set(v, nd);
        prev.set(v, u);
      }
    }
  }

  if ((dist.get(to) ?? Infinity) === Infinity) return [];
  const path = [to];
  while (path[0] !== from) {
    const p = prev.get(path[0]);
    if (p === undefined) return [];
    path.unshift(p);
  }
  return path;
}

/** The project's start place, or null. */
export function startPlace(project: Project): Place | null {
  return project.places.find((p) => p.role === "start") ?? null;
}

/** Nearest path-node id to a point, or null if there are no nodes. */
export function nearestNodeId(project: Project, x: number, y: number): string | null {
  const nodes = project.paths.nodes;
  if (nodes.length === 0) return null;
  let best = nodes[0];
  for (const n of nodes) {
    if (Math.hypot(x - n.x, y - n.y) < Math.hypot(x - best.x, y - best.y)) best = n;
  }
  return best.id;
}

/** A place's graph node: its explicit nodeId, else the nearest node (so unattached places still route). */
export function resolveNode(project: Project, place: Place): string | null {
  return place.nodeId ?? nearestNodeId(project, place.x, place.y);
}

/** Door-to-door route points from one place to another: start → via nodes → destination. */
export function routePoints(project: Project, fromId: string, toId: string): Point[] {
  const byId = new Map(project.places.map((p) => [p.id, p] as const));
  const a = byId.get(fromId);
  const b = byId.get(toId);
  if (!a || !b) return [];

  const an = resolveNode(project, a);
  const bn = resolveNode(project, b);
  if (an && bn) {
    const nodePath = shortestPath(project.paths, an, bn);
    if (nodePath.length) {
      const nmap = new Map(project.paths.nodes.map((n) => [n.id, n] as const));
      const mid = nodePath.map((id) => {
        const n = nmap.get(id)!;
        return { x: n.x, y: n.y };
      });
      return dedupe([{ x: a.x, y: a.y }, ...mid, { x: b.x, y: b.y }]);
    }
  }
  // Fallback only when there is no usable graph: a straight line between the places.
  return [{ x: a.x, y: a.y }, { x: b.x, y: b.y }];
}

/** Turn-by-turn steps generated from the node path geometry + optional road names. */
export function directions(project: Project, fromId: string, toId: string): Step[] {
  const byId = new Map(project.places.map((p) => [p.id, p] as const));
  const a = byId.get(fromId);
  const b = byId.get(toId);
  if (!a || !b) return [];

  const roadName = (x: string, y: string): string | undefined =>
    project.paths.roadNames?.[`${x}-${y}`] ?? project.paths.roadNames?.[`${y}-${x}`];

  const steps: Step[] = [{ kind: "start", text: `Start at ${a.name}` }];

  const an = resolveNode(project, a);
  const bn = resolveNode(project, b);
  if (an && bn) {
    const path = shortestPath(project.paths, an, bn);
    const nmap = new Map(project.paths.nodes.map((n) => [n.id, n] as const));
    if (path.length >= 2) {
      const rn = roadName(path[0], path[1]);
      steps.push({ kind: "straight", text: rn ? `Head along ${rn}` : "Head toward your destination" });
    }
    for (let i = 1; i < path.length - 1; i++) {
      const prev = nmap.get(path[i - 1])!, cur = nmap.get(path[i])!, next = nmap.get(path[i + 1])!;
      const ux = cur.x - prev.x, uy = cur.y - prev.y, vx = next.x - cur.x, vy = next.y - cur.y;
      const mag = Math.hypot(ux, uy) * Math.hypot(vx, vy) || 1;
      const cross = (ux * vy - uy * vx) / mag;
      if (Math.abs(cross) < 0.5) continue; // essentially straight
      const dir = cross > 0 ? "right" : "left";
      const rn = roadName(path[i], path[i + 1]);
      steps.push({ kind: dir, text: `Turn ${dir}${rn ? ` onto ${rn}` : ""}` });
    }
  }

  steps.push({ kind: "arrive", text: `Arrive at ${b.name}` });
  return steps;
}

function dedupe(points: Point[]): Point[] {
  return points.filter((p, i) => i === 0 || p.x !== points[i - 1].x || p.y !== points[i - 1].y);
}
