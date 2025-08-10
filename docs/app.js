// SRS11: spacing polish; due-cell class for flexible layout
const LS_KEY='parola:srs11';
const MIN=60*1000,DAY=24*60*60*1000;
const INTERVALS=[10*MIN,1*DAY,3*DAY,7*DAY,16*DAY];
const state=load()||seed();state.settings=Object.assign({newPerSession:10,maxReviews:100,direction:'it-de',mode:'flashcards',tolerance:20,sortBy:'default',autoSpeak:false,speechRate:0.8,autoFlip:false},state.settings||{});save();
function load(){try{return JSON.parse(localStorage.getItem(LS_KEY)||'null')}catch{return null}}
function save(){localStorage.setItem(LS_KEY,JSON.stringify(state))}
function uid(){return Math.random().toString(36).slice(2)}
function now(){return Date.now()}
function nextSchedule(c,res){let idx=Math.max(0,Math.min(INTERVALS.length-1,c.intervalIndex??0)),st=c.streak??0;if(res==='good'){idx=Math.min(INTERVALS.length-1,idx+1);st++}else{idx=0;st=0}const attempts=(c.attempts||0)+1,correct=(c.correct||0)+(res==='good'?1:0);return {...c,intervalIndex:idx,streak:st,dueAt:now()+INTERVALS[idx],attempts,correct}}
function seed(){const t=now();const m=(it,de,notes,type='vocab',extra,category)=>({id:uid(),it,de,notes,type,extra,category,createdAt:t,dueAt:t,intervalIndex:0,streak:0,suspended:false,attempts:0,correct:0});return{items:[
// Vokabeln - Familie
m('ciao','hallo; tschüss','','vocab',null,'greetings'),m('grazie','danke','','vocab',null,'greetings'),m('per favore','bitte','','vocab',null,'greetings'),m('come stai?','wie geht\'s?','','vocab',null,'greetings'),
// Vokabeln - Essen
m('acqua','Wasser','f. - l\'acqua','vocab',{article:'l\'',gender:'f'},'food'),m('pane','Brot','m. - il pane','vocab',{article:'il',gender:'m'},'food'),m('vino','Wein','m. - il vino','vocab',{article:'il',gender:'m'},'food'),m('pizza','Pizza','f. - la pizza','vocab',{article:'la',gender:'f'},'food'),m('gelato','Eis','m. - il gelato','vocab',{article:'il',gender:'m'},'food'),
// Vokabeln - Familie  
m('padre','Vater','m. - il padre','vocab',{article:'il',gender:'m'},'family'),m('madre','Mutter','f. - la madre','vocab',{article:'la',gender:'f'},'family'),m('figlio','Sohn','m. - il figlio','vocab',{article:'il',gender:'m'},'family'),m('figlia','Tochter','f. - la figlia','vocab',{article:'la',gender:'f'},'family'),
// Präpositionen
m('a','zu, nach, in','Ortsangabe','prep',{contexts:['Vado ___ scuola','Penso ___ te','Arrivo ___ Milano']},'grammar'),m('di','von, aus','Besitz/Herkunft','prep',{contexts:['Il libro ___ Maria','Sono ___ Roma','Parlo ___ te']},'grammar'),m('da','von, seit, bei','Ausgangspunkt','prep',{contexts:['Vengo ___ casa','Aspetto ___ ieri','Vado ___ medico']},'grammar'),m('in','in, nach','Richtung/Ort','prep',{contexts:['Siamo ___ Italia','Vivo ___ città','Studio ___ biblioteca']},'grammar'),m('con','mit','Begleitung','prep',{contexts:['Vengo ___ te','Parlo ___ lui','Mangio ___ gli amici']},'grammar'),m('per','für, durch','Zweck/Richtung','prep',{contexts:['Questo è ___ te','Parto ___ Roma','Studio ___ l\'esame']},'grammar'),
// Verben - erweitert
m('essere','sein','io sono, tu sei, lui/lei è, noi siamo, voi siete, loro sono','verb',{infinitive:'essere',conjugations:{presente:{io:'sono',tu:'sei',lui:'è',lei:'è',noi:'siamo',voi:'siete',loro:'sono'},passato_prossimo:{io:'sono stato/a',tu:'sei stato/a',lui:'è stato',lei:'è stata',noi:'siamo stati/e',voi:'siete stati/e',loro:'sono stati/e'},imperfetto:{io:'ero',tu:'eri',lui:'era',lei:'era',noi:'eravamo',voi:'eravate',loro:'erano'}}},'verbs'),
m('avere','haben','io ho, tu hai, lui/lei ha, noi abbiamo, voi avete, loro hanno','verb',{infinitive:'avere',conjugations:{presente:{io:'ho',tu:'hai',lui:'ha',lei:'ha',noi:'abbiamo',voi:'avete',loro:'hanno'},passato_prossimo:{io:'ho avuto',tu:'hai avuto',lui:'ha avuto',lei:'ha avuto',noi:'abbiamo avuto',voi:'avete avuto',loro:'hanno avuto'},imperfetto:{io:'avevo',tu:'avevi',lui:'aveva',lei:'aveva',noi:'avevamo',voi:'avevate',loro:'avevano'}}},'verbs'),
m('parlare','sprechen','io parlo, tu parli, lui/lei parla, noi parliamo, voi parlate, loro parlano','verb',{infinitive:'parlare',conjugations:{presente:{io:'parlo',tu:'parli',lui:'parla',lei:'parla',noi:'parliamo',voi:'parlate',loro:'parlano'},passato_prossimo:{io:'ho parlato',tu:'hai parlato',lui:'ha parlato',lei:'ha parlato',noi:'abbiamo parlato',voi:'avete parlato',loro:'hanno parlato'},imperfetto:{io:'parlavo',tu:'parlavi',lui:'parlava',lei:'parlava',noi:'parlavamo',voi:'parlavate',loro:'parlavano'}}},'verbs'),
m('mangiare','essen','io mangio, tu mangi, lui/lei mangia, noi mangiamo, voi mangiate, loro mangiano','verb',{infinitive:'mangiare',conjugations:{presente:{io:'mangio',tu:'mangi',lui:'mangia',lei:'mangia',noi:'mangiamo',voi:'mangiate',loro:'mangiano'},passato_prossimo:{io:'ho mangiato',tu:'hai mangiato',lui:'ha mangiato',lei:'ha mangiato',noi:'abbiamo mangiato',voi:'avete mangiato',loro:'hanno mangiato'},imperfetto:{io:'mangiavo',tu:'mangiavi',lui:'mangiava',lei:'mangiava',noi:'mangiavamo',voi:'mangiavate',loro:'mangiavano'}}},'verbs'),
// Artikel-Training
m('ragazzo','der Junge','m. - il ragazzo','article',{article:'il',gender:'m',word:'ragazzo'},'articles'),m('ragazza','das Mädchen','f. - la ragazza','article',{article:'la',gender:'f',word:'ragazza'},'articles'),m('studente','der Student','m. - lo studente','article',{article:'lo',gender:'m',word:'studente'},'articles'),m('università','die Universität','f. - l\'università','article',{article:'l\'',gender:'f',word:'università'},'articles')
],settings:{newPerSession:10,maxReviews:100,direction:'it-de',mode:'flashcards',tolerance:20,sortBy:'default',cardTypes:['vocab','prep','verb','article'],categories:['all','greetings','food','family','grammar','verbs','articles'],verbTenses:['presente','passato_prossimo','imperfetto'],autoSpeak:false,speechRate:0.8,autoFlip:false},history:[],achievements:[],dailyGoal:20,streak:0}};
function norm(s){return(s||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9äöüß ]/gi,'').trim()}
function shuffle(a){return a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1])}
function byId(id){return document.getElementById(id)}
function todayKey(d=new Date()){d=new Date(d);d.setHours(0,0,0,0);return d.toISOString().slice(0,10)}
function addHistory(r){const k=todayKey();let row=state.history.find(x=>x.d===k);if(!row){row={d:k,good:0,bad:0};state.history.push(row)}if(r==='good')row.good++;else row.bad++;checkAchievements(r);save()}

