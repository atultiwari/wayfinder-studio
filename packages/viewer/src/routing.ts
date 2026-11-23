import type { Paths, Place, Project } from "@wayfinder/schema";

export interface Point {
  x: number;
  y: number;
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

/** Door-to-door route points from one place to another: start → via nodes → destination. */
export function routePoints(project: Project, fromId: string, toId: string): Point[] {
  const byId = new Map(project.places.map((p) => [p.id, p] as const));
  const a = byId.get(fromId);
  const b = byId.get(toId);
  if (!a || !b) return [];

  if (a.nodeId && b.nodeId) {
    const nodePath = shortestPath(project.paths, a.nodeId, b.nodeId);
    if (nodePath.length) {
      const nmap = new Map(project.paths.nodes.map((n) => [n.id, n] as const));
      const mid = nodePath.map((id) => {
        const n = nmap.get(id)!;
        return { x: n.x, y: n.y };
      });
      return dedupe([{ x: a.x, y: a.y }, ...mid, { x: b.x, y: b.y }]);
    }
  }
  // Fallback: straight line between the two places.
  return [{ x: a.x, y: a.y }, { x: b.x, y: b.y }];
}

function dedupe(points: Point[]): Point[] {
  return points.filter((p, i) => i === 0 || p.x !== points[i - 1].x || p.y !== points[i - 1].y);
}
