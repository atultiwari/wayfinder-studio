import { describe, it, expect } from "vitest";
import { sampleProject, type Paths } from "@wayfinder/schema";
import { shortestPath, routePoints, startPlace, directions } from "../src/routing";

const paths: Paths = sampleProject.paths;

describe("shortestPath", () => {
  it("returns a single node for identical endpoints", () => {
    expect(shortestPath(paths, "g", "g")).toEqual(["g"]);
  });
  it("routes gate → food via the mid + central nodes", () => {
    expect(shortestPath(paths, "g", "w")).toEqual(["g", "m", "c", "w"]);
  });
  it("routes gate → stage via the central node", () => {
    expect(shortestPath(paths, "g", "e")).toEqual(["g", "m", "c", "e"]);
  });
  it("returns [] for unknown or unreachable nodes", () => {
    expect(shortestPath(paths, "g", "ghost")).toEqual([]);
    const isolated: Paths = { nodes: [...paths.nodes, { id: "X", x: 0, y: 0 }], edges: paths.edges };
    expect(shortestPath(isolated, "g", "X")).toEqual([]);
  });
});

describe("routePoints", () => {
  it("builds door-to-door points through the graph", () => {
    const pts = routePoints(sampleProject, "entrance", "stage");
    expect(pts.length).toBeGreaterThan(2);
    expect(pts[0]).toEqual({ x: 600, y: 735 }); // start place (door)
    expect(pts.at(-1)).toEqual({ x: 900, y: 300 }); // destination place (door)
    expect(pts).toContainEqual({ x: 600, y: 400 }); // central junction node is on the route
  });
  it("returns [] for an unknown place", () => {
    expect(routePoints(sampleProject, "entrance", "nope")).toEqual([]);
  });
});

describe("unattached places snap to the nearest node (bug fix)", () => {
  // Reproduces the exported-file bug: the start place had no nodeId, so routing fell back to a
  // straight line. It should instead snap the start to its nearest node and follow the graph.
  const unattached = {
    ...sampleProject,
    places: sampleProject.places.map((p) => (p.role === "start" ? { ...p, nodeId: undefined } : p)),
  };

  it("routes through the graph, not a straight line", () => {
    const pts = routePoints(unattached, "entrance", "stage");
    expect(pts.length).toBeGreaterThan(2);
    expect(pts).toContainEqual({ x: 600, y: 400 }); // the junction node is on the route
  });

  it("still produces turn-by-turn steps", () => {
    const steps = directions(unattached, "entrance", "stage");
    expect(steps.some((s) => s.kind === "left" || s.kind === "right")).toBe(true);
  });
});

describe("directions", () => {
  it("starts at the start, turns, and arrives (with road names)", () => {
    const steps = directions(sampleProject, "entrance", "stage");
    expect(steps[0]).toEqual({ kind: "start", text: "Start at Main Gate" });
    expect(steps.at(-1)).toEqual({ kind: "arrive", text: "Arrive at Main Stage" });
    expect(steps.some((s) => s.kind === "right" && s.text === "Turn right onto the east walk")).toBe(true);
    expect(steps.some((s) => s.text === "Head along the main path")).toBe(true);
  });
  it("turns the other way toward the food court", () => {
    const steps = directions(sampleProject, "entrance", "food");
    expect(steps.some((s) => s.kind === "left" && s.text === "Turn left onto the west walk")).toBe(true);
    expect(steps.at(-1)).toEqual({ kind: "arrive", text: "Arrive at Food Court" });
  });
});

describe("startPlace", () => {
  it("finds the start", () => {
    expect(startPlace(sampleProject)?.id).toBe("entrance");
  });
});
