import type { Project } from "@wayfinder/schema";

export interface GenerateOptions {
  /** Overrides the document <title> (defaults to the project name). */
  title?: string;
}

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Assemble a self-contained, ready-to-host map page.
 *
 * Inlines the project (with its image as a data URI) and the viewer runtime into a
 * single HTML string — no network, no backend, host anywhere. `viewerRuntime` is the
 * built viewer IIFE bundle that exposes the global `WayfinderViewer`.
 */
export function generateHtml(project: Project, viewerRuntime: string, opts: GenerateOptions = {}): string {
  const title = opts.title ?? project.name;
  const themeColor = project.theme?.head ?? "#0B1E4F";
  // Safe to embed inside <script>: `<` only appears inside string values (e.g. an SVG
  // data URI), so escaping it to < keeps valid JS and prevents an early </script>.
  const data = JSON.stringify(project).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="${escapeHtml(themeColor)}">
<title>${escapeHtml(title)}</title>
<style>body{margin:0;padding:16px;background:#f2f4f8;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}</style>
</head>
<body>
<div id="app"></div>
<script>${viewerRuntime}</script>
<script>WayfinderViewer.mountViewer(document.getElementById("app"), ${data});</script>
</body>
</html>
`;
}