function checkAchievements(result){const achievements=[
{id:'first_word',name:'Erste Schritte',desc:'Erstes Wort gelernt',icon:'🌱',condition:()=>getTotalLearned()>=1},
{id:'streak_3',name:'Auf dem Weg',desc:'3 Tage in Folge gelernt',icon:'🔥',condition:()=>calcStreak()>=3},
{id:'streak_7',name:'Woche geschafft!',desc:'7 Tage Streak erreicht',icon:'🚀',condition:()=>calcStreak()>=7},
{id:'streak_30',name:'Monats-Meister',desc:'30 Tage Streak!',icon:'👑',condition:()=>calcStreak()>=30},
{id:'vocab_master',name:'Vokabel-Profi',desc:'50 Vokabeln gemeistert',icon:'📚',condition:()=>getCategoryCount('vocab','good')>=50},
{id:'verb_master',name:'Verb-Experte',desc:'Alle 3 Zeiten gemeistert',icon:'⚡',condition:()=>hasAllVerbTenses()},
{id:'article_expert',name:'Artikel-Ass',desc:'Alle Artikel perfekt',icon:'🎯',condition:()=>getCategoryCount('article','good')>=10},
{id:'perfect_day',name:'Perfekter Tag',desc:'20 richtige Antworten an einem Tag',icon:'⭐',condition:()=>getTodayCorrect()>=20},
{id:'speed_demon',name:'Schnell-Lerner',desc:'10 Antworten in 5 Minuten',icon:'💨',condition:()=>checkSpeedLearning()},
{id:'polyglot',name:'Polyglott',desc:'100 Wörter gelernt',icon:'🌍',condition:()=>getTotalLearned()>=100}
];
let newAchievements=[];achievements.forEach(ach=>{if(!state.achievements.includes(ach.id)&&ach.condition()){state.achievements.push(ach.id);newAchievements.push(ach)}});
if(newAchievements.length>0){showAchievementNotification(newAchievements)}}

function getTotalLearned(){return state.history.reduce((sum,day)=>(sum+(day.good||0)+(day.bad||0)),0)}
function getTodayCorrect(){const today=state.history.find(x=>x.d===todayKey());return today?(today.good||0):0}
function getCategoryCount(category,type){return state.items.filter(i=>i.category===category&&((type==='good'&&(i.correct||0)>0)||type==='all')).length}
function hasAllVerbTenses(){const verbs=state.items.filter(i=>i.type==='verb');return verbs.some(v=>v.extra?.conjugations?.presente&&v.extra?.conjugations?.passato_prossimo&&v.extra?.conjugations?.imperfetto)}
function checkSpeedLearning(){if(!state.speedSession)return false;const now=Date.now();return state.speedSession.count>=10&&(now-state.speedSession.start)<300000}

function showAchievementNotification(achievements){achievements.forEach(ach=>{const notification=document.createElement('div');notification.className='achievement-notification';notification.innerHTML=`<div class="achievement-popup"><span class="achievement-icon">${ach.icon}</span><div><strong>${ach.name}</strong><br><small>${ach.desc}</small></div></div>`;document.body.appendChild(notification);setTimeout(()=>notification.remove(),4000)})}
function successPct(it){const a=it.attempts||0,c=it.correct||0;return a?Math.round((c/a)*100):null}
function levenshtein(a,b){const m=a.length,n=b.length,dp=Array.from({length:m+1},(_,i)=>Array(n+1).fill(0));for(let i=0;i<=m;i++)dp[i][0]=i;for(let j=0;j<=n;j++)dp[0][j]=j;for(let i=1;i<=m;i++){for(let j=1;j<=n;j++){const cost=a[i-1]===b[j-1]?0:1;dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+cost)}}return dp[m][n]}
function isClose(a,b){const A=norm(a),B=norm(b);if(!A||!B)return false;if(A===B)return true;const dist=levenshtein(A,B);const tol=Math.max(0,Math.round((state.settings.tolerance||20)/100*B.length));return dist<=tol}
const tabsEl=byId('tabs'),views={learn:byId('view-learn'),list:byId('view-list'),add:byId('view-add'),settings:byId('view-settings')};
tabsEl.addEventListener('click',e=>{const btn=e.target.closest('button[data-tab]');if(!btn)return;tabsEl.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===btn));const tab=btn.dataset.tab;Object.entries(views).forEach(([id,el])=>el.hidden=id!==tab);if(tab==='learn')updateLearn();if(tab==='list')renderList();if(tab==='settings')renderStats()});
const learnWord=byId('learnWord'),learnMeta=byId('learnMeta'),answerBox=byId('answerBox'),dueCounter=byId('dueCounter'),fcActions=byId('fcActions'),mcActions=byId('mcActions'),mcBox=byId('mcBox'),typeBox=byId('typeBox'),typeInput=byId('typeInput'),typeFeedback=byId('typeFeedback'),modeSelect=byId('modeSelect'),dirSelect=byId('dirSelect'),cardTypeSelect=byId('cardTypeSelect'),categorySelect=byId('categorySelect'),verbTenseSelect=byId('verbTenseSelect'),verbTenseControls=byId('verbTenseControls'),conjugationBox=byId('conjugationBox'),conjugationInput=byId('conjugationInput'),conjFeedback=byId('conjFeedback'),prepositionBox=byId('prepositionBox'),prepOptions=byId('prepOptions'),prepFeedback=byId('prepFeedback'),articleBox=byId('articleBox'),articleOptions=byId('articleOptions'),articleFeedback=byId('articleFeedback'),gaptextBox=byId('gaptextBox'),gaptextInput=byId('gaptextInput'),gaptextFeedback=byId('gaptextFeedback');
modeSelect.value=state.settings.mode;dirSelect.value=state.settings.direction;
modeSelect.addEventListener('change',()=>{state.settings.mode=modeSelect.value;currentId=null;save();updateLearn();updateVerbTenseControls()});
dirSelect.addEventListener('change',()=>{state.settings.direction=dirSelect.value;currentId=null;save();updateLearn()});
cardTypeSelect?.addEventListener('change',()=>{state.settings.cardType=cardTypeSelect.value;currentId=null;save();updateLearn()});
categorySelect?.addEventListener('change',()=>{state.settings.category=categorySelect.value;currentId=null;save();updateLearn()});
verbTenseSelect?.addEventListener('change',()=>{state.settings.verbTense=verbTenseSelect.value;currentId=null;save();updateLearn()});

