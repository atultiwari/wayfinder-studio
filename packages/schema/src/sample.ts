import { ProjectSchema, type Project } from "./schema";

// A clean, hand-drawn demo venue (self-contained SVG data URI): lawns, two walkways that match
// the path graph, a few pavilions/buildings, trees, a title and a north arrow. The coloured place
// pins + routing are drawn on top by the viewer.
const SAMPLE_IMAGE =
  "data:image/svg+xml;utf8," +
  "<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' font-family='Inter, Segoe UI, sans-serif'>" +
  "<rect width='1200' height='800' fill='%23EEF2F6'/>" +
  "<g fill='%23DBEAD3'>" +
  "<rect x='70' y='120' width='430' height='250' rx='18'/><rect x='700' y='120' width='430' height='250' rx='18'/>" +
  "<rect x='70' y='440' width='360' height='290' rx='18'/><rect x='770' y='440' width='360' height='290' rx='18'/></g>" +
  "<g stroke='%23CAD3DD' stroke-width='40' stroke-linecap='round'><path d='M600 740 V170' fill='none'/><path d='M310 400 H890' fill='none'/></g>" +
  "<g stroke='%23F7FAFC' stroke-width='28' stroke-linecap='round'><path d='M600 740 V170' fill='none'/><path d='M310 400 H890' fill='none'/></g>" +
  "<g fill='%23E7E1D3' stroke='%23D6CDB8' stroke-width='2'>" +
  "<rect x='205' y='235' width='200' height='130' rx='12'/><rect x='795' y='235' width='200' height='130' rx='12'/>" +
  "<rect x='505' y='95' width='190' height='120' rx='12'/></g>" +
  "<rect x='818' y='250' width='154' height='52' rx='8' fill='%23C9CEDA'/>" +
  "<g fill='%23E2E6EC'><rect x='110' y='470' width='150' height='90' rx='10'/><rect x='940' y='470' width='150' height='90' rx='10'/>" +
  "<rect x='372' y='512' width='86' height='66' rx='10'/></g>" +
  "<g fill='%23BEDAB0'><circle cx='140' cy='165' r='14'/><circle cx='470' cy='150' r='12'/><circle cx='745' cy='150' r='13'/>" +
  "<circle cx='1075' cy='170' r='14'/><circle cx='150' cy='690' r='15'/><circle cx='1055' cy='690' r='14'/><circle cx='470' cy='700' r='12'/></g>" +
  "<g fill='%238A93A6' font-size='15' font-weight='600' text-anchor='middle'>" +
  "<text x='185' y='522'>Parking</text><text x='1015' y='522'>Restrooms</text>" +
  "<text x='260' y='640'>Lawn</text><text x='950' y='640'>Lawn</text></g>" +
  "<text x='40' y='56' font-size='30' font-weight='800' fill='%230B1E4F'>Green Park Fair</text>" +
  "<text x='41' y='80' font-size='14' fill='%235B6476'>A demo venue — made with Wayfinder Studio</text>" +
  "<g transform='translate(1120,72)'><circle r='24' fill='%23FFFFFF' stroke='%23CBD5E1' stroke-width='2'/>" +
  "<path d='M0 -13 L7 9 L0 3 L-7 9 Z' fill='%230B1E4F'/><text y='21' text-anchor='middle' font-size='11' fill='%235B6476'>N</text></g>" +
  "</svg>";

/**
 * A clean, realistic example: Main Gate (start) + Food Court, Main Stage, Art & Craft and Info Desk,
 * on a 6-node walkway graph, with a few stalls. All places are attached to nodes and lint-clean.
 */
export const sampleProject: Project = ProjectSchema.parse({
  version: 1,
  id: "sample",
  name: "Green Park Fair",
  venue: { name: "Green Park Fair", image: SAMPLE_IMAGE, width: 1200, height: 800 },
  places: [
    { id: "entrance", name: "Main Gate", role: "start", x: 600, y: 735, nodeId: "g", color: "#E11D48", icon: "entry" },
    { id: "food", name: "Food Court", x: 300, y: 300, nodeId: "w", color: "#EA580C", icon: "food" },
    { id: "stage", name: "Main Stage", x: 900, y: 300, nodeId: "e", color: "#4338CA", icon: "mainstage" },
    { id: "art", name: "Art & Craft", x: 600, y: 165, nodeId: "n", color: "#0891B2", icon: "art" },
    { id: "info", name: "Info Desk", x: 415, y: 545, nodeId: "m", color: "#16A34A", icon: "info" },
  ],
  paths: {
    nodes: [
      { id: "g", x: 600, y: 690 },
      { id: "m", x: 600, y: 545 },
      { id: "c", x: 600, y: 400 },
      { id: "w", x: 330, y: 400 },
      { id: "e", x: 870, y: 400 },
      { id: "n", x: 600, y: 210 },
    ],
    edges: [
      ["g", "m"],
      ["m", "c"],
      ["c", "w"],
      ["c", "e"],
      ["c", "n"],
    ],
    roadNames: {
      "g-m": "the main path",
      "m-c": "the main path",
      "c-w": "the west walk",
      "c-e": "the east walk",
      "c-n": "the garden walk",
    },
  },
  stalls: [
    { id: "f1", placeId: "food", label: "1", name: "Chaat & Pani Puri", tagline: "Street snacks", owner: "Meera" },
    { id: "f2", placeId: "food", label: "2", name: "Coffee Cart" },
    { id: "f3", placeId: "food", label: "3", name: "Ice Cream Co.", tagline: "Scoops & sundaes" },
    { id: "a1", placeId: "art", label: "A", name: "Pottery Studio", owner: "Ravi" },
    { id: "a2", placeId: "art", label: "B", name: "Canvas Corner", tagline: "Live painting" },
  ],
  theme: { head: "#0B1E4F", accent: "#F58A14", scheme: "auto" },
});
