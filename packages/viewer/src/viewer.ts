import type { Project } from "@wayfinder/schema";
import { buildBaseSvg } from "./render";
import { routePoints, directions, startPlace, type Step } from "./routing";
import { createCamera, type Camera } from "./camera";
import { playRoute, type RouteController } from "./walker";

export interface ViewerHandle {
  destroy(): void;
}

const CSS = `
.wf-root{--wf-head:#0B1E4F;--wf-accent:#F58A14;--wf-here:#E11D48;--wf-route:#1D4ED8;--wf-routeSoft:rgba(29,78,216,.18);--wf-ink:#0F172A;--wf-muted:#5B6476;--wf-line:#E2E6EE;--wf-bldg:#E1E5EC;
  font-family:Inter,system-ui,sans-serif;color:var(--wf-ink);max-width:900px;margin:0 auto}
.wf-head{display:flex;gap:12px;align-items:center;padding:12px 14px;background:var(--wf-head);color:#fff;border-radius:12px 12px 0 0;flex-wrap:wrap}
.wf-title{font-size:18px;font-weight:700;margin-right:auto}
.wf-search{position:relative;flex:1;min-width:180px;max-width:320px}
.wf-search input{width:100%;border:0;border-radius:9px;padding:9px 12px;font:500 14px Inter,sans-serif;color:var(--wf-ink)}
.wf-results{position:absolute;left:0;right:0;top:calc(100% + 6px);background:#fff;border:1px solid var(--wf-line);border-radius:10px;box-shadow:0 14px 34px rgba(15,23,42,.22);overflow:hidden;display:none;z-index:5}
.wf-results.on{display:block}
.wf-results button{display:block;width:100%;text-align:left;border:0;background:none;padding:9px 12px;font:600 14px Inter,sans-serif;color:var(--wf-ink);cursor:pointer;border-bottom:1px solid var(--wf-line)}
.wf-results button:last-child{border-bottom:0}
.wf-results button:hover{background:#f2f4f8}
.wf-hintbar{padding:8px 14px;background:#0a1836;color:rgba(255,255,255,.85);font-size:13px}
.wf-svg{border:1px solid var(--wf-line);border-top:0;overflow:hidden;background:#eef1f4}
.wf-svg svg{display:block;width:100%;height:auto;touch-action:manipulation}
.wf-place{cursor:pointer}
.wf-place .wf-disc{transition:r .15s ease}
.wf-place:hover .wf-disc{r:17}
.wf-place:focus-visible{outline:none}
.wf-place:focus-visible .wf-disc{stroke:var(--wf-route);stroke-width:5}
.wf-ping{transform-box:fill-box;transform-origin:center;animation:wf-ping 2s ease-out infinite}
@keyframes wf-ping{0%{transform:scale(.6);opacity:.55}100%{transform:scale(2.2);opacity:0}}
@media (prefers-reduced-motion: reduce){.wf-ping{animation:none}}
.wf-steps{list-style:none;margin:0;padding:10px 14px 14px;border:1px solid var(--wf-line);border-top:0;border-radius:0 0 12px 12px;background:#fff;display:none}
.wf-steps.on{display:block}
.wf-steps li{display:flex;gap:10px;align-items:flex-start;padding:7px 2px;font-size:14px;color:var(--wf-ink)}
.wf-steps li .wf-ic{flex:none;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:#eef2ff;color:var(--wf-route);font-weight:700;font-size:13px}
.wf-steps li.arrive .wf-ic{background:#fef2f2;color:var(--wf-here)}
`;

const GLYPH: Record<Step["kind"], string> = { start: "•", left: "←", right: "→", straight: "↑", arrive: "◉" };

function injectCss(): void {
  if (typeof document === "undefined" || document.getElementById("wf-css")) return;
  const style = document.createElement("style");
  style.id = "wf-css";
  style.textContent = CSS;
  document.head.appendChild(style);
}

function applyTheme(el: HTMLElement, project: Project): void {
  const t = project.theme;
  if (!t) return;
  const set = (n: string, v?: string): void => {
    if (v) el.style.setProperty(n, v);
  };
  set("--wf-head", t.head);
  set("--wf-accent", t.accent);
  set("--wf-here", t.here);
  set("--wf-route", t.route);
  if (t.font) el.style.setProperty("font-family", `${t.font}, system-ui, sans-serif`);
}

