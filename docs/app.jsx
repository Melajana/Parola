/* Parola – React App (no Service Worker, clean split) */
const { useState, useEffect, useMemo } = React;

const LS_KEY = "parola:clean";
const DATE_FMT = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
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
  const [mode, setMode] = useState("flashcards");
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
    <div className="card">
      <div style={{display:'flex', gap:8, alignItems:'center', justifyContent:'space-between'}}>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <span className="chip">Modus</span>
          <select value={mode} onChange={e=>setMode(e.target.value)} className="input" style={{width:'auto'}}>
            <option value="flashcards">Flashcards</option>
            <option value="mc">Multiple Choice</option>
            <option value="typing">Tippen</option>
          </select>
        </div>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <span className="chip">Richtung</span>
          <select value={direction} onChange={e=>setDirection(e.target.value)} className="input" style={{width:'auto'}}>
            <option value="it-de">Italienisch → Deutsch</option>
            <option value="de-it">Deutsch → Italienisch</option>
          </select>
        </div>
      </div>
    </div>
    {mode === "flashcards" && (
      <div className="card" style={{textAlign:'center'}}>
        <div className="muted" style={{marginBottom:8}}>{direction === 'it-de' ? 'Frage (IT)' : 'Frage (DE)'} – Intervall: {formatInterval(INTERVALS[current.intervalIndex ?? 0])}</div>
        <div style={{fontSize:32, fontWeight:800,fontFamily:'Nunito'}}>{q}</div>
        <button className="speaker-icon" aria-label="Vorlesen" onClick={()=>speak(direction==='it-de' ? current.it : current.de, direction==='it-de' ? 'it-IT' : 'de-DE')}>
          <svg className="icon-audio" viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
            <path fill="currentColor" d="M3 10v4h3l4 4V6L6 10H3zm13.5 2a4.5 4.5 0 0 0-2.06-3.78l-.44.9a3.5 3.5 0 0 1 0 5.76l.44.9A4.5 4.5 0 0 0 16.5 12zm3 0c0-3.04-1.72-5.66-4.25-7.01l-.44.9C17 7.04 18.5 9.32 18.5 12s-1.5 4.96-3.69 6.11l.44.9C20.28 17.66 22 15.04 22 12z"/>
          </svg>
        </button>
        {reveal && <div style={{marginTop:10, fontSize:22}}><b>Antwort:</b> {a}</div>}
        <div style={{marginTop:14}}><button className="btn ghost" onClick={()=>setReveal(r=>!r)}>{reveal ? "Vorderseite" : "Auflösung zeigen"}</button></div>
        <div style={{display:'flex', gap:8, marginTop:16}}>
          <button className="btn ghost" onClick={()=>mark('again')}>Wiederholen</button>
          <button className="btn primary" onClick={()=>mark('good')}>Gewusst</button>
        </div>
      </div>
    )}
    {mode === "mc" && <MultipleChoice current={current} direction={direction} a={a} q={q} items={items} onResult={(res)=>mark(res)} /> }
    {mode === "typing" && <Typing current={current} direction={direction} a={a} q={q} onResult={(res)=>mark(res)} /> }
  </div>);
};

const MultipleChoice = ({ current, q, a, items, direction, onResult }) => {
  const { useState, useMemo } = React;
  const options = useMemo(() => { const pool = shuffle(items.filter(i=>i.id!==current.id)).slice(0,3).map(i => direction==='it-de' ? i.de : i.it); return shuffle([a, ...pool]); }, [current.id, items, a, direction]);
  const [done, setDone] = useState(false);
  const pick = (opt) => { if (done) return; setDone(true); onResult(norm(opt)===norm(a) ? 'good' : 'again'); };
  return (<div className="card" style={{textAlign:'center'}}>
    <div className="muted" style={{marginBottom:8}}>Multiple Choice – Frage</div>
    <div style={{fontSize:32,fontWeight:800,fontFamily:'Nunito'}}>{q}</div>
    <div style={{display:'grid', gap:8, marginTop:16}}>{options.map(opt => (<button key={opt} className="btn ghost" onClick={()=>pick(opt)}>{opt}</button>))}</div>
  </div>);
};

const Typing = ({ q, a, onResult, direction, current }) => {
  const { useState } = React;
  const [val, setVal] = useState(""); const [feedback, setFeedback] = useState(null);
  const submit = (e) => { e.preventDefault(); const ok = norm(val) === norm(a); setFeedback(ok ? "Richtig!" : ("Gesucht: " + a)); onResult(ok ? 'good' : 'again'); };
  return (<form className="card" onSubmit={submit} style={{textAlign:'center'}}>
    <div className="muted" style={{marginBottom:8}}>Tippe die Übersetzung</div>
    <div style={{fontSize:32,fontWeight:800,fontFamily:'Nunito'}}>{q}</div>
    <div style={{marginTop:12}}><input className="input" autoFocus value={val} onChange={e=>setVal(e.target.value)} placeholder="Antwort eingeben..." /></div>
    <div style={{display:'flex', gap:8, justifyContent:'center', marginTop:12}}>
      <button className="btn primary" type="submit">Prüfen</button>
      <button className="speaker-icon" type="button" onClick={()=>speak(direction==='it-de' ? current.it : current.de, direction==='it-de' ? 'it-IT' : 'de-DE')}>
        <svg className="icon-audio" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
          <path fill="currentColor" d="M3 10v4h3l4 4V6L6 10H3zm13.5 2a4.5 4.5 0 0 0-2.06-3.78l-.44.9a3.5 3.5 0 0 1 0 5.76l.44.9A4.5 4.5 0 0 0 16.5 12zm3 0c0-3.04-1.72-5.66-4.25-7.01l-.44.9C17 7.04 18.5 9.32 18.5 12s-1.5 4.96-3.69 6.11l.44.9C20.28 17.66 22 15.04 22 12z"/>
        </svg>
      </button>
    </div>
    {feedback && <div style={{marginTop:12}} className="chip">{feedback}</div>}
  </form>);
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
              <td className="muted">{i.dueAt ? DATE_FMT.format(i.dueAt) : "–"}</td>
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

const formatInterval = (ms) => { if (ms < 3600000) return Math.round(ms/60000)+' min'; if (ms < 86400000) return Math.round(ms/3600000)+' h'; return Math.round(ms/86400000)+' d'; };

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
