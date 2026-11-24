# Status

Read this first in every session (after CLAUDE.md). Updated at every checkpoint.

## Current stage
**Richer viewer DONE** (awaiting checkpoint). MVP + richer output complete.
Next: stalls/QR-images/pan-zoom · Stage 5 (one-click deploy) · polish · or wrap.

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
- **Stage 4 — `apps/editor`** (React + Vite + Zustand): the authoring SPA. Toolbar (name, tools,
  Load image / Sample / New / Import / Export / Preview / Publish); an SVG canvas to add/drag places,
  add/drag path nodes, and connect edges; an Inspector to edit a place (name/role/colour/attach-to-
  nearest-node/delete); a live **Check** panel driven by the schema's `lint()`; localStorage autosave.
  **Publish** validates (`safeParseProject`) then downloads the self-contained HTML (generator + the
  inlined viewer runtime via `?raw`). Verified in-browser: loaded the sample, added a place, saw the
  live lint warning, "Attach to nearest" cleared it → "Ready to publish". Full workspace check green.
  (Note: `Preview`/`Publish` trigger real downloads/`window.open(blob)`; the in-app browser pane
  doesn't surface those, but the identical generator path is proven in Stage 3.)
- **Richer viewer** (upgrades the published output): animated walker with progressive route reveal +
  camera framing (`camera.ts`, `walker.ts`), turn-by-turn `directions()` with a steps panel (uses
  `paths.roadNames`), a place **search** box, and **hash deep-links** — `#<place>` routes there,
  `#at-<place>` sets "you are here" (QR standees). Viewer lib rebuilt (12.6 KB). Verified in-browser:
  animated route to Main Stage, steps "Start → Head along the main path → Turn right onto the east
  path → Arrive", search, and `#at-cafe` → "You are here: Cafe". 24 tests green; the editor's Publish
  now emits these automatically.

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

## Open questions for the owner (checkpoint)
MVP + richer viewer are done (animated walk, directions, search, QR hash). Where next?
1. **Stalls + QR** — author stalls per place in the editor; render a stall directory + detail in the
   viewer; generate real QR-code images for the `#at-<place>` standees.
2. **Editor polish** — undo/redo, building/label tools, drag-to-pan/zoom, nicer icons.
3. **Stage 5 — one-click deploy** (Architecture B): publish straight to Netlify/GitHub Pages → a URL.
4. **Wrap here** — treat this as the milestone and write a short README/report.

## Next step
Owner's call on the direction above. (A build note: `apps/editor` inlines the viewer via `?raw` from
`packages/viewer/dist`, so run `npm run build -w @wayfinder/viewer` before building/publishing from the editor.)