// Audio Settings
byId('autoSpeakCheck')?.addEventListener('change',e=>{state.settings.autoSpeak=e.target.checked;save()});
byId('speechRateSelect')?.addEventListener('change',e=>{state.settings.speechRate=parseFloat(e.target.value);save()});
byId('autoFlipCheck')?.addEventListener('change',e=>{state.settings.autoFlip=e.target.checked;save()});

// Daily Goal
byId('dailyGoalInput')?.addEventListener('change',e=>{state.dailyGoal=parseInt(e.target.value)||20;save();renderStats()});

// Flashcard Event Listeners
let autoFlipTimeout=null;
byId('flashcard')?.addEventListener('click',()=>flipCard());
byId('hardBtn')?.addEventListener('click',()=>gradeCard('again'));
byId('againBtn')?.addEventListener('click',()=>gradeCard('again'));
byId('goodBtn')?.addEventListener('click',()=>gradeCard('good'));
byId('easyBtn')?.addEventListener('click',()=>gradeCard('good'));

// Old flashcard buttons (fallback)
byId('oldAgainBtn')?.addEventListener('click',()=>grade('again'));
byId('oldGoodBtn')?.addEventListener('click',()=>grade('good'));

// Quick Start Buttons
byId('quickFlashcards')?.addEventListener('click',()=>{modeSelect.value='flashcards';state.settings.mode='flashcards';currentId=null;save();updateLearn();updateVerbTenseControls()});
byId('quickMC')?.addEventListener('click',()=>{modeSelect.value='mc';state.settings.mode='mc';currentId=null;save();updateLearn();updateVerbTenseControls()});
byId('quickType')?.addEventListener('click',()=>{modeSelect.value='type';state.settings.mode='type';currentId=null;save();updateLearn();updateVerbTenseControls()});
byId('quickConjugation')?.addEventListener('click',()=>{modeSelect.value='conjugation';state.settings.mode='conjugation';currentId=null;save();updateLearn();updateVerbTenseControls()});
byId('quickPreposition')?.addEventListener('click',()=>{modeSelect.value='preposition';state.settings.mode='preposition';currentId=null;save();updateLearn();updateVerbTenseControls()});
byId('quickArticles')?.addEventListener('click',()=>{modeSelect.value='articles';state.settings.mode='articles';currentId=null;save();updateLearn();updateVerbTenseControls()});
byId('quickGaptext')?.addEventListener('click',()=>{modeSelect.value='gaptext';state.settings.mode='gaptext';currentId=null;save();updateLearn();updateVerbTenseControls()});

// Debug: Schnellstart-Buttons prüfen und aktivieren + Karten-Status prüfen
['quickFlashcards','quickMC','quickType','quickConjugation','quickPreposition','quickArticles','quickGaptext'].forEach(id=>{
  const btn = byId(id);
  if(btn) {
    btn.disabled = false;
    btn.style.opacity = '';
    btn.addEventListener('click',()=>{
      console.log('Button', id, 'wurde geklickt');
      console.log('Verfügbare Karten:', state.items.length);
      console.log('Fällige Karten:', state.items.filter(i=>!i.suspended&&(i.dueAt||0)<=now()).length);
      console.log('Aktuelle Zeit:', now(), 'Erste Karte dueAt:', state.items[0]?.dueAt);
    });
  } else {
    console.warn('Button mit ID', id, 'nicht gefunden!');
  }
});

