/* Parola – minimal app (focus on table + learn views) */
const { useState, useEffect, useMemo } = React;
const LS_KEY = "parola:full-polish";
const now = () => Date.now();
const minutes = (n) => n * 60 * 1000;
const days = (n) => n * 24 * 60 * 60 * 1000;
const INTERVALS = [ minutes(10), days(1), days(3), days(7), days(16) ];
const uid = () => (crypto.randomUUID?.() || Math.random().toString(36).slice(2));
const norm = (s) => (s || "").toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "");
const shuffle = (arr) => arr.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const clamp = (n,a,b)=>Math.min(Math.max(n,a),b);
const loadState = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)||"null") } catch { return null } }
const saveState = (s) => localStorage.setItem(LS_KEY, JSON.stringify(s));
const scheduleNext = (card, result) => {
  const idx = clamp(card.intervalIndex ?? 0, 0, INTERVALS.length-1);
  let nextIdx = idx; let streak = card.streak ?? 0;
  if (result === "good") { nextIdx = clamp(idx+1,0,INTERVALS.length-1); streak += 1; }
  else { nextIdx = 0; streak = 0; }
  return { ...card, intervalIndex: nextIdx, streak, dueAt: now() + INTERVALS[nextIdx] };
};
const speak = (text, lang="it-IT") => { if (!('speechSynthesis' in window)) return; const u=new SpeechSynthesisUtterance(text); u.lang=lang; speechSynthesis.speak(u); };

const Tabs = ({ tab, setTab }) => {
  const tabs = [["learn","Lernen"],["list","Vokabeln"],["add","Hinzufügen"],["settings","Einstellungen"]];
  return (<div className="tabs">{tabs.map(([id,label]) => (<button key={id} className={{"btn":true,"active":tab===id}} onClick={()=>setTab(id)}>{label}</button>))}</div>);
};

const LearnView = ({ items, setItems }) => {
  const [direction, setDirection] = useState("it-de");
  const [idx, setIdx] = useState(0);
  const [reveal, setReveal] = useState(false);
  const due = useMemo(() => items.filter(i=>!i.suspended && (i.dueAt ?? 0) <= now()), [items]);
  const current = due[Math.min(idx, Math.max(0,due.length-1))];
  useEffect(() => { const el=document.getElementById('due-counter'); if(el) el.textContent = due.length ? ('Fällig: ' + due.length) : 'Nichts fällig'; }, [due.length]);
  if (!current) return <div className="card"><b>🎉 Nichts fällig!</b><div className="muted">Füge neue Karten hinzu oder komme später wieder.</div></div>;
  const q = direction === "it-de" ? current.it : current.de;
  const a = direction === "it-de" ? current.de : current.it;
  const mark = (res) => { setItems(prev => prev.map(it => it.id===current.id ? scheduleNext(it, res) : it)); setReveal(false); setIdx(i=>i+1); };
  return (<div className="grid">
    <div className="card" style={{textAlign:'center'}}>
      <div className="muted" style={{marginBottom:8}}>{direction === 'it-de' ? 'Frage (IT)' : 'Frage (DE)'} – Intervall: 10 min …</div>
      <div style={{fontSize:32, fontWeight:800,fontFamily:'Nunito'}}>{q}</div>
      <button className="speaker-icon" aria-label="Vorlesen" onClick={()=>speak(direction==='it-de' ? current.it : current.de, direction==='it-de' ? 'it-IT' : 'de-DE')}>
        <img src="assets/Hear-Icon.svg" alt="Hören">
      </button>
      {reveal && <div style={{marginTop:10, fontSize:22}}><b>Antwort:</b> {a}</div>}
      <div style={{display:'flex', gap:8, marginTop:16, justifyContent:'center'}}>
        <button className="btn ghost" onClick={()=>setReveal(r=>!r)}>{reveal ? "Vorderseite" : "Auflösung zeigen"}</button>
        <button className="btn ghost" onClick={()=>mark('again')}>Wiederholen</button>
        <button className="btn primary" onClick={()=>mark('good')}>Gewusst</button>
      </div>
    </div>
  </div>);
};

const AddView = ({ onAdd }) => {
  const { useState } = React;
  const [it,setIt] = useState(""); const [de,setDe] = useState(""); const [notes,setNotes]=useState("");
  const submit = (e) => { e.preventDefault(); if (!it.trim() || !de.trim()) return; onAdd({ id: uid(), it: it.trim(), de: de.trim(), notes: notes.trim() || undefined, createdAt: now(), dueAt: now(), intervalIndex:0, streak:0, suspended:false }); setIt(""); setDe(""); setNotes(""); };
  return (<form onSubmit={submit} className="card">
    <div className="grid grid-2">
      <label>Italienisch<input className="input" value={it} onChange={e=>setIt(e.target.value)} placeholder="ragazzo"/></label>
      <label>Deutsch<input className="input" value={de} onChange={e=>setDe(e.target.value)} placeholder="Junge"/></label>
    </div>
    <label style={{display:'block', marginTop:10}}>Notizen (optional)<input className="input" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Plural: ragazzi"/></label>
    <div style={{marginTop:12, display:'flex', gap:8}}>
      <button className="btn primary" type="submit">Hinzufügen</button>
      <button className="btn ghost" type="button" onClick={()=>{setIt("");setDe("");setNotes("");}}>Zurücksetzen</button>
    </div>
  </form>);
};

