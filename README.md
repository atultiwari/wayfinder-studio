# Wayfinder Studio

An authoring tool for **ready-to-host wayfinding maps**. Build an interactive venue/event map —
search, tap-to-route with an animated walker and turn-by-turn directions, a stall directory, and
per-place QR "you are here" standees — then **publish it as a single self-contained HTML file** you
can host anywhere, or **deploy it to GitHub Pages in one click**.

It's a clean, framework-light rebuild of the kind of editor that produces maps like
`youthfest.netlify.app` — generalised so you can make one for any venue.

## Idea in one line

**Editor + Viewer, sharing one JSON schema.** You edit a project in the browser; "Publish" is a pure
function that assembles the Viewer + your data + the map image into one hostable `index.html`.
(Full reasoning and the A/B/C options: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).)

## Run it locally

```bash
npm install
```

Build the viewer runtime once (the editor inlines it when you Publish/Preview/Deploy):

```bash
npm run build -w @wayfinder/viewer
```

Start the editor:

```bash
npm run dev -w @wayfinder/editor
```

Then open the printed URL (default **http://localhost:5173/**, or whatever port Vite picks). Click
**Sample** to load the example map.

Optional — run the standalone viewer demo (renders the sample project on its own):

```bash
npm run dev -w @wayfinder/viewer
```

## Using the editor

1. **Load image** — drop in your venue map (or click **Sample**).
2. **+ Place** — click to drop destinations; the first one becomes the **start** ("you are here").
3. **+ Node / + Edge** — lay down the walkable path graph, then select a place and **Attach to nearest**
   node so it can be routed to.
4. **Select** — drag places/nodes; edit a place (name, role, colour) and its **stalls** in the Inspector.
5. **QR standees** — set your published URL and download a "you are here" QR per place.
6. **Check** — live validation (unreachable places, missing start, …).
7. **Publish** → download a self-contained HTML, or **Deploy** → push straight to GitHub Pages.
   Step-by-step publishing/hosting guide: [docs/DEPLOY.md](docs/DEPLOY.md).

Undo/redo (`↶ ↷`, Ctrl/Cmd+Z), wheel-zoom, and drag-to-pan are all supported.

## Workspace

| Package | What it is |
|---------|-----------|
| `packages/schema` (`@wayfinder/schema`) | The project schema — Zod validation, inferred TS types, `lint()`, a sample project. The shared contract. |
| `packages/viewer` (`@wayfinder/viewer`) | The published map renderer: markers, Dijkstra routing, animated walker, directions, search, QR hash deep-links. Also builds a single IIFE runtime. |
| `tools/generator` (`@wayfinder/generator`) | `generateHtml(project, runtime)` → one self-contained, host-anywhere HTML (+ `download()`). |
| `tools/deploy` (`@wayfinder/deploy`) | `deployHtmlToGitHub()` — commit the generated map to a repo via the GitHub API. |
| `apps/editor` (`@wayfinder/editor`) | The authoring SPA (React + Vite + Zustand). |

## The flow

```
Editor  ──edits──▶  Project (JSON: venue image + places + paths + stalls + qr + theme)
                         │
                   generateHtml()            deployHtmlToGitHub()
                         ▼                          ▼
             one self-contained index.html   →  GitHub Pages URL
             (download, host anywhere)
```

## Checks

```bash
npm run check   # typecheck + unit tests + builds across all packages
```

## Notes

- **Self-contained output:** the published HTML inlines the viewer, the data and the map image — no
  network, no backend, works offline. Host it on GitHub Pages, Netlify drop, S3, anything.
- **Deploy & secrets:** the GitHub token you enter in the Deploy dialog is used only in your browser
  to call `api.github.com` — it is never stored, logged, or sent anywhere else. GitHub works directly
  from the browser; Netlify/other hosts would need a small proxy.
- **Status:** see [docs/STATUS.md](docs/STATUS.md). Not affiliated with any existing product.
