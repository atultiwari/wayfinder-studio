import { z } from "zod";

/**
 * Wayfinder project schema — the single source of truth shared by the editor
 * (authoring) and the viewer (published output). Types are inferred from these
 * Zod schemas so there is one definition, validated at every boundary.
 *
 * Coordinates are in the venue image's own pixel space (0,0 = top-left).
 */

const hex = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "expected a hex colour like #2563EB");

/** A map image, inlined as a data URI (self-contained output) or referenced by URL. */
export const VenueSchema = z.object({
  name: z.string().min(1),
  image: z.string().min(1), // data: URI or http(s) URL
  width: z.number().positive(),
  height: z.number().positive(),
  north: z.number().optional(), // compass rotation in degrees
});

export const PlaceRole = z.enum(["start", "destination"]);

export const PlaceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  x: z.number(),
  y: z.number(),
  color: hex.optional(),
  icon: z.string().optional(),
  role: PlaceRole.default("destination"),
  /** The path node this place's door attaches to (for routing). */
  nodeId: z.string().optional(),
});

export const PathNodeSchema = z.object({
  id: z.string().min(1),
  x: z.number(),
  y: z.number(),
});

/** Undirected edge between two node ids. A missing edge = no route (e.g. a barricade). */
export const PathEdgeSchema = z.tuple([z.string().min(1), z.string().min(1)]);

export const PathsSchema = z.object({
  nodes: z.array(PathNodeSchema).default([]),
  edges: z.array(PathEdgeSchema).default([]),
  /** Optional friendly road names, keyed "<a>-<b>" (either direction). */
  roadNames: z.record(z.string()).optional(),
});

export const StallSchema = z.object({
  id: z.string().min(1),
  placeId: z.string().min(1),
  label: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().optional(),
  owner: z.string().optional(),
  position: z.string().optional(),
});

export const BuildingSchema = z.object({
  id: z.string().min(1),
  x: z.number(),
  y: z.number(),
  w: z.number().positive(),
  h: z.number().positive(),
  label: z.string().optional(),
});

export const LabelSchema = z.object({
  id: z.string().min(1),
  x: z.number(),
  y: z.number(),
  text: z.string().min(1),
  rotation: z.number().optional(),
});

export const ThemeSchema = z.object({
  head: hex.optional(),
  accent: hex.optional(),
  here: hex.optional(),
  route: hex.optional(),
  font: z.string().optional(),
  scheme: z.enum(["auto", "light", "dark"]).default("auto"),
});

export const QrSchema = z.object({
  /** Where the published viewer will live; standee links become `${baseUrl}#at-<placeId>`. */
  baseUrl: z.string().optional(),
  perPlace: z.boolean().default(false),
});

export const ProjectSchema = z
  .object({
    version: z.literal(1),
    id: z.string().min(1),
    name: z.string().min(1),
    venue: VenueSchema,
    places: z.array(PlaceSchema).default([]),
    paths: PathsSchema.default({ nodes: [], edges: [] }),
    stalls: z.array(StallSchema).optional(),
    buildings: z.array(BuildingSchema).optional(),
    labels: z.array(LabelSchema).optional(),
    theme: ThemeSchema.optional(),
    qr: QrSchema.optional(),
  })
  .superRefine((p, ctx) => {
    const dup = (xs: string[]): string[] => xs.filter((v, i) => xs.indexOf(v) !== i);

    for (const id of dup(p.places.map((x) => x.id))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["places"], message: `duplicate place id "${id}"` });
    }
    for (const id of dup(p.paths.nodes.map((n) => n.id))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["paths", "nodes"], message: `duplicate node id "${id}"` });
    }

    const nodeIds = new Set(p.paths.nodes.map((n) => n.id));
    p.paths.edges.forEach(([a, b], i) => {
      if (!nodeIds.has(a)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["paths", "edges", i, 0], message: `edge references unknown node "${a}"` });
      if (!nodeIds.has(b)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["paths", "edges", i, 1], message: `edge references unknown node "${b}"` });
    });

    p.places.forEach((pl, i) => {
      if (pl.nodeId && !nodeIds.has(pl.nodeId)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["places", i, "nodeId"], message: `place "${pl.id}" references unknown node "${pl.nodeId}"` });
      }
    });

    const placeIds = new Set(p.places.map((x) => x.id));
    (p.stalls ?? []).forEach((s, i) => {
      if (!placeIds.has(s.placeId)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["stalls", i, "placeId"], message: `stall "${s.id}" references unknown place "${s.placeId}"` });
      }
    });

    const starts = p.places.filter((x) => x.role === "start");
    if (starts.length > 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["places"], message: `expected at most one "start" place, found ${starts.length}` });
    }
  });

// Types inferred from the schemas (single source of truth).
export type Venue = z.infer<typeof VenueSchema>;
export type Place = z.infer<typeof PlaceSchema>;
export type PathNode = z.infer<typeof PathNodeSchema>;
export type PathEdge = z.infer<typeof PathEdgeSchema>;
export type Paths = z.infer<typeof PathsSchema>;
export type Stall = z.infer<typeof StallSchema>;
export type Building = z.infer<typeof BuildingSchema>;
export type Label = z.infer<typeof LabelSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type Qr = z.infer<typeof QrSchema>;
export type Project = z.infer<typeof ProjectSchema>;
