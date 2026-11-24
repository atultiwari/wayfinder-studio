import { describe, it, expect } from "vitest";
import { sampleProject, type Paths } from "@wayfinder/schema";
import { shortestPath, routePoints, startPlace, directions } from "../src/routing";

const paths: Paths = sampleProject.paths;

describe("shortestPath", () => {
  it("returns a single node for identical endpoints", () => {
    expect(shortestPath(paths, "E", "E")).toEqual(["E"]);
  });
  it("routes E → L via the junction", () => {
    expect(shortestPath(paths, "E", "L")).toEqual(["E", "J", "L"]);
  });
  it("routes E → R via the junction", () => {
    expect(shortestPath(paths, "E", "R")).toEqual(["E", "J", "R"]);
  });
  it("returns [] for unknown or unreachable nodes", () => {
    expect(shortestPath(paths, "E", "ghost")).toEqual([]);
    const isolated: Paths = { nodes: [...paths.nodes, { id: "X", x: 0, y: 0 }], edges: paths.edges };
    expect(shortestPath(isolated, "E", "X")).toEqual([]);
  });
});

describe("routePoints", () => {
  it("builds door-to-door points start → nodes → destination", () => {
    const pts = routePoints(sampleProject, "entrance", "stage");
    // entrance(600,780) → E(600,760) → J(600,400) → R(900,400) → stage(900,360)
    expect(pts).toEqual([
      { x: 600, y: 780 },
      { x: 600, y: 760 },
      { x: 600, y: 400 },
      { x: 900, y: 400 },
      { x: 900, y: 360 },
    ]);
  });
  it("returns [] for an unknown place", () => {
    expect(routePoints(sampleProject, "entrance", "nope")).toEqual([]);
  });
});

describe("startPlace", () => {
  it("finds the start", () => {
    expect(startPlace(sampleProject)?.id).toBe("entrance");
  });
});

describe("directions", () => {
  it("generates start → head → turn → arrive with road names", () => {
    const steps = directions(sampleProject, "entrance", "stage").map((s) => `${s.kind}:${s.text}`);
    expect(steps).toEqual([
      "start:Start at Main Entrance",
      "straight:Head along the main path",
      "right:Turn right onto the east path",
      "arrive:Arrive at Main Stage",
    ]);
  });
  it("turns the other way toward the cafe", () => {
    const steps = directions(sampleProject, "entrance", "cafe");
    expect(steps.find((s) => s.kind === "left")?.text).toBe("Turn left onto the west path");
    expect(steps.at(-1)).toEqual({ kind: "arrive", text: "Arrive at Cafe" });
  });
});
