import { describe, it, expect } from "vitest";
import { parseProject, safeParseProject, lint, sampleProject } from "../src/index";

// A raw, parseable project used as a base for building invalid/variant cases.
const base = {
  version: 1 as const,
  id: "t",
  name: "T",
  venue: { name: "T", image: "data:image/svg+xml;utf8,<svg/>", width: 100, height: 100 },
  places: [
    { id: "entrance", name: "Entrance", role: "start", x: 50, y: 90, nodeId: "E" },
    { id: "a", name: "A", x: 10, y: 10, nodeId: "L" },
  ],
  paths: {
    nodes: [
      { id: "E", x: 50, y: 90 },
      { id: "L", x: 10, y: 10 },
    ],
    edges: [["E", "L"]],
  },
};

/** Joined issue messages for an invalid input, or "" if it unexpectedly parsed. */
function errText(input: unknown): string {
  const r = safeParseProject(input);
  return r.success ? "" : r.error.issues.map((i) => i.message).join(" | ");
}

describe("sample project", () => {
  it("is valid and lint-clean", () => {
    expect(safeParseProject(sampleProject).success).toBe(true);
    expect(lint(sampleProject)).toEqual([]);
  });
});

describe("ProjectSchema validation", () => {
  it("accepts a well-formed project", () => {
    expect(safeParseProject(base).success).toBe(true);
  });

  it("rejects an edge that references an unknown node", () => {
    expect(errText({ ...base, paths: { ...base.paths, edges: [["E", "ghost"]] } })).toContain('unknown node "ghost"');
  });

  it("rejects duplicate place ids", () => {
    expect(errText({ ...base, places: [...base.places, { id: "a", name: "A2", x: 1, y: 1 }] })).toContain('duplicate place id "a"');
  });

  it("rejects more than one start place", () => {
    expect(errText({ ...base, places: [...base.places, { id: "b", name: "B", role: "start", x: 2, y: 2 }] })).toContain("at most one");
  });

  it("rejects a stall pointing at an unknown place", () => {
    expect(errText({ ...base, stalls: [{ id: "s1", placeId: "nope", label: "1", name: "Stall" }] })).toContain('unknown place "nope"');
  });

  it("applies defaults (role → destination)", () => {
    expect(parseProject(base).places[1].role).toBe("destination");
  });
});

describe("lint (soft warnings)", () => {
  it("warns when there is no start place", () => {
    const noStart = { ...base, places: base.places.map((p) => ({ ...p, role: "destination" })) };
    expect(lint(parseProject(noStart))).toContain("No start place is set — routing has no origin.");
  });

  it("warns about an unreachable destination and an isolated node", () => {
    const disconnected = {
      ...base,
      places: [...base.places, { id: "far", name: "Far", x: 99, y: 99, nodeId: "R" }],
      paths: { nodes: [...base.paths.nodes, { id: "R", x: 99, y: 99 }], edges: base.paths.edges },
    };
    const w = lint(parseProject(disconnected));
    expect(w).toContain('Place "Far" is not reachable from the start.');
    expect(w).toContain('Path node "R" is isolated (no edges).');
  });
});
