import type { Point } from "./routing";

export type Box = [number, number, number, number];

export interface Camera {
  fit(points: Point[], ms?: number): void;
  reset(ms?: number): void;
  cancel(): void;
}

/** Animates an <svg> element's viewBox to frame points or reset to the full venue. */
export function createCamera(svg: SVGSVGElement, W: number, H: number, reduced: () => boolean): Camera {
  let vb: Box = [0, 0, W, H];
  let raf = 0;
  const apply = (v: Box): void => svg.setAttribute("viewBox", v.map((n) => n.toFixed(1)).join(" "));
  const ease = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const animate = (to: Box, ms: number): void => {
    cancelAnimationFrame(raf);
    if (reduced() || ms <= 0) {
      vb = to;
      apply(to);
      return;
    }
    const from = vb.slice() as Box;
    const t0 = performance.now();
    const step = (now: number): void => {
      const t = Math.min(1, (now - t0) / ms);
      const e = ease(t);
      const cur = from.map((f, i) => f + (to[i] - f) * e) as Box;
      vb = cur;
      apply(cur);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  const fitBox = (pts: Point[]): Box => {
    if (pts.length === 0) return [0, 0, W, H];
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const pad = Math.max(W, H) * 0.08;
    const ratio = W / H;
    const x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad;
    const y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
    let w = x1 - x0, h = y1 - y0;
    if (w / h > ratio) h = w / ratio;
    else w = h * ratio;
    const minW = W * 0.45;
    if (w < minW) {
      w = minW;
      h = w / ratio;
    }
    if (w > W) {
      w = W;
      h = H;
    }
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    return [Math.min(Math.max(cx - w / 2, 0), W - w), Math.min(Math.max(cy - h / 2, 0), H - h), w, h];
  };

  return {
    fit: (pts, ms = 650) => animate(fitBox(pts), ms),
    reset: (ms = 600) => animate([0, 0, W, H], ms),
    cancel: () => cancelAnimationFrame(raf),
  };
}
