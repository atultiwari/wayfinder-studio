# Status

Read this first in every session (after CLAUDE.md). Updated at every checkpoint.

## Current stage
**Stage 0 — Decide.** Architecture, output shape and MVP scope are open.

## Done
- Project created, git initialised.
- CLAUDE.md (charter), docs/ARCHITECTURE.md (options + recommendation), this file, starter-prompt.md.

## The decision on the table
We are building a wayfinding-map **authoring tool** that produces a ready-to-host map webapp
(youthfest-style). Core model = **Editor + Viewer sharing one JSON schema**; Publish = a pure
function that assembles a self-contained `index.html`.

**Recommended:** Architecture **A** (fully client-side; Publish = export a self-contained HTML you
host anywhere), output shape = **self-contained single HTML**, with Publish built behind a pluggable
interface so one-click Netlify/GitHub deploy (**B**) can be added later. See docs/ARCHITECTURE.md.

## Open questions for the owner (Stage-0 checkpoint)
1. **Architecture:** A (client-side + export/download) ✓ recommended · B (+ one-click deploy) ·
   C (full SaaS with backend). Which do we target for the MVP?
2. **Output shape:** self-contained single HTML (recommended) · static shell + `data.json` · runtime API.
3. **Editor stack:** vanilla TS · React · Svelte (owner preference?).
4. **MVP scope:** smallest useful slice to prove the loop end-to-end? Proposed: load a venue image →
   drop a few places → draw a path → **Publish → self-contained HTML that routes between places**.
5. **Name:** is `wayfinder-studio` fine, or prefer another?

## Next step
On the owner's answers: Stage 1 — define `packages/schema` (types + Zod + a sample project), then
Stage 2 (viewer). Nothing is built until Stage 0 is confirmed.
