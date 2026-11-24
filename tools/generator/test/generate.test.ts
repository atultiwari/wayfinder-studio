import { describe, it, expect } from "vitest";
import { sampleProject } from "@wayfinder/schema";
import { generateHtml } from "../src/generate";

const RUNTIME = "window.WayfinderViewer={mountViewer:function(){}};/*RUNTIME_MARKER*/";

describe("generateHtml", () => {
  const html = generateHtml(sampleProject, RUNTIME);

  it("is a full HTML document with a mount point", () => {
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain('<div id="app"></div>');
  });

  it("inlines the viewer runtime", () => {
    expect(html).toContain("RUNTIME_MARKER");
  });

  it("inlines the project data and bootstraps the viewer", () => {
    expect(html).toContain("WayfinderViewer.mountViewer(");
    expect(html).toContain('"id":"sample"');
  });

  it("escapes < inside inlined data (no premature </script>)", () => {
    expect(html).toContain("\\u003csvg"); // the image data URI's "<svg" is escaped
    expect(html).not.toContain("</script><svg");
  });

  it("uses the project name as the title, overridable", () => {
    expect(html).toContain("<title>Green Park Fair</title>");
    expect(generateHtml(sampleProject, RUNTIME, { title: "Custom" })).toContain("<title>Custom</title>");
  });
});
