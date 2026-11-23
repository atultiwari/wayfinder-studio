# Status

Read this first in every session (after CLAUDE.md). Updated at every checkpoint.

## Current stage
**Stage 3 — Generator DONE — the MVP loop is PROVEN** (awaiting checkpoint).
Next: Stage 4 (the editor).

## Decisions locked
- **Architecture A** — fully client-side; **Publish = export a self-contained `index.html`** you
  host anywhere (Netlify drop / GitHub Pages / any static host). No backend. (Owner chose, 2026-11-24.)
- **Output shape:** self-contained single HTML (data + map image inlined) — the youthfest shape.
- **Publish is pluggable:** the download target is the MVP; Netlify/GitHub one-click (Arch B) can be
  added later without rework.
- **Model:** Editor + Viewer sharing one JSON schema (see docs/ARCHITECTURE.md).

## Done
- Project created, git initialised. CLAUDE.md, docs/ARCHITECTURE.md, this file, starter-prompt.md, README.
- **Stage 1 — `packages/schema`**: npm-workspaces monorepo + `@wayfinder/schema` (Zod schema,
  inferred TypeScript types, `parseProject`/`safeParseProject`, `lint()` soft-warnings, and a valid
  `sampleProject`). `npm run check` green (typecheck + 9 tests). Covers venue, places, paths
  (nodes/edges graph), stalls, buildings, labels, theme, qr — with referential-integrity validation.
- **Stage 2 — `packages/viewer`**: `mountViewer(root, project)` renders a Project into an interactive
  SVG map (venue image + place markers + "you are here" + tap-to-route via Dijkstra over the graph),
  self-contained themeable styles, keyboard accessible. Pure routing core (`shortestPath`/`routePoints`,
  7 tests). Also builds a single IIFE runtime (`vite build` → `dist/wayfinder-viewer.js`, global
  `WayfinderViewer`) for inlining.
- **Stage 3 — `tools/generator`**: `generateHtml(project, viewerRuntime)` assembles ONE self-contained
  HTML (viewer runtime + project JSON + image data-URI inlined; script-safe `<` escaping) + a browser
  `download()`. **MVP loop proven end-to-end:** built the viewer lib, generated a 7.3 KB `demo.html`
  from `sampleProject`, served it, and it rendered + routed (tap Cafe → entrance→junction→cafe) with
  **no external stylesheet or script** — host-anywhere, offline-capable. `npm run check` green across
  all three packages (22 tests).

## Recommended defaults (adjust at the checkpoint if wanted)
- **Viewer stack:** tiny vanilla TypeScript (keeps the published output small & dependency-free).
- **Editor stack:** React + Vite (richer editing UI; not shipped to end users). *Decide for real at Stage 4.*
- **Monorepo tooling:** npm workspaces.
- **Name:** `wayfinder-studio` (rename if preferred).

## MVP scope (proposed — confirm to start Stage 1)
The smallest slice that proves the whole loop end-to-end:
**load a venue image → drop a few places → draw a path between them → Publish → a downloaded,
self-contained `index.html` that renders the map and routes between places.**
(Stalls, QR, the animated walker, zoom, search come after the loop works.)

## Open questions for the owner (Stage-3 checkpoint)
1. Go on to **Stage 4 — the editor** (the authoring SPA): load a venue image, add/drag places, draw a
   path, then **Publish → download** the self-contained HTML (wiring the generator's `download()`).
   That completes the full authoring→publish loop a person can actually use.
2. **Editor stack — decide now:** React + Vite (recommended) · vanilla TS · Svelte?

## Next step
On confirmation: **Stage 4 — `apps/editor`** in the chosen stack: a canvas/SVG editing surface over
the venue image with place/path tools, localStorage persistence, JSON import/export, a Check panel
(uses `lint()`), and a Publish button wired to `download(generateHtml(project, runtime))`.