// Debug: Alle Karten als sofort fällig setzen (für Tests)
console.log('Debug: Setze alle Karten auf fällig...');
state.items.forEach(card => {
  if(card.dueAt > now()) {
    card.dueAt = now() - 1000; // 1 Sekunde in der Vergangenheit
  }
});
save();
console.log('Fällige Karten nach Update:', state.items.filter(i=>!i.suspended&&(i.dueAt||0)<=now()).length);function updateVerbTenseControls(){const isConjMode=modeSelect.value==='conjugation';verbTenseControls.style.display=isConjMode?'block':'none'}
const tbody=byId('tableBody'),searchInput=byId('searchInput'),countTxt=byId('countTxt'),statusFilter=byId('statusFilter'),successFilter=byId('successFilter'),sortSelect=byId('sortBy');
searchInput?.addEventListener('input',renderList);statusFilter?.addEventListener('change',renderList);successFilter?.addEventListener('change',renderList);
if(sortSelect){sortSelect.value=state.settings.sortBy||'default';sortSelect.addEventListener('change',()=>{state.settings.sortBy=sortSelect.value;save();renderList()})}
tbody?.addEventListener('click',e=>{const btn=e.target.closest('button[data-action],button[data-edit-due],button[data-save-due],button[data-cancel-due]');if(!btn)return;const id=btn.dataset.id||btn.dataset.editDue||btn.dataset.saveDue||btn.dataset.cancelDue;const card=state.items.find(i=>i.id===id);if(!card)return;if(btn.dataset.action==='delete'){if(!confirm('Eintrag löschen?'))return;state.items=state.items.filter(i=>i.id!==id);save();renderList();updateLearn();return}if(btn.dataset.action==='toggle'){card.suspended=!card.suspended;save();renderList();updateLearn();return}
if(btn.dataset.editDue){const td=btn.closest('td');td.innerHTML=`<div class="due-edit"><input type="datetime-local" class="due-input" value="${toLocalInputValue(card.dueAt||now())}"/><button class="btn primary btn-xs" data-save-due="${card.id}">Speichern</button><button class="btn ghost btn-xs" data-cancel-due="${card.id}">Abbrechen</button></div>`;return}
if(btn.dataset.saveDue){const td=btn.closest('td');const input=td.querySelector('input[type="datetime-local"]');if(input&&input.value){const ts=new Date(input.value).getTime();if(!Number.isNaN(ts)){card.dueAt=ts;save();renderList();updateLearn();return}}alert('Ungültiges Datum');return}
if(btn.dataset.cancelDue){renderList();return}});
function toLocalInputValue(ts){const d=new Date(ts),pad=n=>String(n).padStart(2,'0');return`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`}
function renderList(){const q=(searchInput.value||'').toLowerCase();const stat=statusFilter?.value||'all';const suc=successFilter?.value||'all';let filtered=state.items.filter(i=>norm(i.it).includes(q)||norm(i.de).includes(q));filtered=filtered.filter(i=>{const due=(i.dueAt||0)<=now();if(stat==='due'&&!(due&&!i.suspended))return false;if(stat==='active'&&(i.suspended))return false;if(stat==='suspended'&&!i.suspended)return false;return true});filtered=filtered.filter(i=>{const p=successPct(i);if(suc==='lt50')return p!==null&&p<50;if(suc==='50to79')return p!==null&&p>=50&&p<=79;if(suc==='ge80')return p!==null&&p>=80;return true});const s=(sortSelect?.value)||state.settings.sortBy||'default';filtered=filtered.slice();filtered.sort((a,b)=>{if(s==='dueFirst'){return(a.dueAt||0)-(b.dueAt||0)}if(s==='succAsc'||s==='succDesc'){const ap=successPct(a),bp=successPct(b),av=ap===null?-1:ap,bv=bp===null?-1:bp;return s==='succAsc'?(av-bv):(bv-av)}if(s==='itAZ'){return norm(a.it).localeCompare(norm(b.it))}if(s==='deAZ'){return norm(a.de).localeCompare(norm(b.de))}return 0});countTxt.textContent=`${filtered.length} / ${state.items.length}`;const dueAll=state.items.filter(i=>!i.suspended&&(i.dueAt||0)<=now());byId('dueCounter').textContent=dueAll.length?`Fällig: ${dueAll.length}`:'Nichts fällig';tbody.innerHTML='';for(const it of filtered){const dueAtStr=it.dueAt?new Date(it.dueAt).toLocaleString():'–';const p=successPct(it);const cls=p===null?'':p>=80?'ok':p>=50?'mid':'bad';const pTxt=p===null?'—':`${p} %`;const typeBadge=getTypeBadge(it.type);const tr=document.createElement('tr');tr.innerHTML=`<td><b>${it.it}</b>${typeBadge}</td><td>${it.de}</td><td class="muted due-cell"><span class="due-text">${dueAtStr}</span><button class="btn ghost btn-xs" data-edit-due="${it.id}">Bearbeiten</button></td><td>${it.streak||0}</td><td class="success-cell ${cls}">${pTxt}</td><td class="td-actions"><button class="btn ghost" data-action="toggle" data-id="${it.id}">${it.suspended?'Reaktivieren':'Pausieren'}</button><button class="btn ghost" data-action="delete" data-id="${it.id}">Löschen</button></td>`;tbody.appendChild(tr)}}

function getTypeBadge(type){if(!type||type==='vocab')return'';const badges={prep:'<span class="card-type-badge badge-prep">PREP</span>',verb:'<span class="card-type-badge badge-verb">VERB</span>',vocab:'<span class="card-type-badge badge-vocab">VOK</span>',article:'<span class="card-type-badge badge-article">ART</span>'};return badges[type]||''}
const itInput=byId('itInput'),deInput=byId('deInput'),notesInput=byId('notesInput'),addTypeSelect=byId('addTypeSelect'),verbForm=byId('verbForm'),basicForm=byId('basicForm');

// Add Type Select Handler
addTypeSelect?.addEventListener('change',()=>{const isVerb=addTypeSelect.value==='verb';verbForm.style.display=isVerb?'block':'none';basicForm.style.display=isVerb?'none':'block'});

byId('addBtn')?.addEventListener('click',()=>{const type=addTypeSelect?.value||'vocab';
if(type==='verb'){
const inf=byId('verbInfinitive')?.value.trim();const mean=byId('verbMeaning')?.value.trim();
const conjs={io:byId('conj_io')?.value.trim(),tu:byId('conj_tu')?.value.trim(),lui:byId('conj_lui')?.value.trim(),noi:byId('conj_noi')?.value.trim(),voi:byId('conj_voi')?.value.trim(),loro:byId('conj_loro')?.value.trim()};
if(!inf||!mean||!conjs.io||!conjs.tu||!conjs.lui)return alert('Bitte Infinitiv, Bedeutung und mindestens io/tu/lui ausfüllen.');
const conjText=`io ${conjs.io}, tu ${conjs.tu}, lui/lei ${conjs.lui}, noi ${conjs.noi||'?'}, voi ${conjs.voi||'?'}, loro ${conjs.loro||'?'}`;
state.items.unshift({id:uid(),it:inf,de:mean,notes:conjText,type:'verb',extra:{infinitive:inf,conjugations:{presente:conjs}},createdAt:now(),dueAt:now(),intervalIndex:0,streak:0,suspended:false,attempts:0,correct:0});
clearVerbForm()
}else{
const it=itInput.value.trim(),de=deInput.value.trim(),notes=notesInput.value.trim();
if(!it||!de)return alert('Bitte IT & DE ausfüllen.');
state.items.unshift({id:uid(),it,de,notes:notes||undefined,type,createdAt:now(),dueAt:now(),intervalIndex:0,streak:0,suspended:false,attempts:0,correct:0});
itInput.value='';deInput.value='';notesInput.value=''
}
save();tabsEl.querySelector('[data-tab="list"]').click()});

byId('resetBtn')?.addEventListener('click',()=>{itInput.value='';deInput.value='';notesInput.value='';clearVerbForm()});

function clearVerbForm(){['verbInfinitive','verbMeaning','conj_io','conj_tu','conj_lui','conj_noi','conj_voi','conj_loro'].forEach(id=>{const el=byId(id);if(el)el.value=''})}
let currentId=null,lastCorrect=false,currentConjugation=null,currentPrepContext=null,currentArticle=null,currentGaptext=null;
byId('revealBtn')?.addEventListener('click',()=>{if(!currentId)return;const c=cardById(currentId);const a=dir()==='it-de'?c.de:c.it;answerBox.textContent='Antwort: '+a;answerBox.style.display='block'});
byId('againBtn')?.addEventListener('click',()=>grade('again'));
byId('goodBtn')?.addEventListener('click',()=>grade('good'));
byId('skipBtn')?.addEventListener('click',()=>{currentId=null;updateLearn()});
byId('nextBtn')?.addEventListener('click',()=>grade(lastCorrect?'good':'again'));
byId('speakBtn')?.addEventListener('click',()=>{if(!('speechSynthesis'in window))return alert('Sprachausgabe nicht unterstützt.');const txt=learnWord.textContent;speakItalian(txt)});

