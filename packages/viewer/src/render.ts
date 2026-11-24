import type { Project } from "@wayfinder/schema";

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

/**
 * Base map SVG: image, buildings, labels, place markers, a "you are here" dot at
 * `hereId`, and empty #wf-route / #wf-walker layers the animation fills at runtime.
 */
export function buildBaseSvg(project: Project, hereId: string | null): string {
  const { venue, places, buildings = [], labels = [] } = project;
  const here = places.find((p) => p.id === hereId) ?? places.find((p) => p.role === "start") ?? null;

  let s = `<image href="${esc(venue.image)}" x="0" y="0" width="${venue.width}" height="${venue.height}" preserveAspectRatio="none"/>`;

  for (const b of buildings) {
    s += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="6" fill="var(--wf-bldg)" opacity=".85"/>`;
    if (b.label) s += text(b.x + b.w / 2, b.y + b.h / 2, b.label, { anchor: "middle", fill: "var(--wf-ink)" });
  }
  for (const l of labels) s += text(l.x, l.y, l.text, { rot: l.rotation });

  s += `<g id="wf-route"></g>`;

  for (const p of places) {
    const col = p.color || (p.role === "start" ? "var(--wf-here)" : "var(--wf-accent)");
    s += `<g class="wf-place" data-place="${esc(p.id)}" role="button" tabindex="0" aria-label="${esc(p.name)}">
      <circle class="wf-disc" cx="${p.x}" cy="${p.y}" r="15" fill="${col}" stroke="#fff" stroke-width="3"/>
      <circle cx="${p.x}" cy="${p.y}" r="5" fill="#fff"/>
      ${text(p.x, p.y + 32, p.name, { anchor: "middle", weight: 700, fill: "var(--wf-ink)" })}
    </g>`;
  }

  if (here) {
    s += `<g class="wf-here" aria-hidden="true"><circle class="wf-ping" cx="${here.x}" cy="${here.y}" r="14" fill="var(--wf-here)"/><circle cx="${here.x}" cy="${here.y}" r="9" fill="var(--wf-here)" stroke="#fff" stroke-width="3"/></g>`;
  }

  s += `<g id="wf-walker"></g>`;
  return s;
}
