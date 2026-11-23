// Dev harness: mount the sample project so the viewer can be exercised in a browser.
import { sampleProject } from "@wayfinder/schema";
import { mountViewer } from "./index";

const root = document.getElementById("app");
if (root) mountViewer(root, sampleProject);
