# Wayfinder Studio

Read this file at the start of every session, then read docs/STATUS.md and carry on from where it
says.

## What this project is

An **authoring tool** (editor) that lets someone create a **ready-to-host wayfinding map webapp**
for any venue or event — the kind of interactive map where visitors search for or tap a
destination and get an animated walking route, a stall directory, and per-place QR codes. The
published output is a self-contained static site like `https://youthfest.netlify.app/`.

This came out of studying a published wayfinding map (youthfest) and a screenshot of a PoC editor
("FCC Wayfinder"). We are **not** copying that editor's code — we design fresh from understanding.

## The core model (read docs/ARCHITECTURE.md for the full reasoning)

Two programs that share one JSON schema:

- **Editor** — a browser app to build/edit a project (the map image + places + paths + stalls + …).
- **Viewer** — the published end-user map app (what "youthfest" is): renders the map, routing,
  search, QR. Small and dependency-free so it can be hosted anywhere.
- **Publish / Generate** — a pure function `viewerTemplate + projectJSON + image → index.html`.

"Can a webapp generate a ready-to-host webapp?" **Yes** — generating the output is just string/asset
assembly, which runs in the browser and can be handed to the user as a download. A backend is only
needed for *one-click hosting*, *cloud projects*, or *live post-publish edits* — all optional.

## Architecture (LOCKED — see STATUS.md)

- **Two apps + one schema.**
- **Architecture A** (chosen) — fully client-side; **Publish exports a self-contained `index.html`**,
  with the Publish step behind a pluggable interface so **B** (one-click Netlify/GitHub deploy) can be
  added later.
- Output shape = **self-contained single HTML** (data + image inlined).
- **Viewer** = tiny vanilla-TS renderer (youthfest-style). **Editor** = richer SPA (stack decided at Stage 4).

Do not start building until the MVP **scope** is confirmed at the Stage-0 checkpoint (see STATUS.md).

## How we work: stages with checkpoints

Mirror the workflow the owner likes: work in stages, each ending at a **checkpoint** —
1. update docs/STATUS.md (done / found / uncertain / next);
2. stop and give a short summary + the decision for the next stage.

Proposed stages:
- **Stage 0 — Decide** architecture (A/B/C) + output shape + MVP scope. *(current)*
- **Stage 1 — Schema**: define `packages/schema` (types + Zod validation) + a sample project.
- **Stage 2 — Viewer**: the renderer that turns a schema into the interactive map (routing, search,
  QR), hostable standalone. (The youthfest-clone rebuild is a behaviour reference.)
- **Stage 3 — Generator**: `generate(project) → html` + `download()`; a self-contained output.
- **Stage 4 — Editor**: the authoring SPA (place/path/stall/label tools, import/export, check).
- **Stage 5 — Publish targets**: download (MVP), then optional Netlify/GitHub one-click.
- **Stage 6 — Polish & docs**.

## Engineering rules (owner's standard)

- Small, focused files (200–400 lines typical, 800 max); organise by feature.
- Immutability (new objects, no mutation); explicit error handling; validate input at boundaries
  (Zod). Avoid `any`; type public APIs.
- Tests for every feature; a `check` script (lint + typecheck + tests + build) must pass before any
  commit. Target 80%+ coverage.
- Conventional commits: `<type>: <description>` (feat, fix, refactor, docs, test, chore).
- No secrets in the repo, ever. Publish tokens (Netlify/GitHub) are supplied at runtime by the user,
  never committed.
- Nothing is published to a public host without the owner's explicit OK (local/download only until
  told otherwise).

## Suggested structure (once building starts)

```
packages/schema/   project types + Zod validation + sample project
packages/viewer/    the output renderer (tiny, dependency-free)
apps/editor/        the authoring SPA (Vite + React/Svelte)
tools/generator/    schema + image → self-contained index.html
docs/               ARCHITECTURE.md, STATUS.md, decisions
```
