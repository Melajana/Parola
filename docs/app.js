// Parola vanilla JS app (localStorage persistence)
const LS_KEY = 'parola:i1';

function loadState() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch { return null; }
}
function saveState(state) { localStorage.setItem(LS_KEY, JSON.stringify(state)); }

function uid() { return Math.random().toString(36).slice(2); }
function now() { return Date.now(); }
function minutes(n){ return n*60*1000; }

const defaultItems = [
  { id: uid(), it: 'ciao', de: 'hallo; tschüss', notes:'begrüssung', dueAt: now()+minutes(10), streak:0, suspended:false },
  { id: uid(), it: 'grazie', de: 'danke', dueAt: now()+minutes(10), streak:0, suspended:false },
  { id: uid(), it: 'per favore', de: 'bitte', dueAt: now()+minutes(10), streak:1, suspended:false },
];

const state = loadState() || { items: defaultItems, settings: { newPerSession:10, maxReviews:100 } };
saveState(state);

// ------ Tabs ------
const tabsEl = document.getElementById('tabs');
const views = {
  learn: document.getElementById('view-learn'),
  list: document.getElementById('view-list'),
  add: document.getElementById('view-add'),
  settings: document.getElementById('view-settings'),
};
tabsEl.addEventListener('click', (e)=>{
  const btn = e.target.closest('button[data-tab]');
  if (!btn) return;
  const tab = btn.dataset.tab;
  for (const b of tabsEl.querySelectorAll('button')) b.classList.toggle('active', b===btn);
  Object.entries(views).forEach(([id,el]) => el.hidden = id!==tab);
});

// ------ List rendering ------
const tbody = document.getElementById('tableBody');
const searchInput = document.getElementById('searchInput');
const countTxt = document.getElementById('countTxt');
const dueCounter = document.getElementById('dueCounter');

function renderList() {
  const q = (searchInput.value || '').toLowerCase();
  const filtered = state.items.filter(i => (i.it.toLowerCase().includes(q) || i.de.toLowerCase().includes(q)));
  countTxt.textContent = `${filtered.length} / ${state.items.length}`;
  const due = state.items.filter(i => !i.suspended && i.dueAt <= now());
  dueCounter.textContent = due.length ? `Fällig: ${due.length}` : 'Nichts fällig';

  tbody.innerHTML = '';
  for (const it of filtered) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><b>${it.it}</b></td>
      <td>${it.de}</td>
      <td class="muted">${new Date(it.dueAt).toLocaleString()}</td>
      <td>${it.streak||0}</td>
      <td class="td-actions">
        <button class="btn ghost" data-action="toggle" data-id="${it.id}">${it.suspended?'Reaktivieren':'Pausieren'}</button>
        <button class="btn ghost" data-action="delete" data-id="${it.id}">Löschen</button>
      </td>`;
    tbody.appendChild(tr);
  }
}
searchInput.addEventListener('input', renderList);
tbody.addEventListener('click', (e)=>{
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  const item = state.items.find(i=>i.id===id);
  if (!item) return;
  if (btn.dataset.action==='delete') {
    if (!confirm('Eintrag löschen?')) return;
    state.items = state.items.filter(i=>i.id!==id);
  } else if (btn.dataset.action==='toggle') {
    item.suspended = !item.suspended;
  }
  saveState(state);
  renderList();
});

// ------ Add Form ------
const itInput = document.getElementById('itInput');
const deInput = document.getElementById('deInput');
const notesInput = document.getElementById('notesInput');
document.getElementById('addBtn').addEventListener('click', ()=>{
  const it = itInput.value.trim();
  const de = deInput.value.trim();
  const notes = notesInput.value.trim();
  if (!it || !de) return alert('Bitte IT & DE ausfüllen.');
  state.items.unshift({ id: uid(), it, de, notes: notes||undefined, dueAt: now(), streak:0, suspended:false });
  saveState(state);
  itInput.value = ''; deInput.value=''; notesInput.value='';
  // switch to list
  tabsEl.querySelector('[data-tab="list"]').click();
  renderList();
});
document.getElementById('resetBtn').addEventListener('click', ()=>{
  itInput.value=''; deInput.value=''; notesInput.value='';
});

// ------ Learn View (very simple demo: pick first due) ------
const learnWord = document.getElementById('learnWord');
const speakBtn = document.getElementById('speakBtn');
function updateLearn() {
  const due = state.items.filter(i => !i.suspended && i.dueAt <= now());
  if (!due.length) { learnWord.textContent = '🎉 Nichts fällig!'; return; }
  learnWord.textContent = due[0].it;
}
speakBtn.addEventListener('click', ()=>{
  const text = learnWord.textContent;
  if (!('speechSynthesis' in window)) return alert('Sprachausgabe nicht unterstützt.');
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'it-IT';
  speechSynthesis.speak(u);
});
document.getElementById('againBtn')?.addEventListener('click', ()=>{
  const current = state.items.find(i => i.it === learnWord.textContent);
  if (current) { current.dueAt = now()+minutes(5); current.streak = 0; saveState(state); updateLearn(); renderList(); }
});
document.getElementById('goodBtn')?.addEventListener('click', ()=>{
  const current = state.items.find(i => i.it === learnWord.textContent);
  if (current) { current.dueAt = now()+minutes(60); current.streak = (current.streak||0)+1; saveState(state); updateLearn(); renderList(); }
});

// ------ Settings ------
document.getElementById('exportBtn').addEventListener('click', ()=>{
  const data = JSON.stringify(state, null, 2);
  navigator.clipboard.writeText(data).then(()=>alert('JSON in Zwischenablage.'));
});
document.getElementById('importBtn').addEventListener('click', async ()=>{
  try {
    const text = await navigator.clipboard.readText();
    const obj = JSON.parse(text);
    if (!obj || !Array.isArray(obj.items)) throw new Error('Ungültig');
    state.items = obj.items;
    if (obj.settings) state.settings = obj.settings;
    saveState(state);
    renderList(); updateLearn();
    alert('Import ok.');
  } catch (e) { alert('Import fehlgeschlagen.'); }
});
document.getElementById('clearBtn').addEventListener('click', ()=>{
  if (!confirm('Alle Daten löschen?')) return;
  state.items = []; saveState(state); renderList(); updateLearn();
});

// Init
renderList(); updateLearn();
