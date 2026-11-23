import type { SafeParseReturnType } from "zod";
import { ProjectSchema, type Project } from "./schema";

/** Parse unknown input into a Project, throwing a ZodError on invalid data. */
export function parseProject(input: unknown): Project {
  return ProjectSchema.parse(input);
}

/** Non-throwing parse; inspect `.success` / `.error`. */
export function safeParseProject(input: unknown): SafeParseReturnType<unknown, Project> {
  return ProjectSchema.safeParse(input);
}

/**
 * Soft, human-readable warnings for the editor's "Check" tab. These are not hard
 * schema errors — they flag a project that is structurally valid but likely
 * incomplete (no start, unroutable places, etc). Input must already be a valid Project.
 */
export function lint(project: Project): string[] {
  const warnings: string[] = [];
  const { places, paths } = project;

  const start = places.find((p) => p.role === "start");
  if (!start) warnings.push("No start place is set — routing has no origin.");

  const hasPaths = paths.nodes.length > 0;
  if (hasPaths) {
    for (const p of places) {
      if (p.role === "destination" && !p.nodeId) {
        warnings.push(`Place "${p.name}" has no path node, so it can't be routed to.`);
      }
    }

    // Nodes with no edges are isolated.
    const touched = new Set<string>();
    for (const [a, b] of paths.edges) {
      touched.add(a);
      touched.add(b);
    }
    for (const n of paths.nodes) {
      if (!touched.has(n.id)) warnings.push(`Path node "${n.id}" is isolated (no edges).`);
    }

    // Reachability from the start's node.
    if (start?.nodeId) {
      const reachable = reachableFrom(start.nodeId, paths.edges);
      for (const p of places) {
        if (p.role === "destination" && p.nodeId && !reachable.has(p.nodeId)) {
          warnings.push(`Place "${p.name}" is not reachable from the start.`);
        }
      }
    }
  }

  return warnings;
}

function reachableFrom(startNode: string, edges: ReadonlyArray<readonly [string, string]>): Set<string> {
  const adj = new Map<string, string[]>();
  const add = (a: string, b: string): void => {
    const list = adj.get(a) ?? [];
    list.push(b);
    adj.set(a, list);
  };
  for (const [a, b] of edges) {
    add(a, b);
    add(b, a);
  }
  const seen = new Set<string>([startNode]);
  const queue = [startNode];
  while (queue.length) {
    const cur = queue.shift() as string;
    for (const next of adj.get(cur) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return seen;
}
