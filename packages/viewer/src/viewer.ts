import type { Project } from "@wayfinder/schema";
import { buildSvg, type ViewState } from "./render";
import { routePoints, startPlace } from "./routing";

export interface ViewerHandle {
  destroy(): void;
}

const CSS = `
.wf-root{--wf-head:#0B1E4F;--wf-accent:#F58A14;--wf-here:#E11D48;--wf-route:#1D4ED8;--wf-ink:#0F172A;--wf-muted:#5B6476;--wf-bldg:#E1E5EC;
  font-family:Inter,system-ui,sans-serif;color:var(--wf-ink);max-width:900px;margin:0 auto}
.wf-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:12px 14px;background:var(--wf-head);color:#fff;border-radius:12px 12px 0 0}
.wf-head strong{font-size:18px;font-weight:700}
.wf-hint{font-size:13px;color:rgba(255,255,255,.82)}
.wf-svg{border:1px solid #e2e6ee;border-top:0;border-radius:0 0 12px 12px;overflow:hidden;background:#eef1f4}
.wf-svg svg{display:block;width:100%;height:auto;touch-action:manipulation}
.wf-place{cursor:pointer}
.wf-place .wf-disc{transition:r .15s ease}
.wf-place:hover .wf-disc{r:17}
.wf-place.on .wf-disc{stroke:var(--wf-route);stroke-width:5}
.wf-place:focus-visible{outline:none}
.wf-place:focus-visible .wf-disc{stroke:var(--wf-route);stroke-width:5}
`;

function injectCss(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("wf-css")) return;
  const style = document.createElement("style");
  style.id = "wf-css";
  style.textContent = CSS;
  document.head.appendChild(style);
}

function applyTheme(el: HTMLElement, project: Project): void {
  const t = project.theme;
  if (!t) return;
  const set = (name: string, v?: string): void => {
    if (v) el.style.setProperty(name, v);
  };
  set("--wf-head", t.head);
  set("--wf-accent", t.accent);
  set("--wf-here", t.here);
  set("--wf-route", t.route);
  if (t.font) el.style.setProperty("font-family", `${t.font}, system-ui, sans-serif`);
}

/** Mount an interactive viewer for `project` inside `root`. Returns a handle to tear it down. */
export function mountViewer(root: HTMLElement, project: Project): ViewerHandle {
  injectCss();

  const wrap = document.createElement("div");
  wrap.className = "wf-root";
  applyTheme(wrap, project);
  wrap.innerHTML =
    `<div class="wf-head"><strong></strong><span class="wf-hint"></span></div><div class="wf-svg"></div>`;
  (wrap.querySelector(".wf-head strong") as HTMLElement).textContent = project.name;
  root.appendChild(wrap);

  const svgHost = wrap.querySelector(".wf-svg") as HTMLElement;
  const hint = wrap.querySelector(".wf-hint") as HTMLElement;
  const state: ViewState = { route: null, targetId: null };

  const render = (): void => {
    svgHost.innerHTML = `<svg viewBox="0 0 ${project.venue.width} ${project.venue.height}" role="img" aria-label="${project.name} map">${buildSvg(project, state)}</svg>`;
    const target = project.places.find((p) => p.id === state.targetId);
    hint.textContent = target ? `Walking to ${target.name}` : "Tap a place to see the way there";
  };

  const routeTo = (id: string): void => {
    const start = startPlace(project);
    if (!start || id === start.id) {
      state.route = null;
      state.targetId = null;
    } else {
      state.targetId = id;
      state.route = routePoints(project, start.id, id);
    }
    render();
  };

  const onClick = (e: MouseEvent): void => {
    if (!(e.target instanceof Element)) return;
    const el = e.target.closest<HTMLElement>("[data-place]");
    if (el?.dataset.place) routeTo(el.dataset.place);
  };
  const onKeydown = (e: KeyboardEvent): void => {
    if ((e.key === "Enter" || e.key === " ") && e.target instanceof Element) {
      const el = e.target.closest<HTMLElement>("[data-place]");
      if (el?.dataset.place) {
        e.preventDefault();
        routeTo(el.dataset.place);
      }
    }
  };

  wrap.addEventListener("click", onClick);
  wrap.addEventListener("keydown", onKeydown);
  render();

  return {
    destroy(): void {
      wrap.removeEventListener("click", onClick);
      wrap.removeEventListener("keydown", onKeydown);
      wrap.remove();
    },
  };
}
