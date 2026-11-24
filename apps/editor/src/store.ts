import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sampleProject, type Place, type Project, type Stall } from "@wayfinder/schema";

export type Tool = "select" | "place" | "node" | "edge";
export type Selection = { kind: "place" | "node"; id: string } | null;

const BLANK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>" +
  "<rect width='1200' height='800' fill='%23EEF1F4'/></svg>";

function blankProject(): Project {
  return {
    version: 1,
    id: "project-" + Date.now().toString(36),
    name: "Untitled map",
    venue: { name: "Untitled map", image: BLANK_IMAGE, width: 1200, height: 800 },
    places: [],
    paths: { nodes: [], edges: [] },
    theme: { scheme: "auto" },
  };
}

const freshId = (prefix: string, taken: Iterable<string>): string => {
  const set = new Set(taken);
  let i = 1;
  let id = `${prefix}${i}`;
  while (set.has(id)) id = `${prefix}${++i}`;
  return id;
};

const dist = (ax: number, ay: number, bx: number, by: number): number => Math.hypot(ax - bx, ay - by);

interface EditorState {
  project: Project;
  tool: Tool;
  selection: Selection;
  edgeFrom: string | null;

  setTool(tool: Tool): void;
  select(selection: Selection): void;
  setProjectName(name: string): void;

  addPlace(x: number, y: number): void;
  addNode(x: number, y: number): void;
  edgeClick(nodeId: string): void;
  moveItem(kind: "place" | "node", id: string, x: number, y: number): void;
  updatePlace(id: string, patch: Partial<Place>): void;
  attachToNearestNode(placeId: string): void;
  deleteSelected(): void;

  addStall(placeId: string): void;
  updateStall(id: string, patch: Partial<Stall>): void;
  deleteStall(id: string): void;
  setQrBaseUrl(url: string): void;

  setVenueImage(image: string, width: number, height: number): void;
  loadProject(project: Project): void;
  loadSample(): void;
  newProject(): void;
}

export const useEditor = create<EditorState>()(
  persist(
    (set, get) => ({
      project: blankProject(),
      tool: "select",
      selection: null,
      edgeFrom: null,

      setTool: (tool) => set({ tool, edgeFrom: null }),
      select: (selection) => set({ selection }),

      setProjectName: (name) =>
        set((s) => ({ project: { ...s.project, name, venue: { ...s.project.venue, name } } })),

      addPlace: (x, y) =>
        set((s) => {
          const id = freshId("place", s.project.places.map((p) => p.id));
          const role = s.project.places.some((p) => p.role === "start") ? "destination" : "start";
          const place: Place = { id, name: role === "start" ? "Entrance" : `Place ${s.project.places.length + 1}`, x: Math.round(x), y: Math.round(y), role };
          return { project: { ...s.project, places: [...s.project.places, place] }, selection: { kind: "place", id }, tool: "select" };
        }),

      addNode: (x, y) =>
        set((s) => {
          const id = freshId("n", s.project.paths.nodes.map((n) => n.id));
          return {
            project: { ...s.project, paths: { ...s.project.paths, nodes: [...s.project.paths.nodes, { id, x: Math.round(x), y: Math.round(y) }] } },
            selection: { kind: "node", id },
          };
        }),

      edgeClick: (nodeId) => {
        const { edgeFrom, project } = get();
        if (!edgeFrom) {
          set({ edgeFrom: nodeId });
          return;
        }
        if (edgeFrom === nodeId) {
          set({ edgeFrom: null });
          return;
        }
        const exists = project.paths.edges.some(
          ([a, b]) => (a === edgeFrom && b === nodeId) || (a === nodeId && b === edgeFrom),
        );
        set((s) => ({
          project: exists ? s.project : { ...s.project, paths: { ...s.project.paths, edges: [...s.project.paths.edges, [edgeFrom, nodeId] as [string, string]] } },
          edgeFrom: null,
        }));
      },

      moveItem: (kind, id, x, y) =>
        set((s) => {
          const rx = Math.round(x), ry = Math.round(y);
          if (kind === "place") {
            return { project: { ...s.project, places: s.project.places.map((p) => (p.id === id ? { ...p, x: rx, y: ry } : p)) } };
          }
          return { project: { ...s.project, paths: { ...s.project.paths, nodes: s.project.paths.nodes.map((n) => (n.id === id ? { ...n, x: rx, y: ry } : n)) } } };
        }),

      updatePlace: (id, patch) =>
        set((s) => ({ project: { ...s.project, places: s.project.places.map((p) => (p.id === id ? { ...p, ...patch } : p)) } })),

      attachToNearestNode: (placeId) =>
        set((s) => {
          const place = s.project.places.find((p) => p.id === placeId);
          const nodes = s.project.paths.nodes;
          if (!place || nodes.length === 0) return {};
          let best = nodes[0];
          for (const n of nodes) if (dist(place.x, place.y, n.x, n.y) < dist(place.x, place.y, best.x, best.y)) best = n;
          return { project: { ...s.project, places: s.project.places.map((p) => (p.id === placeId ? { ...p, nodeId: best.id } : p)) } };
        }),

      deleteSelected: () =>
        set((s) => {
          const sel = s.selection;
          if (!sel) return {};
          if (sel.kind === "place") {
            return { project: { ...s.project, places: s.project.places.filter((p) => p.id !== sel.id) }, selection: null };
          }
          return {
            project: {
              ...s.project,
              paths: {
                ...s.project.paths,
                nodes: s.project.paths.nodes.filter((n) => n.id !== sel.id),
                edges: s.project.paths.edges.filter(([a, b]) => a !== sel.id && b !== sel.id),
              },
              places: s.project.places.map((p) => (p.nodeId === sel.id ? { ...p, nodeId: undefined } : p)),
            },
            selection: null,
          };
        }),

      addStall: (placeId) =>
        set((s) => {
          const stalls = s.project.stalls ?? [];
          const id = freshId("stall", stalls.map((x) => x.id));
          const nth = stalls.filter((x) => x.placeId === placeId).length + 1;
          const stall: Stall = { id, placeId, label: String(nth), name: "New stall" };
          return { project: { ...s.project, stalls: [...stalls, stall] } };
        }),

      updateStall: (id, patch) =>
        set((s) => ({ project: { ...s.project, stalls: (s.project.stalls ?? []).map((x) => (x.id === id ? { ...x, ...patch } : x)) } })),

      deleteStall: (id) =>
        set((s) => ({ project: { ...s.project, stalls: (s.project.stalls ?? []).filter((x) => x.id !== id) } })),

      setQrBaseUrl: (url) =>
        set((s) => ({ project: { ...s.project, qr: { perPlace: s.project.qr?.perPlace ?? true, baseUrl: url } } })),

      setVenueImage: (image, width, height) =>
        set((s) => ({ project: { ...s.project, venue: { ...s.project.venue, image, width, height } } })),

      loadProject: (project) => set({ project, selection: null, edgeFrom: null }),
      loadSample: () => set({ project: structuredClone(sampleProject), selection: null, edgeFrom: null }),
      newProject: () => set({ project: blankProject(), selection: null, edgeFrom: null }),
    }),
    {
      name: "wayfinder-editor",
      partialize: (s) => ({ project: s.project }),
    },
  ),
);