const ListView = ({ items, setItems }) => {
  const { useState, useMemo } = React;
  const [q,setQ] = useState("");
  const filtered = useMemo(()=>items.filter(i=>(norm(i.it).includes(norm(q)) || norm(i.de).includes(norm(q)))), [q,items]);
  const del = (id) => { if (confirm("Eintrag löschen?")) setItems(prev=>prev.filter(i=>i.id!==id)); };
  const toggle = (id) => { setItems(prev=>prev.map(i=>i.id===id ? {...i, suspended: !i.suspended} : i)); };
  return (<div className="card">
    <div className="grid">
      <input className="input" placeholder="Suchen…" value={q} onChange={e=>setQ(e.target.value)}/>
      <div className="muted">{filtered.length} / {items.length} Treffer</div>
    </div>
    <div style={{overflowX:'auto', marginTop:8}}>
      <table>
        <thead><tr><th>Italienisch</th><th>Deutsch</th><th>Fällig</th><th>Streak</th><th>Aktionen</th></tr></thead>
        <tbody>
          {filtered.map(i => (
            <tr key={i.id}>
              <td><b>{i.it}</b></td>
              <td>{i.de}</td>
              <td className="muted">{i.dueAt ? new Date(i.dueAt).toLocaleString() : "–"}</td>
              <td>{i.streak ?? 0}</td>
              <td>
                <button className="btn ghost" onClick={()=>toggle(i.id)}>{i.suspended ? "Reaktivieren" : "Pausieren"}</button>
                <button className="btn ghost" onClick={()=>del(i.id)}>Löschen</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>);
};

const SettingsView = ({ items, setItems, settings, setSettings }) => {
  const { useState } = React;
  const [importText,setImportText]=useState("");
  const exportData = () => { const blob = new Blob([JSON.stringify({items,settings}, null, 2)], {type:"application/json"}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='vokabeln.json'; a.click(); URL.revokeObjectURL(url); };
  const importData = () => { try { const p = JSON.parse(importText); if (!Array.isArray(p.items)) throw new Error("Ungültiges Format"); setItems(p.items); if (p.settings) setSettings(p.settings); alert("Import ok."); } catch(e) { alert("Import fehlgeschlagen: " + (e.message||e)); } };
  return (<div className="grid">
    <div className="card">
      <h3>Einstellungen</h3>
      <div className="grid grid-2">
        <label>Neue Karten pro Sitzung<input type="number" className="input" value={settings.newPerSession} onChange={e=>setSettings({...settings,newPerSession:Number(e.target.value)})}/></label>
        <label>Max. Wiederholungen pro Sitzung<input type="number" className="input" value={settings.maxReviews} onChange={e=>setSettings({...settings,maxReviews:Number(e.target.value)})}/></label>
      </div>
    </div>
    <div className="card">
      <h3>Daten</h3>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        <button className="btn ghost" onClick={exportData}>Export als JSON</button>
        <button className="btn ghost" onClick={()=>{ if (confirm('Alle Daten löschen?')) setItems([]) }}>Alles löschen</button>
      </div>
      <div style={{marginTop:10}}>
        <label>JSON importieren</label>
        <textarea className="input" rows="6" value={importText} onChange={e=>setImportText(e.target.value)} placeholder='{"items":[{"it":"ciao","de":"hallo"}], "settings":{}}'></textarea>
        <button className="btn primary" onClick={importData}>Import starten</button>
      </div>
    </div>
  </div>);
};

const defaultSettings = () => ({ newPerSession: 10, maxReviews: 100 });
const demoSeed = () => { const t = now(); const m = (it,de,notes)=>({id:uid(),it,de,notes,createdAt:t,dueAt:t,intervalIndex:0,streak:0,suspended:false}); return [ m("ciao","hallo; tschüss","begrüssung"), m("grazie","danke"), m("per favore","bitte"), m("come stai?","wie geht's?"), m("acqua","Wasser"), m("pane","Brot"), m("vino","Wein") ]; };

const App = () => {
  const [tab,setTab] = useState("learn");
  const [items,setItems] = useState(() => loadState()?.items || demoSeed());
  const [settings,setSettings] = useState(() => loadState()?.settings || defaultSettings());
  useEffect(()=>saveState({items,settings}),[items,settings]);
  return (<div className="grid">
    <Tabs tab={tab} setTab={setTab}/>
    {tab==='learn' && <LearnView items={items} setItems={setItems}/>}
    {tab==='list' && <ListView items={items} setItems={setItems}/>}
    {tab==='add' && <AddView onAdd={(i)=>setItems(p=>[i,...p])}/>}
    {tab==='settings' && <SettingsView items={items} setItems={setItems} settings={settings} setSettings={setSettings}/>}
    <div className="muted">Speicherung lokal im Browser. Für Backups: Einstellungen → Export.</div>
  </div>);
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
