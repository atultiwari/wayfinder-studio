import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the built editor works both locally and under a GitHub Pages
// project subpath (https://<user>.github.io/wayfinder-studio/).
export default defineConfig({
  base: "./",
  plugins: [react()],
});
