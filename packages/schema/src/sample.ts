import { ProjectSchema, type Project } from "./schema";

// A tiny self-contained placeholder map so the sample is fully valid on its own.
const SAMPLE_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>" +
  "<rect width='1200' height='800' fill='%23EEE7D8'/>" +
  "<text x='600' y='410' font-size='44' text-anchor='middle' fill='%23A3ABBC' font-family='sans-serif'>Sample Venue</text></svg>";

/** A minimal, valid example project: one start + two destinations on a 4-node path graph. */
export const sampleProject: Project = ProjectSchema.parse({
  version: 1,
  id: "sample",
  name: "Sample Venue",
  venue: { name: "Sample Venue", image: SAMPLE_IMAGE, width: 1200, height: 800 },
  places: [
    { id: "entrance", name: "Main Entrance", role: "start", x: 600, y: 780, nodeId: "E", color: "#334155", icon: "entry" },
    { id: "cafe", name: "Cafe", x: 300, y: 360, nodeId: "L", color: "#EA580C", icon: "food" },
    { id: "stage", name: "Main Stage", x: 900, y: 360, nodeId: "R", color: "#4338CA", icon: "mainstage" },
  ],
  paths: {
    nodes: [
      { id: "E", x: 600, y: 760 },
      { id: "J", x: 600, y: 400 },
      { id: "L", x: 300, y: 400 },
      { id: "R", x: 900, y: 400 },
    ],
    edges: [
      ["E", "J"],
      ["J", "L"],
      ["J", "R"],
    ],
    roadNames: { "E-J": "the main path", "J-L": "the west path", "J-R": "the east path" },
  },
  stalls: [
    { id: "s1", placeId: "cafe", label: "1", name: "Espresso Bar", tagline: "Coffee & fresh pastries", owner: "Priya" },
    { id: "s2", placeId: "cafe", label: "2", name: "Chaat Corner", tagline: "Street snacks" },
    { id: "s3", placeId: "stage", label: "A", name: "Merch Booth", position: "Stage left" },
  ],
  theme: { head: "#0B1E4F", accent: "#F58A14", scheme: "auto" },
  qr: { baseUrl: "https://example.com/map/", perPlace: true },
});
