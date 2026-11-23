# Starter prompt

## 1. Open a Claude Code session in this folder

Working folder: `/Users/atultiwari/Projects/misc/wayfinder-studio`
(so Claude picks up this folder's CLAUDE.md automatically).

## 2. Paste this as the first message

```
This is a new project: a wayfinding-map AUTHORING TOOL that produces ready-to-host map
webapps (like youthfest.netlify.app) for any venue or event. Read CLAUDE.md and STATUS.md
first and follow them: Editor + Viewer sharing one JSON schema; Publish = generate a
self-contained static site; work in stages with checkpoints; keep STATUS.md current.

We are at Stage 0 (Decide). Read docs/ARCHITECTURE.md, then help me lock the architecture
(A/B/C), the output shape, the editor stack, and the smallest MVP scope that proves the
loop end-to-end (venue image -> places -> path -> Publish -> a hostable map that routes).
Stop at the Stage-0 checkpoint and give me the decision.
```

## 3. After each checkpoint

Claude stops and summarises what it did and the decision for the next stage. Reply in plain words
("go on", "use Architecture A", "React for the editor", "do the schema first"). The process lives
in CLAUDE.md; where things stand lives in STATUS.md, so "go on" means "the next step in STATUS.md".

## 4. Continue another day

Start a new session in the same folder and say:

```
Continue this project. Read CLAUDE.md and STATUS.md and carry on from the next step.
```

## Reference (optional)
- The published-output shape we're matching: a self-contained static map app (youthfest-style).
- A separate `youthfest-clone` project is a behaviour reference for the Viewer — do not copy any
  editor internals; design fresh from the schema.
