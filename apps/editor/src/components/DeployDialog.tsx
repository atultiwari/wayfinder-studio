import { useState } from "react";
import { deployHtmlToGitHub } from "@wayfinder/deploy";
import { useEditor } from "../store";
import { buildHtml } from "../lib/publish";

/** Deploy dialog. The token lives only in this component's state — never stored or persisted. */
export function DeployDialog({ onClose }: { onClose: () => void }) {
  const project = useEditor((s) => s.project);
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("main");
  const [path, setPath] = useState("index.html");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const deploy = async (): Promise<void> => {
    setError(null);
    setUrl(null);
    setBusy(true);
    try {
      const html = buildHtml(project);
      const out = await deployHtmlToGitHub(html, { owner, repo, branch, path, token });
      setUrl(out.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="wf-modal" role="dialog" aria-modal="true" aria-label="Deploy to GitHub Pages">
      <div className="wf-modalcard">
        <div className="wf-modalhead">
          <b>Deploy to GitHub Pages</b>
          <button className="wf-x" onClick={onClose} aria-label="Close">×</button>
        </div>
        <p className="wf-muted">
          Commits the generated map to your repo. Enable Pages once (repo → Settings → Pages → your
          branch). Your token is used only here, in your browser, to call the GitHub API — it is never
          stored or sent anywhere else. (Netlify/other hosts need a small proxy; GitHub works directly.)
        </p>
        <label>Repo owner<input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="your-username" autoComplete="off" /></label>
        <label>Repo name<input value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="my-festival-map" autoComplete="off" /></label>
        <div className="wf-row2">
          <label>Branch<input value={branch} onChange={(e) => setBranch(e.target.value)} /></label>
          <label>File path<input value={path} onChange={(e) => setPath(e.target.value)} /></label>
        </div>
        <label>GitHub token (contents: write)<input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="github_pat_… / ghp_…" autoComplete="off" /></label>
        {error && <p className="wf-err">{error}</p>}
        {url && (
          <p className="wf-okmsg">Published → <a href={url} target="_blank" rel="noreferrer">{url}</a> (give Pages a minute)</p>
        )}
        <div className="wf-modalfoot">
          <button onClick={onClose}>Close</button>
          <button className="primary" disabled={busy || !owner || !repo || !token} onClick={deploy}>
            {busy ? "Deploying…" : "Deploy"}
          </button>
        </div>
      </div>
    </div>
  );
}
