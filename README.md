# Wayfinder Studio

An authoring tool for **ready-to-host wayfinding maps** — build an interactive venue/event map
(search, tap-to-route with an animated walker, stall directory, per-place QR codes) and publish it
as a self-contained static site you can host anywhere. Think "youthfest-style map, for any venue".

**Status:** design stage (PoC). See [docs/STATUS.md](docs/STATUS.md).

## Idea in one line

**Editor + Viewer, sharing one JSON schema.** You edit a project in the browser; "Publish" is a pure
function that assembles the Viewer + your data + the map image into one hostable `index.html`.

- Why a web app can produce a hostable web app, and the A/B/C options → [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- How to start building → [starter-prompt.md](starter-prompt.md)
- Project charter & working rules → [CLAUDE.md](CLAUDE.md)

Nothing is built yet — the first step is choosing the architecture and MVP scope (Stage 0).
