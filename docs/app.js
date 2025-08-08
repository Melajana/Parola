// Parola SRS + Direction + Multiple Choice (vanilla JS)
const LS_KEY = 'parola:srs2';
const MIN = 60*1000, DAY = 24*60*60*1000;
const INTERVALS = [10*MIN, 1*DAY, 3*DAY, 7*DAY, 16*DAY];

const state = load() || seed();
state.settings = state.settings || { newPerSession:10, maxReviews:100, direction:'it-de', mode:'flashcards' };
save();

// Helpers
function load(){ try { return JSON.parse(localStorage.getItem(LS_KEY)||'null'); } catch { return null; } }
function save(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }
function uid(){ return Math.random().toString(36).slice(2); }
function now(){ return Date.now(); }
function fmtInterval(ms){ if(ms < 60*MIN) return Math.round(ms/MIN)+' min'; if(ms < DAY) return Math.round(ms/(60*MIN))+' h'; return Math.round(ms/DAY)+' d'; }
function nextSchedule(card, result){ let idx = Math.max(0, Math.min(INTERVALS.length-1, card.intervalIndex ?? 0)); let streak = card.streak ?? 0; if(result==='good'){ idx=Math.min(INTERVALS.length-1, idx+1); streak+=1; } else { idx=0; streak=0; } return { ...card, intervalIndex: idx, streak, dueAt: now()+INTERVALS[idx] }; }
function seed(){ const t=now(); const m=(it,de,notes)=>({id:uid(),it,de,notes,createdAt:t,dueAt:t,intervalIndex:0,streak:0,suspended:false}); return { items:[ m('ciao','hallo; tschüss','begrüssung'), m('grazie','danke'), m('per favore','bitte'), m('come stai?','wie geht\\'s?'), m('acqua','Wasser'), m('pane','Brot'), m('vino','Wein') ], settings:{ newPerSession:10, maxReviews:100, direction:'it-de', mode:'flashcards' } }; }
function norm(s){ return (s||'').toLowerCase().normalize('NFD').replace(/\\p{Diacritic}/gu,''); }
function shuffle(a){ return a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]); }

// Tabs
const tabsEl = document.getElementById('tabs');
const views = { learn: byId('view-learn'), list: byId('view-list'), add: byId('view-add'), settings: byId('view-settings') };
tabsEl.addEventListener('click', e=>{ const btn=e.target.closest('button[data-tab]'); if(!btn) return; tabsEl.querySelectorAll('button').forEach(b=>b.classList.toggle('active', b===btn)); const tab=btn.dataset.tab; Object.entries(views).forEach(([id,el])=>el.hidden=id!==tab); if(tab==='learn') updateLearn(); if(tab==='list') renderList(); });

// Elements
const learnWord = byId('learnWord'), learnMeta = byId('learnMeta'), answerBox = byId('answerBox'), dueCounter = byId('dueCounter');
const fcActions = byId('fcActions'), mcActions = byId('mcActions'), mcBox = byId('mcBox');
const modeSelect = byId('modeSelect'), dirSelect = byId('dirSelect');
modeSelect.value = state.settings.mode || 'flashcards';
dirSelect.value = state.settings.direction || 'it-de';
modeSelect.addEventListener('change', ()=>{ state.settings.mode = modeSelect.value; save(); updateLearn(); });
dirSelect.addEventListener('change', ()=>{ state.settings.direction = dirSelect.value; save(); updateLearn(); });

// List
const tbody = byId('tableBody'), searchInput = byId('searchInput'), countTxt = byId('countTxt');
searchInput?.addEventListener('input', renderList);
tbody?.addEventListener('click', e=>{ const btn=e.target.closest('button[data-action]'); if(!btn) return; const id=btn.dataset.id; const card=state.items.find(i=>i.id===id); if(!card) return; if(btn.dataset.action==='delete'){ if(!confirm('Eintrag löschen?')) return; state.items=state.items.filter(i=>i.id!==id); } else { card.suspended=!card.suspended; } save(); renderList(); updateLearn(); });

function renderList(){ const q=(searchInput.value||'').toLowerCase(); const filtered=state.items.filter(i=> norm(i.it).includes(q)||norm(i.de).includes(q) ); countTxt.textContent=`${filtered.length} / ${state.items.length}`; const due = state.items.filter(i=>!i.suspended && (i.dueAt||0)<=now()); dueCounter.textContent = due.length ? `Fällig: ${due.length}` : 'Nichts fällig'; tbody.innerHTML=''; for(const it of filtered){ const tr=document.createElement('tr'); const dueAt = it.dueAt? new Date(it.dueAt).toLocaleString() : '–'; tr.innerHTML=`<td><b>${it.it}</b></td><td>${it.de}</td><td class="muted">${dueAt}</td><td>${it.streak||0}</td><td class="td-actions"><button class="btn ghost" data-action="toggle" data-id="${it.id}">${it.suspended?'Reaktivieren':'Pausieren'}</button><button class="btn ghost" data-action="delete" data-id="${it.id}">Löschen</button></td>`; tbody.appendChild(tr);} }

// Add
const itInput = byId('itInput'), deInput = byId('deInput'), notesInput = byId('notesInput');
byId('addBtn')?.addEventListener('click', ()=>{ const it=itInput.value.trim(), de=deInput.value.trim(), notes=notesInput.value.trim(); if(!it||!de) return alert('Bitte IT & DE ausfüllen.'); state.items.unshift({id:uid(), it, de, notes:notes||undefined, createdAt:now(), dueAt:now(), intervalIndex:0, streak:0, suspended:false}); save(); itInput.value=''; deInput.value=''; notesInput.value=''; tabsEl.querySelector('[data-tab="list"]').click(); });
byId('resetBtn')?.addEventListener('click', ()=>{ itInput.value=''; deInput.value=''; notesInput.value=''; });

// Learn
let currentId=null, lastCorrect=false;
byId('revealBtn')?.addEventListener('click', ()=>{ if(!currentId) return; const c=cardById(currentId); const answer = dir() === 'it-de' ? c.de : c.it; answerBox.textContent = 'Antwort: ' + answer; answerBox.style.display='block'; });
byId('againBtn')?.addEventListener('click', ()=>grade('again'));
byId('goodBtn')?.addEventListener('click', ()=>grade('good'));
byId('skipBtn')?.addEventListener('click', ()=>{ currentId=null; updateLearn(); });
byId('nextBtn')?.addEventListener('click', ()=>{ grade(lastCorrect? 'good':'again'); });

byId('speakBtn')?.addEventListener('click', ()=>{ if(!('speechSynthesis' in window)) return alert('Sprachausgabe nicht unterstützt.'); const text = learnWord.textContent; const u = new SpeechSynthesisUtterance(text); u.lang = dir()==='it-de' ? 'it-IT' : 'de-DE'; speechSynthesis.speak(u); });

function cardById(id){ return state.items.find(i=>i.id===id); }
function dir(){ return state.settings.direction || 'it-de'; }
function mode(){ return state.settings.mode || 'flashcards'; }

function pickDue(){ const due=state.items.filter(i=>!i.suspended && (i.dueAt||0)<=now()); if(!due.length) return null; due.sort((a,b)=>(a.dueAt||0)-(b.dueAt||0)); return due[0]; }

function updateLearn(){
  const card = pickDue();
  const m = mode();
  // toggle controls
  const fc = (m==='flashcards');
  fcActions.style.display = fc? 'flex':'none';
  mcActions.style.display = fc? 'none':'flex';
  mcBox.style.display = fc? 'none':'grid';
  answerBox.style.display='none'; answerBox.textContent='';
  byId('nextBtn').disabled = true;

  if(!card){ learnWord.textContent='🎉 Nichts fällig!'; learnMeta.textContent='—'; dueCounter.textContent='Nichts fällig'; currentId=null; mcBox.innerHTML=''; return; }
  currentId = card.id;

  const q = dir()==='it-de' ? card.it : card.de;
  const a = dir()==='it-de' ? card.de : card.it;
  learnWord.textContent = q;
  const interval = INTERVALS[card.intervalIndex ?? 0];
  learnMeta.textContent = (dir()==='it-de' ? 'Frage (IT)' : 'Frage (DE)') + ' – Intervall: ' + fmtInterval(interval);
  const due = state.items.filter(i=>!i.suspended && (i.dueAt||0)<=now());
  dueCounter.textContent = `Fällig: ${due.length}`;

  if(m==='mc'){
    // build options (1 correct + up to 3 distractors)
    const pool = shuffle(state.items.filter(i=>i.id!==card.id));
    const distractors = pool.slice(0,3).map(x => dir()==='it-de' ? x.de : x.it);
    const options = shuffle([a, ...distractors]);
    mcBox.innerHTML = '';
    options.forEach(opt => {
      const b = document.createElement('button');
      b.type='button';
      b.className = 'mc-option';
      b.textContent = opt;
      b.addEventListener('click', ()=>{
        if(b.classList.contains('correct')||b.classList.contains('wrong')) return;
        const ok = norm(opt) === norm(a);
        lastCorrect = ok;
        b.classList.add(ok ? 'correct' : 'wrong');
        // mark the correct one
        if(!ok){
          [...mcBox.children].forEach(btn=>{
            if(norm(btn.textContent)===norm(a)) btn.classList.add('correct');
          });
        }
        byId('nextBtn').disabled = false;
      });
      mcBox.appendChild(b);
    });
  }
}

function grade(result){
  if(!currentId) return;
  const idx = state.items.findIndex(i=>i.id===currentId);
  if(idx<0) return;
  state.items[idx] = nextSchedule(state.items[idx], result);
  save();
  currentId=null;
  updateLearn(); renderList();
}

// Settings export/import/clear
byId('exportBtn')?.addEventListener('click', ()=>{ const data=JSON.stringify(state,null,2); navigator.clipboard.writeText(data).then(()=>alert('JSON in Zwischenablage.')); });
byId('importBtn')?.addEventListener('click', async ()=>{ try { const text=await navigator.clipboard.readText(); const obj=JSON.parse(text); if(!obj||!Array.isArray(obj.items)) throw new Error('Ungültig'); state.items=obj.items; if(obj.settings) state.settings=obj.settings; save(); renderList(); updateLearn(); alert('Import ok.'); } catch(e){ alert('Import fehlgeschlagen.'); } });
byId('clearBtn')?.addEventListener('click', ()=>{ if(!confirm('Alle Daten löschen?')) return; state.items=[]; save(); renderList(); updateLearn(); });

// Utils
function byId(id){ return document.getElementById(id); }

// Init
renderList(); updateLearn();
