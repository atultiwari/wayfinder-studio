import { useEditor } from "../store";
import { qrSvg, downloadSvg } from "../lib/qr";

export function QrPanel() {
  const places = useEditor((s) => s.project.places);
  const base = useEditor((s) => s.project.qr?.baseUrl ?? "");
  const setQrBaseUrl = useEditor((s) => s.setQrBaseUrl);

  return (
    <section className="wf-panel">
      <h3>QR standees</h3>
      <label>
        Published URL
        <input value={base} placeholder="https://host/map/" onChange={(e) => setQrBaseUrl(e.target.value)} />
      </label>
      <p className="wf-muted">One “you are here” code per place → <code>#at-&lt;id&gt;</code>. Print and place one at each spot.</p>
      {places.length === 0 ? (
        <p className="wf-muted">Add places to generate standees.</p>
      ) : (
        <div className="wf-qrgrid">
          {places.map((p) => {
            const svg = qrSvg(`${base}#at-${p.id}`, 3, 2);
            return (
              <div key={p.id} className="wf-qr">
                <div className="wf-qrimg" dangerouslySetInnerHTML={{ __html: svg }} />
                <div className="wf-qrname">{p.name}</div>
                <button onClick={() => downloadSvg(`qr-${p.id}.svg`, svg)}>Download</button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