function speakItalian(text,rate=0.8){if(!('speechSynthesis'in window))return;speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='it-IT';utterance.rate=rate;utterance.pitch=1;utterance.volume=0.8;
// Versuche eine italienische Stimme zu finden
const voices=speechSynthesis.getVoices();const italianVoice=voices.find(v=>v.lang.startsWith('it')||v.name.includes('Italian'));if(italianVoice)utterance.voice=italianVoice;
speechSynthesis.speak(utterance)}

function speakGerman(text,rate=0.8){if(!('speechSynthesis'in window))return;speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='de-DE';utterance.rate=rate;utterance.pitch=1;utterance.volume=0.8;
const voices=speechSynthesis.getVoices();const germanVoice=voices.find(v=>v.lang.startsWith('de')||v.name.includes('German'));if(germanVoice)utterance.voice=germanVoice;
speechSynthesis.speak(utterance)}

function autoSpeak(text,isItalian=true){if(state.settings.autoSpeak){setTimeout(()=>{if(isItalian){speakItalian(text)}else{speakGerman(text)}},500)}}
byId('typeRevealBtn')?.addEventListener('click',()=>{if(!currentId)return;const c=cardById(currentId);const a=dir()==='it-de'?c.de:c.it;typeFeedback.textContent='Antwort: '+a;typeFeedback.className='type-feedback';typeFeedback.style.display='block'});
byId('typeCheckBtn')?.addEventListener('click',()=>{if(!currentId)return;const c=cardById(currentId);const a=dir()==='it-de'?c.de:c.it;const ok=isClose(typeInput.value,a);typeFeedback.textContent=ok?'Richtig!':'Richtig wäre: '+a;typeFeedback.className='type-feedback '+(ok?'ok':'bad');typeFeedback.style.display='block';setTimeout(()=>grade(ok?'good':'again'),1500)});
typeInput?.addEventListener('keydown',e=>{if(e.key==='Enter'){byId('typeCheckBtn').click()}});

// Verb-Konjugation Event Listeners
byId('conjRevealBtn')?.addEventListener('click',()=>{if(!currentId||!currentConjugation)return;const c=cardById(currentId);const correct=c.extra?.conjugations?.[currentConjugation.tense]?.[currentConjugation.pronoun];conjFeedback.textContent='Antwort: '+correct;conjFeedback.className='type-feedback';conjFeedback.style.display='block'});

byId('conjCheckBtn')?.addEventListener('click',()=>{if(!currentId||!currentConjugation)return;const c=cardById(currentId);const correct=c.extra?.conjugations?.[currentConjugation.tense]?.[currentConjugation.pronoun];const ok=isClose(conjugationInput.value,correct);conjFeedback.textContent=ok?'Richtig!':'Richtig wäre: '+correct;conjFeedback.className='type-feedback '+(ok?'ok':'bad');conjFeedback.style.display='block';setTimeout(()=>grade(ok?'good':'again'),1500)});

// Artikel-Training Event Listeners
byId('articleCheckBtn')?.addEventListener('click',()=>{if(!currentId||!currentArticle)return;const c=cardById(currentId);const correct=c.extra?.article;const ok=currentArticle.selected===correct;articleFeedback.textContent=ok?'Richtig!':'Richtig wäre: '+correct+' '+c.extra.word;articleFeedback.className='type-feedback '+(ok?'ok':'bad');articleFeedback.style.display='block';setTimeout(()=>grade(ok?'good':'again'),1500)});

// Lückentext Event Listeners  
byId('gaptextRevealBtn')?.addEventListener('click',()=>{if(!currentId||!currentGaptext)return;gaptextFeedback.textContent='Antwort: '+currentGaptext.answer;gaptextFeedback.className='type-feedback';gaptextFeedback.style.display='block'});

byId('gaptextCheckBtn')?.addEventListener('click',()=>{if(!currentId||!currentGaptext)return;const ok=isClose(gaptextInput.value,currentGaptext.answer);gaptextFeedback.textContent=ok?'Richtig!':'Richtig wäre: '+currentGaptext.answer;gaptextFeedback.className='type-feedback '+(ok?'ok':'bad');gaptextFeedback.style.display='block';setTimeout(()=>grade(ok?'good':'again'),1500)});

gaptextInput?.addEventListener('keydown',e=>{if(e.key==='Enter'){byId('gaptextCheckBtn').click()}});

// Standard Learning Event Listeners
byId('revealBtn')?.addEventListener('click',()=>{if(!currentId)return;const c=cardById(currentId);const a=dir()==='it-de'?c.de:c.it;answerBox.textContent='Antwort: '+a;answerBox.style.display='block'});
byId('againBtn')?.addEventListener('click',()=>grade('again'));
byId('goodBtn')?.addEventListener('click',()=>grade('good'));
byId('skipBtn')?.addEventListener('click',()=>{currentId=null;updateLearn()});
byId('nextBtn')?.addEventListener('click',()=>grade(lastCorrect?'good':'again'));

