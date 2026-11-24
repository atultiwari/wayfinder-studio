import { useEffect } from "react";
import { useEditor } from "./store";
import { Toolbar } from "./components/Toolbar";
import { Canvas } from "./components/Canvas";
import { Inspector } from "./components/Inspector";
import { CheckPanel } from "./components/CheckPanel";
import { QrPanel } from "./components/QrPanel";

export function App() {
  const deleteSelected = useEditor((s) => s.deleteSelected);
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const typing = tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA";
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && !typing) {
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteSelected, undo, redo]);

  return (
    <div className="wf-app">
      <Toolbar />
      <main className="wf-main">
        <Canvas />
        <aside className="wf-side">
          <Inspector />
          <CheckPanel />
          <QrPanel />
        </aside>
      </main>
    </div>
  );
}
