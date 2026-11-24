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
const HISTORY_LIMIT = 60;

interface History {
  past: Project[];
  future: Project[];
}

interface EditorState {
  project: Project;
  tool: Tool;
  selection: Selection;
  edgeFrom: string | null;
  history: History;

  setTool(tool: Tool): void;
  select(selection: Selection): void;
  setProjectName(name: string): void;

  /** Snapshot the current project for undo. `tag` coalesces rapid same-tag edits (typing). */
  checkpoint(tag?: string): void;
  undo(): void;
  redo(): void;

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

let lastTag = "";
let lastAt = 0;

export const useEditor = create<EditorState>()(
  persist(
    (set, get) => {
      const commit = (tag: string | undefined, next: (p: Project) => Project): void => {
        const now = Date.now();
        const coalesce = tag !== undefined && tag === lastTag && now - lastAt < 1200;
        lastTag = tag ?? "";
        lastAt = now;
        set((s) => ({
          project: next(s.project),
          history: coalesce ? s.history : { past: [...s.history.past, s.project].slice(-HISTORY_LIMIT), future: [] },
        }));
      };

      return {
        project: blankProject(),
        tool: "select",
        selection: null,
        edgeFrom: null,
        history: { past: [], future: [] },

        setTool: (tool) => set({ tool, edgeFrom: null }),
        select: (selection) => set({ selection }),

        setProjectName: (name) =>
          commit("name", (p) => ({ ...p, name, venue: { ...p.venue, name } })),

        checkpoint: (tag) => {
          const now = Date.now();
          if (tag !== undefined && tag === lastTag && now - lastAt < 1200) return;
          lastTag = tag ?? "";
          lastAt = now;
          set((s) => ({ history: { past: [...s.history.past, s.project].slice(-HISTORY_LIMIT), future: [] } }));
        },

        undo: () =>
          set((s) => {
            if (!s.history.past.length) return {};
            const past = s.history.past.slice();
            const prev = past.pop()!;
            lastTag = "";
            return { project: prev, history: { past, future: [s.project, ...s.history.future].slice(0, HISTORY_LIMIT) }, selection: null, edgeFrom: null };
          }),

        redo: () =>
          set((s) => {
            if (!s.history.future.length) return {};
            const [next, ...future] = s.history.future;
            lastTag = "";
            return { project: next, history: { past: [...s.history.past, s.project].slice(-HISTORY_LIMIT), future }, selection: null, edgeFrom: null };
          }),

        addPlace: (x, y) => {
          const s = get();
          const id = freshId("place", s.project.places.map((p) => p.id));
          const role = s.project.places.some((p) => p.role === "start") ? "destination" : "start";
          const place: Place = { id, name: role === "start" ? "Entrance" : `Place ${s.project.places.length + 1}`, x: Math.round(x), y: Math.round(y), role };
          commit(undefined, (p) => ({ ...p, places: [...p.places, place] }));
          set({ selection: { kind: "place", id }, tool: "select" });
        },

        addNode: (x, y) => {
          const s = get();
          const id = freshId("n", s.project.paths.nodes.map((n) => n.id));
          commit(undefined, (p) => ({ ...p, paths: { ...p.paths, nodes: [...p.paths.nodes, { id, x: Math.round(x), y: Math.round(y) }] } }));
          set({ selection: { kind: "node", id } });
        },

        edgeClick: (nodeId) => {
          const { edgeFrom, project } = get();
          if (!edgeFrom) return set({ edgeFrom: nodeId });
          if (edgeFrom === nodeId) return set({ edgeFrom: null });
          const exists = project.paths.edges.some(([a, b]) => (a === edgeFrom && b === nodeId) || (a === nodeId && b === edgeFrom));
          if (!exists) commit(undefined, (p) => ({ ...p, paths: { ...p.paths, edges: [...p.paths.edges, [edgeFrom, nodeId] as [string, string]] } }));
          set({ edgeFrom: null });
        },

        moveItem: (kind, id, x, y) => {
          const rx = Math.round(x), ry = Math.round(y);
          const tag = `move:${kind}:${id}`;
          commit(tag, (p) =>
            kind === "place"
              ? { ...p, places: p.places.map((pl) => (pl.id === id ? { ...pl, x: rx, y: ry } : pl)) }
              : { ...p, paths: { ...p.paths, nodes: p.paths.nodes.map((n) => (n.id === id ? { ...n, x: rx, y: ry } : n)) } },
          );
        },

        updatePlace: (id, patch) =>
          commit(`place:${id}:${Object.keys(patch).join(",")}`, (p) => ({ ...p, places: p.places.map((pl) => (pl.id === id ? { ...pl, ...patch } : pl)) })),

        attachToNearestNode: (placeId) => {
          const s = get();
          const place = s.project.places.find((p) => p.id === placeId);
          const nodes = s.project.paths.nodes;
          if (!place || nodes.length === 0) return;
          let best = nodes[0];
          for (const n of nodes) if (dist(place.x, place.y, n.x, n.y) < dist(place.x, place.y, best.x, best.y)) best = n;
          commit(undefined, (p) => ({ ...p, places: p.places.map((pl) => (pl.id === placeId ? { ...pl, nodeId: best.id } : pl)) }));
        },

        deleteSelected: () => {
          const sel = get().selection;
          if (!sel) return;
          if (sel.kind === "place") {
            commit(undefined, (p) => ({ ...p, places: p.places.filter((pl) => pl.id !== sel.id) }));
          } else {
            commit(undefined, (p) => ({
              ...p,
              paths: { ...p.paths, nodes: p.paths.nodes.filter((n) => n.id !== sel.id), edges: p.paths.edges.filter(([a, b]) => a !== sel.id && b !== sel.id) },
              places: p.places.map((pl) => (pl.nodeId === sel.id ? { ...pl, nodeId: undefined } : pl)),
            }));
          }
          set({ selection: null });
        },

        addStall: (placeId) => {
          const stalls = get().project.stalls ?? [];
          const id = freshId("stall", stalls.map((x) => x.id));
          const nth = stalls.filter((x) => x.placeId === placeId).length + 1;
          const stall: Stall = { id, placeId, label: String(nth), name: "New stall" };
          commit(undefined, (p) => ({ ...p, stalls: [...(p.stalls ?? []), stall] }));
        },

        updateStall: (id, patch) =>
          commit(`stall:${id}:${Object.keys(patch).join(",")}`, (p) => ({ ...p, stalls: (p.stalls ?? []).map((x) => (x.id === id ? { ...x, ...patch } : x)) })),

        deleteStall: (id) =>
          commit(undefined, (p) => ({ ...p, stalls: (p.stalls ?? []).filter((x) => x.id !== id) })),

        setQrBaseUrl: (url) =>
          commit("qrbase", (p) => ({ ...p, qr: { perPlace: p.qr?.perPlace ?? true, baseUrl: url } })),

        setVenueImage: (image, width, height) =>
          commit(undefined, (p) => ({ ...p, venue: { ...p.venue, image, width, height } })),

        loadProject: (project) => {
          get().checkpoint();
          set({ project, selection: null, edgeFrom: null });
        },
        loadSample: () => {
          get().checkpoint();
          set({ project: structuredClone(sampleProject), selection: null, edgeFrom: null });
        },
        newProject: () => {
          get().checkpoint();
          set({ project: blankProject(), selection: null, edgeFrom: null });
        },
      };
    },
    {
      name: "wayfinder-editor",
      partialize: (s) => ({ project: s.project }),
    },
  ),
);