function cardById(id){return state.items.find(i=>i.id===id)}
function dir(){return state.settings.direction}
function mode(){return state.settings.mode}
function pickDue(){let due=state.items.filter(i=>!i.suspended&&(i.dueAt||0)<=now());const cardType=state.settings.cardType||cardTypeSelect?.value||'all';const category=state.settings.category||categorySelect?.value||'all';const currentMode=mode();
// Modus-spezifische Filterung
if(currentMode==='conjugation'){due=due.filter(i=>i.type==='verb')}
else if(currentMode==='preposition'){due=due.filter(i=>i.type==='prep')}
else if(currentMode==='articles'){due=due.filter(i=>i.type==='article')}
else if(currentMode==='gaptext'){due=due.filter(i=>i.type==='prep')}
else {
// Für andere Modi (flashcards, mc, type) normale Filter anwenden
if(cardType!=='all'){due=due.filter(i=>i.type===cardType)}
}
if(category!=='all'){due=due.filter(i=>i.category===category)}if(!due.length)return null;due.sort((a,b)=>(a.dueAt||0)-(b.dueAt||0));return due[0]}
function updateLearn(){const card=pickDue();const m=mode();const isFC=(m==='flashcards'),isMC=(m==='mc'),isType=(m==='type'),isConj=(m==='conjugation'),isPrep=(m==='preposition'),isArticle=(m==='articles'),isGap=(m==='gaptext');
// Alle Modi zurücksetzen - mit Null-Checks
const flashcardContainer = byId('flashcardContainer');
const flashcardActions = byId('flashcardActions');
if(fcActions)fcActions.style.display='none'; // alte Flashcard-Actions ausblenden
if(flashcardContainer)flashcardContainer.style.display=isFC?'block':'none';
if(flashcardActions)flashcardActions.style.display=isFC?'flex':'none';
if(mcActions)mcActions.style.display=isMC?'flex':'none';
if(mcBox)mcBox.style.display=isMC?'grid':'none';
if(typeBox)typeBox.style.display=isType?'block':'none';
if(conjugationBox)conjugationBox.style.display=isConj?'block':'none';
if(prepositionBox)prepositionBox.style.display=isPrep?'block':'none';
if(articleBox)articleBox.style.display=isArticle?'block':'none';
if(gaptextBox)gaptextBox.style.display=isGap?'block':'none';
// Feedback zurücksetzen - mit Null-Checks
if(answerBox){answerBox.style.display='none';answerBox.textContent=''}
if(typeFeedback)typeFeedback.style.display='none';
if(conjFeedback)conjFeedback.style.display='none';
if(prepFeedback)prepFeedback.style.display='none';
if(articleFeedback)articleFeedback.style.display='none';
if(gaptextFeedback)gaptextFeedback.style.display='none';
// Eingaben leeren - mit Null-Checks
if(typeInput)typeInput.value='';
if(conjugationInput)conjugationInput.value='';
if(gaptextInput)gaptextInput.value='';
const nextBtn=byId('nextBtn');if(nextBtn)nextBtn.disabled=true;
// Counter aktualisieren
const due=state.items.filter(i=>!i.suspended&&(i.dueAt||0)<=now());
if(dueCounter)dueCounter.textContent=due.length?`Fällig: ${due.length}`:'Nichts fällig';
if(!card){
if(learnWord)learnWord.textContent='🎉 Nichts fällig!';
if(learnMeta)learnMeta.innerHTML=getModeText()+' – '+getDirText();
currentId=null;resetCurrentStates();
if(mcBox)mcBox.innerHTML='';
if(prepOptions)prepOptions.innerHTML='';
if(articleOptions)articleOptions.innerHTML='';
return}
currentId=card.id;resetCurrentStates();
// Spezielle Modi
if(isConj&&card.type==='verb'){setupConjugationMode(card);return}
if(isPrep&&card.type==='prep'){setupPrepositionMode(card);return}
if(isArticle&&card.type==='article'){setupArticleMode(card);return}
if(isGap){setupGaptextMode(card);return}
// Standard Modi (Vokabeln, Flashcards, MC, Type)
const q=dir()==='it-de'?card.it:card.de;const a=dir()==='it-de'?card.de:card.it;
if(learnWord)learnWord.textContent=q;
if(learnMeta)learnMeta.innerHTML=getModeText()+' – '+getDirText()+getCategoryBadge(card);
// Auto-Ausspreche für italienische Wörter
if(dir()==='it-de'&&state.settings.autoSpeak){autoSpeak(q,true)}
if(isMC){setupMCMode(card,q,a)}
if(isFC){setupFlashcardMode(card,q,a)}}

function resetCurrentStates(){currentConjugation=null;currentPrepContext=null;currentArticle=null;currentGaptext=null}

function getCategoryBadge(card){if(!card.category)return'';return' '+getTypeBadge(card.type)}

function setupMCMode(card,q,a){if(!mcBox)return;const pool=shuffle(state.items.filter(i=>i.id!==card.id&&i.type===card.type));const distractors=pool.slice(0,3).map(x=>dir()==='it-de'?x.de:x.it);const options=shuffle([a,...distractors]);mcBox.innerHTML='';options.forEach(opt=>{const b=document.createElement('button');b.type='button';b.className='btn ghost mc-option';b.textContent=opt;b.addEventListener('click',()=>{if(b.classList.contains('correct')||b.classList.contains('wrong'))return;const ok=norm(opt)===norm(a);lastCorrect=ok;b.classList.add(ok?'correct':'wrong');if(!ok){[...mcBox.children].forEach(btn=>{if(norm(btn.textContent)===norm(a))btn.classList.add('correct')})}const nextBtn=byId('nextBtn');if(nextBtn)nextBtn.disabled=false});mcBox.appendChild(b)})}

function setupMCMode(card,q,a){if(!mcBox)return;const pool=shuffle(state.items.filter(i=>i.id!==card.id&&i.type===card.type));const distractors=pool.slice(0,3).map(x=>dir()==='it-de'?x.de:x.it);const options=shuffle([a,...distractors]);mcBox.innerHTML='';options.forEach(opt=>{const b=document.createElement('button');b.type='button';b.className='btn ghost mc-option';b.textContent=opt;b.addEventListener('click',()=>{if(b.classList.contains('correct')||b.classList.contains('wrong'))return;const ok=norm(opt)===norm(a);lastCorrect=ok;b.classList.add(ok?'correct':'wrong');if(!ok){[...mcBox.children].forEach(btn=>{if(norm(btn.textContent)===norm(a))btn.classList.add('correct')})}const nextBtn=byId('nextBtn');if(nextBtn)nextBtn.disabled=false});mcBox.appendChild(b)})}

function setupFlashcardMode(card,q,a){
    const flashcard = byId('flashcard');
    const flashcardFront = byId('flashcard-front');
    const flashcardBack = byId('flashcard-back');
    
    if (flashcard) flashcard.classList.remove('flipped');
    if (flashcardFront) flashcardFront.innerHTML = `<div><div class="flashcard-word">${q}</div><div class="flashcard-hint">Klicken zum Umdrehen</div></div>`;
    if (flashcardBack) flashcardBack.innerHTML = `<div class="flashcard-translation">${a}</div>`;
    
    // Flashcard Click Handler
    if (flashcard) {
        flashcard.onclick = () => flipCard();
    }
}

function setupConjugationMode(card){const tense=verbTenseSelect?.value||'presente';if(!card.extra?.conjugations?.[tense])return updateLearn();
const pronouns=['io','tu','lui','lei','noi','voi','loro'];const pronoun=pronouns[Math.floor(Math.random()*pronouns.length)];currentConjugation={pronoun,card,tense};
learnWord.textContent=card.extra.infinitive||card.it;learnMeta.textContent='Konjugation – '+getTenseName(tense);byId('conjugationPronoun').textContent=pronoun;conjFeedback.style.display='none';conjugationInput.value='';conjugationInput.focus()}

function setupPrepositionMode(card){const contexts=card.extra?.contexts||getPrepositionContexts()[card.it];if(!contexts||!contexts.length)return updateLearn();
const context=contexts[Math.floor(Math.random()*contexts.length)];const allPreps=['a','di','da','in','con','per','su','tra','fra'];const correctPrep=card.it;const distractors=shuffle(allPreps.filter(p=>p!==correctPrep)).slice(0,3);const options=shuffle([correctPrep,...distractors]);
currentPrepContext={context,correct:correctPrep};
const contextEl=byId('prepositionContext');
if(contextEl)contextEl.textContent=context;
if(learnWord)learnWord.textContent=''; // Leeres Hauptwort für Präposition-Modus
learnMeta.innerHTML='Präposition – Kontext';prepOptions.innerHTML='';prepFeedback.style.display='none';
options.forEach(prep=>{const btn=document.createElement('button');btn.className='btn ghost';btn.textContent=prep;btn.addEventListener('click',()=>checkPreposition(prep,correctPrep));prepOptions.appendChild(btn)})}

