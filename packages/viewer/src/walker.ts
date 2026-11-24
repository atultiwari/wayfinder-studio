import type { Point } from "./routing";

export interface RouteController {
  stop(): void;
}

export interface PlayRouteArgs {
  routeLayer: SVGGElement;
  walkerLayer: SVGGElement;
  points: Point[];
  reduced: boolean;
  onArrive?: () => void;
}

/**
 * Draw a route and animate a walking marker along it with a progressive reveal.
 * Reduced-motion jumps straight to the arrived state.
 */
export function playRoute({ routeLayer, walkerLayer, points, reduced, onArrive }: PlayRouteArgs): RouteController {
  if (points.length < 2) {
    routeLayer.innerHTML = "";
    walkerLayer.innerHTML = "";
    onArrive?.();
    return { stop() {} };
  }

  const d = "M" + points.map((p) => `${p.x} ${p.y}`).join(" L");
  routeLayer.innerHTML =
    `<path d="${d}" fill="none" stroke="var(--wf-routeSoft)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<mask id="wf-reveal" maskUnits="userSpaceOnUse"><path id="wf-revealPath" d="${d}" fill="none" stroke="#fff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/></mask>` +
    `<path d="${d}" fill="none" stroke="var(--wf-route)" stroke-width="6" stroke-linecap="round" stroke-dasharray="0.1 12" mask="url(#wf-reveal)"/>` +
    `<path id="wf-track" d="${d}" fill="none" stroke="none"/>`;
  walkerLayer.innerHTML =
    `<g id="wf-walker"><circle r="13" fill="#fff" stroke="var(--wf-route)" stroke-width="2"/><circle r="9" fill="var(--wf-route)"/></g>`;

  const track = routeLayer.querySelector("#wf-track") as SVGGeometryElement;
  const reveal = routeLayer.querySelector("#wf-revealPath") as SVGGeometryElement;
  const walker = walkerLayer.querySelector("#wf-walker") as SVGGElement;
  const len = track.getTotalLength();
  reveal.setAttribute("stroke-dasharray", `${len} ${len}`);

  const place = (dist: number): void => {
    const p = track.getPointAtLength(dist);
    walker.setAttribute("transform", `translate(${p.x} ${p.y})`);
    reveal.setAttribute("stroke-dashoffset", String(len - dist));
  };

  if (reduced) {
    place(len);
    onArrive?.();
    return { stop() {} };
  }

  const dur = Math.min(6000, Math.max(1400, len * 3));
  const t0 = performance.now();
  let raf = 0;
  const tick = (now: number): void => {
    const t = Math.min(1, (now - t0) / dur);
    place(len * t);
    if (t < 1) raf = requestAnimationFrame(tick);
    else onArrive?.();
  };
  place(0);
  raf = requestAnimationFrame(tick);
  return {
    stop() {
      cancelAnimationFrame(raf);
    },
  };
}
