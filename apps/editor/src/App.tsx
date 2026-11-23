import { useEffect } from "react";
import { useEditor } from "./store";
import { Toolbar } from "./components/Toolbar";
import { Canvas } from "./components/Canvas";
import { Inspector } from "./components/Inspector";
import { CheckPanel } from "./components/CheckPanel";

export function App() {
  const deleteSelected = useEditor((s) => s.deleteSelected);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if ((e.key === "Delete" || e.key === "Backspace") && tag !== "INPUT" && tag !== "SELECT" && tag !== "TEXTAREA") {
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteSelected]);

  return (
    <div className="wf-app">
      <Toolbar />
      <main className="wf-main">
        <Canvas />
        <aside className="wf-side">
          <Inspector />
          <CheckPanel />
        </aside>
      </main>
    </div>
  );
}