function setupArticleMode(card){if(!card.extra?.article||!card.extra?.word)return updateLearn();
const articles=['il','la','lo','l\'','i','gli','le'];const correct=card.extra.article;const distractors=shuffle(articles.filter(a=>a!==correct)).slice(0,3);const options=shuffle([correct,...distractors]);
currentArticle={correct,word:card.extra.word};byId('articleWord').textContent=card.extra.word;
if(learnWord)learnWord.textContent=''; // Leeres Hauptwort für Artikel-Modus
learnMeta.textContent='Artikel-Training';articleOptions.innerHTML='';articleFeedback.style.display='none';
options.forEach(article=>{const btn=document.createElement('button');btn.className='btn ghost';btn.textContent=article;btn.addEventListener('click',()=>checkArticle(article,correct));articleOptions.appendChild(btn)})}

function setupGaptextMode(card){const templates=getGaptextTemplates();const template=templates[Math.floor(Math.random()*templates.length)];const answer=generateGaptextAnswer(card,template);
const gaptextSentence=byId('gaptextSentence');if(gaptextSentence)gaptextSentence.textContent=template.sentence.replace('___','_____');
currentGaptext={template,answer:answer.answer,card};
if(learnWord)learnWord.textContent=''; // Leeres Hauptwort für Lückentext-Modus
if(learnMeta)learnMeta.textContent='Lückentext – '+template.type;if(gaptextFeedback)gaptextFeedback.style.display='none';if(gaptextInput){gaptextInput.value='';gaptextInput.focus()}}

function checkArticle(selected,correct){const buttons=articleOptions.querySelectorAll('button');buttons.forEach(btn=>{btn.disabled=true;if(btn.textContent===correct){btn.classList.add('correct')}else if(btn.textContent===selected&&selected!==correct){btn.classList.add('wrong')}});
currentArticle.selected=selected;const ok=selected===correct;articleFeedback.textContent=ok?'Richtig!':'Richtig wäre: '+correct;articleFeedback.className='type-feedback '+(ok?'ok':'bad');articleFeedback.style.display='block';setTimeout(()=>grade(ok?'good':'again'),1500)}

function getTenseName(tense){const names={presente:'Presente',passato_prossimo:'Passato Prossimo',imperfetto:'Imperfetto'};return names[tense]||tense}

function getGaptextTemplates(){return[{sentence:'Io ___ a casa',type:'Verb',answer_type:'verb'},{sentence:'Il libro ___ Maria',type:'Präposition',answer_type:'prep'},{sentence:'___ ragazzo è simpatico',type:'Artikel',answer_type:'article'}]}

function generateGaptextAnswer(card,template){if(template.answer_type==='verb'&&card.type==='verb'){const tense=verbTenseSelect?.value||'presente';const pronoun='io';return{blank:'___',answer:card.extra?.conjugations?.[tense]?.[pronoun]||card.it}}
if(template.answer_type==='prep'&&card.type==='prep'){return{blank:'___',answer:card.it}}
if(template.answer_type==='article'&&card.extra?.article){return{blank:'___',answer:card.extra.article}}
return{blank:'___',answer:card.it}}

function getModeText(){const m=mode();return m==='flashcards'?'Karteikarten':m==='mc'?'Multiple Choice':m==='type'?'Tippen':m==='conjugation'?'Konjugation':m==='preposition'?'Präposition':m==='articles'?'Artikel':m==='gaptext'?'Lückentext':'Lernen'}

function getDirText(){return dir()==='it-de'?'IT→DE':'DE→IT'}

function checkPreposition(selected,correct){const buttons=prepOptions.querySelectorAll('button');buttons.forEach(btn=>{btn.disabled=true;if(btn.textContent===correct){btn.classList.add('correct')}else if(btn.textContent===selected&&selected!==correct){btn.classList.add('wrong')}});
const ok=selected===correct;prepFeedback.textContent=ok?'Richtig!':'Richtig wäre: '+correct;prepFeedback.className='type-feedback '+(ok?'ok':'bad');prepFeedback.style.display='block';setTimeout(()=>grade(ok?'good':'again'),1500)}

function getPrepositionContexts(){return{a:['Vado ___ scuola','Penso ___ te','Arrivo ___ Milano'],di:['Il libro ___ Maria','Sono ___ Roma','Parlo ___ te'],da:['Vengo ___ casa','Aspetto ___ ieri','Vado ___ medico'],in:['Siamo ___ Italia','Vivo ___ città','Studio ___ biblioteca'],con:['Vengo ___ te','Parlo ___ lui','Mangio ___ gli amici'],per:['Questo è ___ te','Parto ___ Roma','Studio ___ l\'esame']}}
function grade(result){if(!currentId)return;
// Speed Learning Tracking
if(!state.speedSession){state.speedSession={start:Date.now(),count:0}}state.speedSession.count++;
const idx=state.items.findIndex(i=>i.id===currentId);if(idx<0)return;state.items[idx]=nextSchedule(state.items[idx],result);addHistory(result);save();currentId=null;updateLearn();renderList();renderStats()}
byId('exportBtn')?.addEventListener('click',()=>{const data=JSON.stringify(state,null,2);download('parola-export.json',data)});
byId('clearBtn')?.addEventListener('click',()=>{if(!confirm('Alle Daten löschen?'))return;state.items=[];save();renderList();updateLearn();renderStats()});
byId('fileJson')?.addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(!o||!Array.isArray(o.items))throw new Error('Ungültig');state.items=o.items;if(o.settings)state.settings=o.settings;if(Array.isArray(o.history))state.history=o.history;save();renderList();updateLearn();renderStats();alert('Import OK')}catch{alert('JSON ungültig')}};r.readAsText(f)});
byId('fileCsv')?.addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const rows=r.result.split(/\r?\n/).filter(Boolean);if(!rows.length)return alert('Leere CSV');const head=rows.shift().split(',').map(x=>x.trim().toLowerCase());const iit=head.indexOf('it'),ide=head.indexOf('de'),inotes=head.indexOf('notes');if(iit<0||ide<0)return alert('CSV braucht Spalten it,de');const items=[];for(const line of rows){const cols=line.split(',');const it=cols[iit]?.trim(),de=cols[ide]?.trim(),notes=inotes>=0?(cols[inotes]?.trim()||undefined):undefined;if(it&&de){items.push({id:uid(),it,de,notes,createdAt:now(),dueAt:now(),intervalIndex:0,streak:0,suspended:false,attempts:0,correct:0})}}if(!items.length)return alert('Keine gültigen Zeilen');state.items=[...items,...state.items];save();renderList();updateLearn();renderStats();alert(items.length+' Einträge importiert')};r.readAsText(f)});
byId('csvTplBtn')?.addEventListener('click',()=>{download('parola-template.csv','it,de,notes\nragazzo,Junge,\nacqua,Wasser,\n')});
function download(filename,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:filename.endsWith('.csv')?'text/csv':'application/json'}));a.download=filename;a.click();URL.revokeObjectURL(a.href)}
function renderStats(){const today=state.history.find(x=>x.d===todayKey())||{good:0,bad:0};const totalGood=state.history.reduce((s,x)=>s+(x.good||0),0),totalBad=state.history.reduce((s,x)=>s+(x.bad||0),0);const todayTotal=today.good+today.bad;const goalProgress=Math.min(100,(todayTotal/state.dailyGoal)*100);
byId('statToday').textContent=todayTotal;byId('statTotal').textContent=(totalGood+totalBad);byId('statStreak').textContent=calcStreak();byId('statLevel').textContent=Math.floor((totalGood+totalBad)/20)+1;
// Goal Progress
byId('goalProgress').textContent=`${todayTotal}/${state.dailyGoal}`;const goalEl=document.querySelector('.goal-progress');if(goalEl)goalEl.style.setProperty('--progress',goalProgress+'%');
// Update Settings UI
if(byId('dailyGoalInput'))byId('dailyGoalInput').value=state.dailyGoal||20;if(byId('autoSpeakCheck'))byId('autoSpeakCheck').checked=state.settings.autoSpeak||false;if(byId('speechRateSelect'))byId('speechRateSelect').value=state.settings.speechRate||0.8;
renderAchievements();renderCategoryStats();drawStatsChart()}

