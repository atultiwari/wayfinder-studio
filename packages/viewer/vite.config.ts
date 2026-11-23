import { defineConfig } from "vitest/config";

// `vite dev` serves index.html (the dev harness).
// `vite build` produces a single self-contained IIFE runtime (global `WayfinderViewer`)
// that the generator inlines into a published, self-contained map page.
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "WayfinderViewer",
      formats: ["iife"],
      fileName: () => "wayfinder-viewer.js",
    },
    outDir: "dist",
    emptyOutDir: true,
  },
  test: { environment: "node" },
});
