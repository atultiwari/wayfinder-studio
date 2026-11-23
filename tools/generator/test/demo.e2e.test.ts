import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { sampleProject } from "@wayfinder/schema";
import { generateHtml } from "../src/generate";

// Uses the real built viewer runtime. Skipped until the viewer lib has been built
// (`npm run build -w @wayfinder/viewer`), so the normal check stays self-contained.
const bundlePath = fileURLToPath(new URL("../../../packages/viewer/dist/wayfinder-viewer.js", import.meta.url));
const outDir = fileURLToPath(new URL("../dist/", import.meta.url));

describe.skipIf(!existsSync(bundlePath))("end-to-end generation", () => {
  it("writes a self-contained demo.html using the built viewer runtime", () => {
    const runtime = readFileSync(bundlePath, "utf8");
    const html = generateHtml(sampleProject, runtime, { title: "Wayfinder demo" });
    mkdirSync(outDir, { recursive: true });
    writeFileSync(`${outDir}demo.html`, html, "utf8");

    expect(html).toContain("WayfinderViewer.mountViewer(");
    expect(html.length).toBeGreaterThan(runtime.length);
  });
});
