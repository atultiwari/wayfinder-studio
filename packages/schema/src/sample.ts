import { ProjectSchema, type Project } from "./schema";

// A clean, hand-drawn demo venue (self-contained SVG data URI). The walkways are drawn to match the
// irregular, meandering path graph exactly, so routes wander like real paths. Coloured place pins +
// the route are drawn on top by the viewer.
const WALK =
  "M600 720 L532 676 L608 632 L498 598 L560 540 L452 500 L548 470 L646 486 L712 432 L624 392 L690 336 L636 250 " +
  "M452 500 L352 452 M532 676 L430 700 M712 432 L800 392";
const SAMPLE_IMAGE =
  "data:image/svg+xml;utf8," +
  "<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' font-family='Inter, Segoe UI, sans-serif'>" +
  "<rect width='1200' height='800' fill='%23EEF2F6'/>" +
  "<g fill='%23DBEAD3'>" +
  "<rect x='60' y='95' width='330' height='150' rx='18'/><rect x='820' y='95' width='320' height='150' rx='18'/>" +
  "<rect x='60' y='630' width='300' height='140' rx='18'/><rect x='850' y='620' width='290' height='150' rx='18'/></g>" +
  `<path d='${WALK}' fill='none' stroke='%23CAD3DD' stroke-width='36' stroke-linecap='round' stroke-linejoin='round'/>` +
  `<path d='${WALK}' fill='none' stroke='%23F7FAFC' stroke-width='24' stroke-linecap='round' stroke-linejoin='round'/>` +
  "<g fill='%23E7E1D3' stroke='%23D6CDB8' stroke-width='2'>" +
  "<rect x='218' y='350' width='150' height='120' rx='12'/><rect x='860' y='245' width='150' height='120' rx='12'/>" +
  "<rect x='565' y='125' width='150' height='95' rx='12'/></g>" +
  "<rect x='883' y='262' width='104' height='46' rx='8' fill='%23C9CEDA'/>" +
  "<g fill='%23E2E6EC'><rect x='90' y='655' width='150' height='82' rx='10'/><rect x='980' y='645' width='150' height='82' rx='10'/>" +
  "<rect x='298' y='636' width='84' height='62' rx='10'/></g>" +
  "<g fill='%23BEDAB0'><circle cx='120' cy='300' r='14'/><circle cx='770' cy='140' r='13'/><circle cx='1090' cy='300' r='14'/>" +
  "<circle cx='150' cy='470' r='12'/><circle cx='1060' cy='470' r='13'/><circle cx='470' cy='730' r='12'/><circle cx='760' cy='700' r='14'/></g>" +
  "<g fill='%238A93A6' font-size='15' font-weight='600' text-anchor='middle'>" +
  "<text x='165' y='701'>Parking</text><text x='1055' y='691'>Restrooms</text></g>" +
  "<text x='40' y='56' font-size='30' font-weight='800' fill='%230B1E4F'>Green Park Fair</text>" +
  "<text x='41' y='80' font-size='14' fill='%235B6476'>A demo venue — made with Wayfinder Studio</text>" +
  "<g transform='translate(1120,72)'><circle r='24' fill='%23FFFFFF' stroke='%23CBD5E1' stroke-width='2'/>" +
  "<path d='M0 -13 L7 9 L0 3 L-7 9 Z' fill='%230B1E4F'/><text y='21' text-anchor='middle' font-size='11' fill='%235B6476'>N</text></g>" +
  "</svg>";

/**
 * A clean, realistic example: Main Gate (start) + Food Court, Main Stage, Art & Craft and Info Desk,
 * on an irregular, meandering walkway graph (so routes wander like real paths), with a few stalls.
 */
export const sampleProject: Project = ProjectSchema.parse({
  version: 1,
  id: "sample",
  name: "Green Park Fair",
  venue: { name: "Green Park Fair", image: SAMPLE_IMAGE, width: 1200, height: 800 },
  places: [
    { id: "entrance", name: "Main Gate", role: "start", x: 600, y: 758, nodeId: "g", color: "#E11D48", icon: "entry" },
    { id: "food", name: "Food Court", x: 288, y: 410, nodeId: "fw", color: "#EA580C", icon: "food" },
    { id: "stage", name: "Main Stage", x: 930, y: 300, nodeId: "es", color: "#4338CA", icon: "mainstage" },
    { id: "art", name: "Art & Craft", x: 640, y: 175, nodeId: "k11", color: "#0891B2", icon: "art" },
    { id: "info", name: "Info Desk", x: 338, y: 666, nodeId: "iw", color: "#16A34A", icon: "info" },
  ],
  paths: {
    nodes: [
      { id: "g", x: 600, y: 720 },
      { id: "k1", x: 532, y: 676 },
      { id: "k2", x: 608, y: 632 },
      { id: "k3", x: 498, y: 598 },
      { id: "k4", x: 560, y: 540 },
      { id: "k5", x: 452, y: 500 },
      { id: "k6", x: 548, y: 470 },
      { id: "k7", x: 646, y: 486 },
      { id: "k8", x: 712, y: 432 },
      { id: "k9", x: 624, y: 392 },
      { id: "k10", x: 690, y: 336 },
      { id: "k11", x: 636, y: 250 },
      { id: "fw", x: 352, y: 452 },
      { id: "iw", x: 430, y: 700 },
      { id: "es", x: 800, y: 392 },
    ],
    edges: [
      ["g", "k1"], ["k1", "k2"], ["k2", "k3"], ["k3", "k4"], ["k4", "k5"], ["k5", "k6"],
      ["k6", "k7"], ["k7", "k8"], ["k8", "k9"], ["k9", "k10"], ["k10", "k11"],
      ["k5", "fw"], ["k1", "iw"], ["k8", "es"],
    ],
    roadNames: {
      "g-k1": "the main path", "k1-k2": "the main path", "k2-k3": "the main path", "k3-k4": "the main path",
      "k4-k5": "the main path", "k5-k6": "the main path", "k6-k7": "the main path", "k7-k8": "the main path",
      "k8-k9": "the main path", "k9-k10": "the main path", "k10-k11": "the garden path",
      "k5-fw": "the food lane", "k1-iw": "the info lane", "k8-es": "the stage lane",
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
