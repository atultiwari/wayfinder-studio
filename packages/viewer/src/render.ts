import type { Project } from "@wayfinder/schema";
import type { Point } from "./routing";
import { startPlace } from "./routing";

export interface ViewState {
  route: Point[] | null;
  targetId: string | null;
}

const esc = (s: unknown): string =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

interface TextOpts {
  anchor?: string;
  weight?: number;
  fill?: string;
  rot?: number;
  size?: number;
}

function text(x: number, y: number, t: string, o: TextOpts = {}): string {
  return `<text x="${x}" y="${y}" text-anchor="${o.anchor || "start"}" font-size="${o.size || 16}" font-weight="${o.weight || 500}" fill="${o.fill || "var(--wf-muted)"}" font-family="Inter, system-ui, sans-serif" ${o.rot ? `transform="rotate(${o.rot} ${x} ${y})"` : ""}>${esc(t)}</text>`;
}

/** Build the inner SVG markup for the map at a given view state. */
export function buildSvg(project: Project, state: ViewState): string {
  const { venue, places, buildings = [], labels = [] } = project;
  const start = startPlace(project);

  let s = `<image href="${esc(venue.image)}" x="0" y="0" width="${venue.width}" height="${venue.height}" preserveAspectRatio="none"/>`;

  for (const b of buildings) {
    s += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="6" fill="var(--wf-bldg)" opacity=".85"/>`;
    if (b.label) s += text(b.x + b.w / 2, b.y + b.h / 2, b.label, { anchor: "middle", fill: "var(--wf-ink)" });
  }
  for (const l of labels) s += text(l.x, l.y, l.text, { rot: l.rotation });

  if (state.route && state.route.length > 1) {
    const d = "M" + state.route.map((p) => `${p.x} ${p.y}`).join(" L");
    s += `<path d="${d}" fill="none" stroke="var(--wf-route)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 13" opacity=".95"/>`;
  }

  for (const p of places) {
    const on = p.id === state.targetId;
    const col = p.color || "var(--wf-accent)";
    s += `<g class="wf-place${on ? " on" : ""}" data-place="${esc(p.id)}" role="button" tabindex="0" aria-label="${esc(p.name)}">
      <circle class="wf-disc" cx="${p.x}" cy="${p.y}" r="15" fill="${col}" stroke="#fff" stroke-width="3"/>
      <circle cx="${p.x}" cy="${p.y}" r="5" fill="#fff"/>
      ${text(p.x, p.y + 32, p.name, { anchor: "middle", weight: 700, fill: "var(--wf-ink)" })}
    </g>`;
  }

  if (start) {
    s += `<g class="wf-here" aria-hidden="true"><circle cx="${start.x}" cy="${start.y}" r="12" fill="var(--wf-here)" stroke="#fff" stroke-width="3"/></g>`;
  }

  return s;
}
