import { generateHtml, download } from "@wayfinder/generator";
import { safeParseProject, type Project } from "@wayfinder/schema";
// The built viewer runtime, inlined as a string (build the viewer lib first).
import viewerRuntime from "../../../../packages/viewer/dist/wayfinder-viewer.js?raw";

const slug = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "map";

export interface PublishResult {
  ok: boolean;
  errors?: string[];
}

/** Validate, then download a self-contained HTML of the project. */
export function publish(project: Project): PublishResult {
  const r = safeParseProject(project);
  if (!r.success) {
    return { ok: false, errors: r.error.issues.map((i) => `${i.path.join(".") || "project"}: ${i.message}`) };
  }
  download(`${slug(project.name)}.html`, generateHtml(r.data, viewerRuntime));
  return { ok: true };
}

/** A blob URL of the generated page, for an in-app preview tab. */
export function previewUrl(project: Project): string {
  return URL.createObjectURL(new Blob([generateHtml(project, viewerRuntime)], { type: "text/html" }));
}

export function exportJson(project: Project): void {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug(project.name)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
