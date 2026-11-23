# Status

Read this first in every session (after CLAUDE.md). Updated at every checkpoint.

## Current stage
**Stage 1 — Schema DONE** (awaiting checkpoint). Architecture A locked; MVP scope confirmed.
Next: Stage 2 (viewer).

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

## Open questions for the owner (Stage-1 checkpoint)
1. Go on to **Stage 2 — the viewer**: a tiny vanilla-TS renderer that takes a `Project` and draws
   the map + places + a tappable route between them (the youthfest-style output, driven by the schema)?
2. (Still deferred to Stage 4) Editor stack — React (recommended) or vanilla/Svelte?

## Next step
On confirmation: **Stage 2 — `packages/viewer`** renders `sampleProject` into an interactive map
(image + place markers + shortest-path route on tap). Then Stage 3 (generator → self-contained HTML).
