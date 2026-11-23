/** Trigger a browser download of the generated HTML. Browser-only. */
export function download(filename: string, html: string): void {
  if (typeof document === "undefined") {
    throw new Error("download() requires a browser environment");
  }
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".html") ? filename : `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