const norm = (s: string): string => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9 ]/g, " ");
const reduced = (): boolean => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export function mountViewer(root: HTMLElement, project: Project): ViewerHandle {
  injectCss();

  const wrap = document.createElement("div");
  wrap.className = "wf-root";
  applyTheme(wrap, project);
  wrap.innerHTML =
    `<div class="wf-head"><strong class="wf-title"></strong>` +
    `<div class="wf-search"><input type="search" placeholder="Search places" aria-label="Search places"/><div class="wf-results"></div></div></div>` +
    `<div class="wf-hintbar"><span class="wf-hint"></span></div>` +
    `<div class="wf-svg"></div>` +
    `<ol class="wf-steps"></ol>`;
  (wrap.querySelector(".wf-title") as HTMLElement).textContent = project.name;
  root.appendChild(wrap);

  const svgHost = wrap.querySelector(".wf-svg") as HTMLElement;
  const hint = wrap.querySelector(".wf-hint") as HTMLElement;
  const stepsEl = wrap.querySelector(".wf-steps") as HTMLElement;
  const searchInput = wrap.querySelector(".wf-search input") as HTMLInputElement;
  const results = wrap.querySelector(".wf-results") as HTMLElement;

  const startId = startPlace(project)?.id ?? null;
  let here: string | null = startId;
  let camera: Camera | null = null;
  let route: RouteController | null = null;

  const placeName = (id: string | null): string => project.places.find((p) => p.id === id)?.name ?? "";

  const rebuildBase = (): void => {
    svgHost.innerHTML = `<svg viewBox="0 0 ${project.venue.width} ${project.venue.height}" role="img" aria-label="${project.name} map">${buildBaseSvg(project, here)}</svg>`;
    const svg = svgHost.querySelector("svg") as SVGSVGElement;
    camera = createCamera(svg, project.venue.width, project.venue.height, reduced);
  };

  const renderSteps = (steps: Step[]): void => {
    if (steps.length === 0) {
      stepsEl.classList.remove("on");
      stepsEl.innerHTML = "";
      return;
    }
    stepsEl.innerHTML = steps
      .map((s) => `<li class="${s.kind}"><span class="wf-ic">${GLYPH[s.kind]}</span><span>${s.text}</span></li>`)
      .join("");
    stepsEl.classList.add("on");
  };

  const clearRoute = (): void => {
    route?.stop();
    const rl = svgHost.querySelector("#wf-route") as SVGGElement | null;
    const wl = svgHost.querySelector("#wf-walker") as SVGGElement | null;
    if (rl) rl.innerHTML = "";
    if (wl) wl.innerHTML = "";
    renderSteps([]);
  };

  const defaultHint = (): void => {
    hint.textContent = here && here !== startId ? `You are at ${placeName(here)}. Tap a place to get there.` : "Tap a place to see the way there";
  };

  const routeTo = (toId: string): void => {
    const origin = here ?? startId;
    if (!origin || toId === origin) {
      clearRoute();
      camera?.reset();
      defaultHint();
      return;
    }
    const points = routePoints(project, origin, toId);
    const steps = directions(project, origin, toId);
    const rl = svgHost.querySelector("#wf-route") as SVGGElement;
    const wl = svgHost.querySelector("#wf-walker") as SVGGElement;
    route?.stop();
    renderSteps(steps);
    hint.textContent = `Walking to ${placeName(toId)}…`;
    camera?.fit(points);
    route = playRoute({ routeLayer: rl, walkerLayer: wl, points, reduced: reduced(), onArrive: () => { hint.textContent = `You’ve arrived at ${placeName(toId)}`; } });
  };

  const runSearch = (raw: string): void => {
    const q = norm(raw).trim();
    if (!q) {
      results.classList.remove("on");
      return;
    }
    const hits = project.places.filter((p) => norm(p.name).includes(q)).slice(0, 8);
    results.innerHTML = hits.length
      ? hits.map((p) => `<button data-place="${p.id}">${p.name}</button>`).join("")
      : `<button disabled>No matches</button>`;
    results.classList.add("on");
  };

  const fromHash = (): void => {
    const h = decodeURIComponent(location.hash.slice(1));
    const exists = (id: string): boolean => project.places.some((p) => p.id === id);
    if (h.startsWith("at-") && exists(h.slice(3))) {
      here = h.slice(3);
      rebuildBase();
      clearRoute();
      camera?.reset(0);
      hint.textContent = `You are here: ${placeName(here)}. Tap a place to get there.`;
    } else if (exists(h)) {
      routeTo(h);
    } else {
      defaultHint();
    }
  };

  const onClick = (e: MouseEvent): void => {
    if (!(e.target instanceof Element)) return;
    const el = e.target.closest<HTMLElement>("[data-place]");
    if (el?.dataset.place) {
      results.classList.remove("on");
      searchInput.value = "";
      routeTo(el.dataset.place);
      return;
    }
    if (!e.target.closest(".wf-search")) results.classList.remove("on");
  };
  const onKeydown = (e: KeyboardEvent): void => {
    if ((e.key === "Enter" || e.key === " ") && e.target instanceof Element) {
      const el = e.target.closest<HTMLElement>(".wf-place[data-place]");
      if (el?.dataset.place) {
        e.preventDefault();
        routeTo(el.dataset.place);
      }
    }
    if (e.key === "Escape") results.classList.remove("on");
  };
  const onInput = (): void => runSearch(searchInput.value);
  const onHash = (): void => fromHash();

  wrap.addEventListener("click", onClick);
  wrap.addEventListener("keydown", onKeydown);
  searchInput.addEventListener("input", onInput);
  window.addEventListener("hashchange", onHash);

  rebuildBase();
  if (location.hash) fromHash();
  else defaultHint();

  return {
    destroy(): void {
      route?.stop();
      camera?.cancel();
      wrap.removeEventListener("click", onClick);
      wrap.removeEventListener("keydown", onKeydown);
      searchInput.removeEventListener("input", onInput);
      window.removeEventListener("hashchange", onHash);
      wrap.remove();
    },
  };
}
