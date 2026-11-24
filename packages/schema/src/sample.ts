import { ProjectSchema, type Project } from "./schema";

// A clean, hand-drawn demo venue (self-contained SVG data URI). The walkways are drawn to match the
// winding path graph exactly, so routes bend the way real paths do. Coloured place pins + the route
// are drawn on top by the viewer.
const WALK = "M600 720 L470 650 L640 585 L470 520 L660 460 L500 400 L680 360 L560 290 L640 220 M500 400 L330 430 M470 650 L350 640 M680 360 L820 330";
const SAMPLE_IMAGE =
  "data:image/svg+xml;utf8," +
  "<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' font-family='Inter, Segoe UI, sans-serif'>" +
  "<rect width='1200' height='800' fill='%23EEF2F6'/>" +
  "<g fill='%23DBEAD3'>" +
  "<rect x='60' y='95' width='340' height='150' rx='18'/><rect x='820' y='95' width='320' height='150' rx='18'/>" +
  "<rect x='60' y='635' width='320' height='135' rx='18'/><rect x='840' y='620' width='300' height='150' rx='18'/></g>" +
  `<path d='${WALK}' fill='none' stroke='%23CAD3DD' stroke-width='36' stroke-linecap='round' stroke-linejoin='round'/>` +
  `<path d='${WALK}' fill='none' stroke='%23F7FAFC' stroke-width='24' stroke-linecap='round' stroke-linejoin='round'/>` +
  "<g fill='%23E7E1D3' stroke='%23D6CDB8' stroke-width='2'>" +
  "<rect x='220' y='320' width='150' height='120' rx='12'/><rect x='865' y='245' width='150' height='120' rx='12'/>" +
  "<rect x='585' y='100' width='150' height='95' rx='12'/></g>" +
  "<rect x='888' y='262' width='104' height='46' rx='8' fill='%23C9CEDA'/>" +
  "<g fill='%23E2E6EC'><rect x='90' y='660' width='150' height='82' rx='10'/><rect x='980' y='645' width='150' height='82' rx='10'/>" +
  "<rect x='258' y='568' width='86' height='64' rx='10'/></g>" +
  "<g fill='%23BEDAB0'><circle cx='120' cy='300' r='14'/><circle cx='760' cy='140' r='13'/><circle cx='1090' cy='300' r='14'/>" +
  "<circle cx='150' cy='470' r='12'/><circle cx='1060' cy='470' r='13'/><circle cx='430' cy='720' r='12'/><circle cx='720' cy='690' r='14'/></g>" +
  "<g fill='%238A93A6' font-size='15' font-weight='600' text-anchor='middle'>" +
  "<text x='165' y='706'>Parking</text><text x='1055' y='691'>Restrooms</text></g>" +
  "<text x='40' y='56' font-size='30' font-weight='800' fill='%230B1E4F'>Green Park Fair</text>" +
  "<text x='41' y='80' font-size='14' fill='%235B6476'>A demo venue — made with Wayfinder Studio</text>" +
  "<g transform='translate(1120,72)'><circle r='24' fill='%23FFFFFF' stroke='%23CBD5E1' stroke-width='2'/>" +
  "<path d='M0 -13 L7 9 L0 3 L-7 9 Z' fill='%230B1E4F'/><text y='21' text-anchor='middle' font-size='11' fill='%235B6476'>N</text></g>" +
  "</svg>";

/**
 * A clean, realistic example: Main Gate (start) + Food Court, Main Stage, Art & Craft and Info Desk,
 * on a winding, branching walkway graph (so routes zig-zag like real paths), with a few stalls.
 */
export const sampleProject: Project = ProjectSchema.parse({
  version: 1,
  id: "sample",
  name: "Green Park Fair",
  venue: { name: "Green Park Fair", image: SAMPLE_IMAGE, width: 1200, height: 800 },
  places: [
    { id: "entrance", name: "Main Gate", role: "start", x: 600, y: 758, nodeId: "g", color: "#E11D48", icon: "entry" },
    { id: "food", name: "Food Court", x: 285, y: 380, nodeId: "fw", color: "#EA580C", icon: "food" },
    { id: "stage", name: "Main Stage", x: 930, y: 300, nodeId: "es", color: "#4338CA", icon: "mainstage" },
    { id: "art", name: "Art & Craft", x: 660, y: 150, nodeId: "n8", color: "#0891B2", icon: "art" },
    { id: "info", name: "Info Desk", x: 300, y: 600, nodeId: "iw", color: "#16A34A", icon: "info" },
  ],
  paths: {
    nodes: [
      { id: "g", x: 600, y: 720 },
      { id: "n1", x: 470, y: 650 },
      { id: "n2", x: 640, y: 585 },
      { id: "n3", x: 470, y: 520 },
      { id: "n4", x: 660, y: 460 },
      { id: "n5", x: 500, y: 400 },
      { id: "n6", x: 680, y: 360 },
      { id: "n7", x: 560, y: 290 },
      { id: "n8", x: 640, y: 220 },
      { id: "fw", x: 330, y: 430 },
      { id: "iw", x: 350, y: 640 },
      { id: "es", x: 820, y: 330 },
    ],
    edges: [
      ["g", "n1"], ["n1", "n2"], ["n2", "n3"], ["n3", "n4"], ["n4", "n5"],
      ["n5", "n6"], ["n6", "n7"], ["n7", "n8"], ["n5", "fw"], ["n1", "iw"], ["n6", "es"],
    ],
    roadNames: {
      "g-n1": "the main path", "n1-n2": "the main path", "n2-n3": "the main path",
      "n3-n4": "the main path", "n4-n5": "the main path", "n5-n6": "the main path",
      "n6-n7": "the main path", "n7-n8": "the garden path",
      "n5-fw": "the food lane", "n1-iw": "the info lane", "n6-es": "the stage lane",
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