function renderAchievements(){const achievements=[
{id:'first_word',name:'Erste Schritte',desc:'Erstes Wort gelernt',icon:'🌱'},
{id:'streak_3',name:'Auf dem Weg',desc:'3 Tage in Folge gelernt',icon:'🔥'},
{id:'streak_7',name:'Woche geschafft!',desc:'7 Tage Streak erreicht',icon:'🚀'},
{id:'streak_30',name:'Monats-Meister',desc:'30 Tage Streak!',icon:'👑'},
{id:'vocab_master',name:'Vokabel-Profi',desc:'50 Vokabeln gemeistert',icon:'📚'},
{id:'verb_master',name:'Verb-Experte',desc:'Alle 3 Zeiten gemeistert',icon:'⚡'},
{id:'article_expert',name:'Artikel-Ass',desc:'Alle Artikel perfekt',icon:'🎯'},
{id:'perfect_day',name:'Perfekter Tag',desc:'20 richtige Antworten an einem Tag',icon:'⭐'},
{id:'speed_demon',name:'Schnell-Lerner',desc:'10 Antworten in 5 Minuten',icon:'💨'},
{id:'polyglot',name:'Polyglott',desc:'100 Wörter gelernt',icon:'🌍'}
];
const container=byId('achievementsList');if(!container)return;container.innerHTML='';achievements.forEach(ach=>{const earned=state.achievements.includes(ach.id);const div=document.createElement('div');div.className='achievement'+(earned?' earned':'');div.innerHTML=`<span class="achievement-icon">${ach.icon}</span><div><strong>${ach.name}</strong><br><small>${ach.desc}</small></div>`;container.appendChild(div)})}

function renderCategoryStats(){const categories=['greetings','food','family','verbs','grammar','articles'];const container=byId('categoryStats');if(!container)return;container.innerHTML='';categories.forEach(cat=>{const items=state.items.filter(i=>i.category===cat);const correct=items.reduce((sum,i)=>(sum+(i.correct||0)),0);const total=items.reduce((sum,i)=>(sum+(i.attempts||0)),0);const pct=total>0?Math.round((correct/total)*100):0;
const div=document.createElement('div');div.className='category-stat';div.innerHTML=`<h5>${getCategoryName(cat)}</h5><div>${correct}/${total} richtig (${pct}%)</div><div class="category-progress"><div class="category-progress-bar" style="width:${pct}%"></div></div>`;container.appendChild(div)})}

function getCategoryName(cat){const names={greetings:'Begrüßungen',food:'Essen',family:'Familie',verbs:'Verben',grammar:'Grammatik',articles:'Artikel'};return names[cat]||cat}

function drawStatsChart(){const ctx=byId('statsChart')?.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,600,160);const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=todayKey(d);const row=state.history.find(x=>x.d===k)||{good:0,bad:0};days.push({label:k.slice(5),good:row.good,bad:row.bad})}const W=600,H=160,pad=24,barW=(W-2*pad)/7*.6;ctx.font='12px Inter, sans-serif';ctx.textBaseline='top';const css=getComputedStyle(document.documentElement);const colT=css.getPropertyValue('--text')||'#000',colG=css.getPropertyValue('--ok')||'#2e7d32',colR=css.getPropertyValue('--bad')||'#c62828';const maxV=Math.max(1,...days.map(d=>d.good+d.bad));days.forEach((d,i)=>{const x=pad+(W-2*pad)/7*i+((W-2*pad)/7-barW)/2;const scale=(H-2*pad)/maxV;const hG=d.good*scale,hB=d.bad*scale;ctx.fillStyle=colR;ctx.fillRect(x,H-pad-hB,barW,hB);ctx.fillStyle=colG;ctx.fillRect(x,H-pad-hB-hG,barW,hG);ctx.fillStyle=colT;ctx.fillText(d.label,x,H-pad+4)})}
function calcStreak(){let s=0;for(let i=0;i<365;i++){const d=new Date();d.setDate(d.getDate()-i);const k=todayKey(d);const row=state.history.find(x=>x.d===k);if(!row||((row.good||0)+(row.bad||0))===0){if(i===0)continue;break}s++}return s}

// Flashcard functions
function flipCard() {
    const flashcard = byId('flashcard');
    if (flashcard) {
        flashcard.classList.toggle('flipped');
        clearTimeout(autoFlipTimeout);
    }
}

function startAutoFlip() {
    if (state.settings.autoFlip) {
        autoFlipTimeout = setTimeout(() => {
            const flashcard = byId('flashcard');
            if (flashcard && !flashcard.classList.contains('flipped')) {
                flipCard();
            }
        }, 3000);
    }
}

function gradeCard(result) {
    clearTimeout(autoFlipTimeout);
    grade(result);
    setTimeout(() => {
        const flashcard = byId('flashcard');
        if (flashcard) {
            flashcard.classList.remove('flipped');
        }
    }, 300);
}

renderList();updateLearn();renderStats();
