# Architecture — options & recommendation

> This answers the core question: *"It takes a map as input and creates a new ready-to-host
> webapp like youthfest. Can this be done from a webapp itself, or what are the options?"*

## The key insight (resolves the confusion)

The editor does **not** "turn into" the published map. There are **two separate programs that
share one data file**:

```
        ┌─────────────┐    edits     ┌──────────────┐
        │   EDITOR    │ ───────────► │   SCHEMA     │   (a JSON project file:
        │ (authoring) │ ◄─────────── │  (project)   │    venue image + places +
        └─────────────┘    loads     └──────────────┘    paths + stalls + …)
                                             │
                                   Publish / Generate
                                   (schema + image → HTML)
                                             ▼
                                     ┌──────────────┐
                                     │   VIEWER     │  ← the "youthfest" app:
                                     │ (published)  │    renders the map, routing,
                                     └──────────────┘    search, QR. Ready to host.
```

**"Publish" is just a pure function:** `viewerTemplate + projectJSON + mapImage → index.html`.
String/asset assembly like that runs fine in a browser — so **yes, a web app can generate a
ready-to-host web app**, and hand it to you as a download. No server is required for that.

Everything else (cloud save, one-click hosting, accounts) is *additive*, not foundational.

## Three publishing architectures

### A — Fully client-side, export a self-contained file  ★ recommended to start
- The whole editor runs in the browser. Projects live in `localStorage`/IndexedDB (exactly what
  the FCC Wayfinder PoC does — "Saved in this browser").
- **Publish = generate one self-contained `index.html`** (viewer JS + CSS + schema + the map
  image as a `data:` URI, all inlined) and offer it as a **download** (`Blob` + `<a download>`).
- You host that file **anywhere**: Netlify drop, GitHub Pages, S3, any static host — or open it
  offline. This is *exactly* the shape of the youthfest output (self-contained inline HTML).
- **Pros:** zero infra, zero cost, fully private (data never leaves the browser), works offline,
  portable. **Cons:** hosting is a manual drag-drop; no cloud projects; sharing a project to edit
  = sending the exported JSON.

### B — Client editor + one-click deploy integration
- Same editor + generator, but **Publish uploads** the generated site to a host via its API and
  returns a live URL.
- Hosts: Netlify (deploy a zip/files), GitHub (commit to a Pages repo), Cloudflare Pages, Vercel.
  Needs the user's token (OAuth, or paste a token). Can avoid your own backend entirely, or use a
  tiny serverless function to hold the OAuth secret.
- **Pros:** one click → shareable URL; can list/manage sites. **Cons:** auth/token handling; a
  little infra for OAuth.

### C — Full SaaS (editor + backend + database)
- Accounts, cloud-saved projects, collaboration, analytics, and **edit-after-publish** (the viewer
  fetches live data from an API/CDN instead of inlining it).
- **The youthfest output is NOT this** — it inlined its data and had no backend. Only go here if
  you want live updates, multi-user, or a product/business. Heaviest to build and run.

### Output structure — a separate sub-decision (independent of A/B/C)
1. **Self-contained single HTML** (data + image inlined) — most portable; the youthfest style.
   Larger file (image as data URI). *Best match to the goal "ready to host like youthfest".*
2. **Static shell + assets** (`index.html` + `data.json` + `image.png`) — cleaner/smaller; the
   viewer `fetch`es `data.json`. A folder instead of one file.
3. **Runtime API** — viewer fetches from a server (needs a backend; enables live post-publish edits).

## Recommendation

**Two apps + one schema; start with Architecture A + self-contained output; make Publish
pluggable so B can be added later without rework.**

- **Viewer** = a tiny, dependency-free renderer (like the youthfest rebuild) so the output stays
  small and hostable anywhere. It is the generator's template.
- **Editor** = a richer SPA (it isn't shipped to end users, so framework weight is fine).
- **Publish** = an interface with pluggable targets: `download` (MVP), later `netlify`, `github`.

Why: it matches the observed output, is useful with **zero infrastructure**, keeps everything
private, and is the fastest path to a working PoC. Cloud projects and one-click hosting are
features you bolt on, not architecture you must commit to now.

## Suggested data schema (starting point)

Mirrors what we observed in the youthfest output and the editor's tabs (Places / Paths / Stalls / QR):

```jsonc
Project {
  "venue":  { "name": "...", "image": "dataURI|url", "width": 1200, "height": 800, "north": 0 },
  "places": [ { "id": "entrance", "name": "Main entrance", "type": "start|destination",
                "x": 300, "y": 1000, "color": "#2563EB", "icon": "entry" } ],
  "paths":  { "nodes": [ { "id": "E", "x": 300, "y": 1000 } ],
              "edges": [ ["E","C"], ["C","J"] ],          // barricades = omitted edges
              "roadNames": { "E-C": "the walkway" } },
  "stalls": [ { "id": "ls-1a", "placeId": "commercial", "label": "LS 1A",
                "name": "...", "tagline": "...", "owner": "...", "position": "..." } ],
  "buildings": [ { "id": "b1", "x": 58, "y": 60, "w": 214, "h": 80, "label": "..." } ],
  "labels":    [ { "id": "l1", "x": 180, "y": 24, "text": "...", "rotation": 0 } ],
  "qr":    { "baseUrl": "https://host/app/", "perPlace": true },  // → #at-<placeId> standee links
  "theme": { "head": "#0B1E4F", "accent": "#F58A14", "font": "Inter", "scheme": "auto" }
}
```

This maps 1:1 onto the youthfest internals (`ZONES`/`EDGES`/`STALLS`) and the editor's tabs — so
the Viewer can be essentially the youthfest-style renderer driven by this schema instead of
hard-coded constants.

## Suggested tech (for whoever builds it)

- **Monorepo**: `packages/schema` (types + Zod validation), `packages/viewer` (the output
  renderer, tiny vanilla TS), `apps/editor` (the authoring SPA, e.g. Vite + React/Svelte).
- **Editor surface**: SVG or canvas with draggable markers, a path tool with snapping, undo/redo,
  localStorage/IndexedDB persistence, JSON import/export, a `Check` validator.
- **Generator**: `generate(project) → htmlString` — inlines viewer + schema + image; `download()`
  wraps it in a Blob. Publish targets implement a common interface.
- **QR**: for each place with `perPlace`, emit a QR encoding `${qr.baseUrl}#at-<placeId>`.

## Relationship to the youthfest-clone project

The separate `youthfest-clone` project (a black-box rebuild of the published output) is a useful
**reference for the Viewer's shape and behaviour**. We keep the two projects separate and design
this one from understanding — not by copying the editor's internals.
