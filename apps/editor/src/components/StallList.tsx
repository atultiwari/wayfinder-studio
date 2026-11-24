import { useEditor } from "../store";

export function StallList({ placeId }: { placeId: string }) {
  const allStalls = useEditor((s) => s.project.stalls);
  const stalls = (allStalls ?? []).filter((x) => x.placeId === placeId);
  const { addStall, updateStall, deleteStall } = useEditor();

  return (
    <div className="wf-stalls">
      <div className="wf-row">
        <b>Stalls ({stalls.length})</b>
        <button onClick={() => addStall(placeId)}>+ Add stall</button>
      </div>
      {stalls.map((st) => (
        <div key={st.id} className="wf-stall">
          <div className="wf-stallrow">
            <input className="wf-stno" value={st.label} onChange={(e) => updateStall(st.id, { label: e.target.value })} placeholder="No." aria-label="Stall number" />
            <input value={st.name} onChange={(e) => updateStall(st.id, { name: e.target.value })} placeholder="Name" aria-label="Stall name" />
            <button className="danger" title="Delete stall" onClick={() => deleteStall(st.id)}>×</button>
          </div>
          <input value={st.tagline ?? ""} onChange={(e) => updateStall(st.id, { tagline: e.target.value || undefined })} placeholder="Tagline (optional)" />
          <input value={st.owner ?? ""} onChange={(e) => updateStall(st.id, { owner: e.target.value || undefined })} placeholder="Owner (optional)" />
        </div>
      ))}
    </div>
  );
}
