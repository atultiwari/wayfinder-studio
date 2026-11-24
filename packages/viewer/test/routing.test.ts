import { describe, it, expect } from "vitest";
import { sampleProject, type Paths } from "@wayfinder/schema";
import { shortestPath, routePoints, startPlace, directions } from "../src/routing";

const paths: Paths = sampleProject.paths;
const start = startPlace(sampleProject)!;
const turns = (fromId: string, toId: string) =>
  directions(sampleProject, fromId, toId).filter((s) => s.kind === "left" || s.kind === "right");

describe("shortestPath", () => {
  it("returns a single node for identical endpoints", () => {
    expect(shortestPath(paths, "g", "g")).toEqual(["g"]);
  });
  it("routes between connected nodes, keeping the endpoints", () => {
    const p = shortestPath(paths, "g", "k11");
    expect(p[0]).toBe("g");
    expect(p.at(-1)).toBe("k11");
    expect(p.length).toBeGreaterThan(2);
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
    expect(pts[0]).toEqual({ x: start.x, y: start.y });
    expect(pts.at(-1)).toEqual({ x: 930, y: 300 });
    expect(pts.length).toBeGreaterThan(2);
  });
  it("returns [] for an unknown place", () => {
    expect(routePoints(sampleProject, "entrance", "nope")).toEqual([]);
  });
});

describe("unattached places snap to the nearest node (bug fix)", () => {
  // Reproduces the exported-file bug: the start had no nodeId, so routing fell back to a straight
  // line. It should snap the start to its nearest node and follow the (winding) graph instead.
  const unattached = {
    ...sampleProject,
    places: sampleProject.places.map((p) => (p.role === "start" ? { ...p, nodeId: undefined } : p)),
  };
  it("routes through the graph, not a straight line", () => {
    const pts = routePoints(unattached, "entrance", "stage");
    expect(pts.length).toBeGreaterThan(3);
    expect(pts).toContainEqual({ x: 600, y: 720 }); // snapped to nearest node "g"
  });
});

describe("directions", () => {
  it("starts at the start and arrives at the destination", () => {
    const steps = directions(sampleProject, "entrance", "stage");
    expect(steps[0]).toEqual({ kind: "start", text: "Start at Main Gate" });
    expect(steps.at(-1)).toEqual({ kind: "arrive", text: "Arrive at Main Stage" });
  });
  it("produces multiple turns on the winding route (zig-zag)", () => {
    expect(turns("entrance", "stage").length).toBeGreaterThanOrEqual(2);
  });
  it("names roads from paths.roadNames", () => {
    const text = directions(sampleProject, "entrance", "stage").map((s) => s.text).join(" | ");
    expect(text).toContain("the main path");
  });
  it("routes to the food court and arrives there", () => {
    expect(directions(sampleProject, "entrance", "food").at(-1)).toEqual({ kind: "arrive", text: "Arrive at Food Court" });
  });
});
