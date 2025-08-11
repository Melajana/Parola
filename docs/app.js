// SRS11: Streamlined Learning App - Verbesserte Version
const LS_KEY='parola:srs11';
const MIN=60*1000,DAY=24*60*60*1000;
const INTERVALS=[10*MIN,1*DAY,3*DAY,7*DAY,16*DAY];

// State initialisieren
const state=load()||seed();
state.settings=Object.assign({
    newPerSession:10,
    maxReviews:100,
    direction:'it-de',
    mode:'flashcards',
    tolerance:20,
    sortBy:'default',
    autoSpeak:false,
    speechRate:0.8,
    speakOnFlip:true,
    repeatAudio:false
},state.settings||{});

save();

function load(){try{return JSON.parse(localStorage.getItem(LS_KEY)||'null')}catch{return null}}
function save(){localStorage.setItem(LS_KEY,JSON.stringify(state))}
function uid(){return Math.random().toString(36).slice(2)}
function now(){return Date.now()}

function nextSchedule(c,res){
    let idx=Math.max(0,Math.min(INTERVALS.length-1,c.intervalIndex??0));
    let st=c.streak??0;
    if(res==='good'){
        idx=Math.min(INTERVALS.length-1,idx+1);
        st++;
    }else{
        idx=0;st=0;
    }
    const attempts=(c.attempts||0)+1;
    const correct=(c.correct||0)+(res==='good'?1:0);
    return {...c,intervalIndex:idx,streak:st,dueAt:now()+INTERVALS[idx],attempts,correct};
}

function seed(){
    const t=now();
    const m=(it,de,notes,type='vocab',extra,category)=>({
        id:uid(),it,de,notes,type,extra,category,createdAt:t,dueAt:t,
        intervalIndex:0,streak:0,suspended:false,attempts:0,correct:0
    });
    
    return{
        items:[
            // Greetings
            m('ciao','hallo; tschüss','','vocab',null,'greetings'),
            m('grazie','danke','','vocab',null,'greetings'),
            m('per favore','bitte','','vocab',null,'greetings'),
            m('come stai?','wie geht\'s?','','vocab',null,'greetings'),
            
            // Food
            m('acqua','Wasser','f. - l\'acqua','vocab',{article:'l\'',gender:'f'},'food'),
            m('pane','Brot','m. - il pane','vocab',{article:'il',gender:'m'},'food'),
            m('vino','Wein','m. - il vino','vocab',{article:'il',gender:'m'},'food'),
            m('pizza','Pizza','f. - la pizza','vocab',{article:'la',gender:'f'},'food'),
            m('gelato','Eis','m. - il gelato','vocab',{article:'il',gender:'m'},'food'),
            
            // Family
            m('padre','Vater','m. - il padre','vocab',{article:'il',gender:'m'},'family'),
            m('madre','Mutter','f. - la madre','vocab',{article:'la',gender:'f'},'family'),
            m('figlio','Sohn','m. - il figlio','vocab',{article:'il',gender:'m'},'family'),
            m('figlia','Tochter','f. - la figlia','vocab',{article:'la',gender:'f'},'family'),
            
            // Prepositions
            m('a','zu, nach, in','Ortsangabe, Zeit, Art','prep',{contexts:['Vado ___ scuola','Penso ___ te','Arrivo ___ Milano','Alle tre (alle ore ___)']},'grammar'),
            m('di','von, aus','Besitz/Herkunft','prep',{contexts:['Il libro ___ Maria','Sono ___ Roma','Una camicia ___ cotone']},'grammar'),
            m('da','von, seit, bei','Ausgangspunkt','prep',{contexts:['Vengo ___ casa','Aspetto ___ ieri','Vado ___ medico']},'grammar'),
            m('in','in, nach','Richtung/Ort','prep',{contexts:['Siamo ___ Italia','Vivo ___ città','___ primavera']},'grammar'),
            m('con','mit','Begleitung','prep',{contexts:['Vengo ___ te','Parlo ___ lui','Scrivo ___ la penna']},'grammar'),
            m('per','für, durch','Zweck/Richtung','prep',{contexts:['Questo è ___ te','Parto ___ Roma','___ due settimane']},'grammar'),
            
            // Verbs - Extended
            m('essere','sein','io sono, tu sei, lui/lei è','verb',{
                infinitive:'essere',
                conjugations:{
                    presente:{io:'sono',tu:'sei',lui:'è',lei:'è',noi:'siamo',voi:'siete',loro:'sono'},
                    passato_prossimo:{io:'sono stato/a',tu:'sei stato/a',lui:'è stato',lei:'è stata',noi:'siamo stati/e',voi:'siete stati/e',loro:'sono stati/e'}
                }
            },'verbs'),
            m('avere','haben','io ho, tu hai, lui/lei ha','verb',{
                infinitive:'avere',
                conjugations:{
                    presente:{io:'ho',tu:'hai',lui:'ha',lei:'ha',noi:'abbiamo',voi:'avete',loro:'hanno'},
                    passato_prossimo:{io:'ho avuto',tu:'hai avuto',lui:'ha avuto',lei:'ha avuto',noi:'abbiamo avuto',voi:'avete avuto',loro:'hanno avuto'}
                }
            },'verbs'),
            m('parlare','sprechen','io parlo, tu parli','verb',{
                infinitive:'parlare',
                conjugations:{
                    presente:{io:'parlo',tu:'parli',lui:'parla',lei:'parla',noi:'parliamo',voi:'parlate',loro:'parlano'},
                    passato_prossimo:{io:'ho parlato',tu:'hai parlato',lui:'ha parlato',lei:'ha parlato',noi:'abbiamo parlato',voi:'avete parlato',loro:'hanno parlato'}
                }
            },'verbs'),
            m('fare','machen','io faccio, tu fai','verb',{
                infinitive:'fare',
                conjugations:{
                    presente:{io:'faccio',tu:'fai',lui:'fa',lei:'fa',noi:'facciamo',voi:'fate',loro:'fanno'},
                    passato_prossimo:{io:'ho fatto',tu:'hai fatto',lui:'ha fatto',lei:'ha fatto',noi:'abbiamo fatto',voi:'avete fatto',loro:'hanno fatto'}
                }
            },'verbs'),
            
            // Articles
            m('ragazzo','der Junge','m. - il ragazzo','article',{article:'il',gender:'m',word:'ragazzo'},'articles'),
            m('ragazza','das Mädchen','f. - la ragazza','article',{article:'la',gender:'f',word:'ragazza'},'articles'),
            m('studente','der Student','m. - lo studente','article',{article:'lo',gender:'m',word:'studente'},'articles'),
        ],
        settings:{
            newPerSession:10,maxReviews:100,direction:'it-de',mode:'flashcards',
            tolerance:20,sortBy:'default',autoSpeak:false,speechRate:0.8
        },
        history:[],achievements:[],dailyGoal:20,streak:0
    };
}

// Erweiterte Audio-Manager Klasse
class AudioManager {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        this.italianVoice = null;
        this.germanVoice = null;
        this.initVoices();
    }

    initVoices() {
        const loadVoices = () => {
            this.voices = this.synthesis.getVoices();
            this.italianVoice = this.voices.find(voice => 
                voice.lang === 'it-IT' || voice.lang.startsWith('it')
            );
            this.germanVoice = this.voices.find(voice =>
                voice.lang === 'de-DE' || voice.lang.startsWith('de')
            );
            console.log('Audio loaded - IT:', this.italianVoice?.name || 'Default', 'DE:', this.germanVoice?.name || 'Default');
        };

        loadVoices();
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = loadVoices;
        }
        setTimeout(loadVoices, 100);
    }

    speak(text, options = {}) {
        if (!this.synthesis || !text.trim()) return Promise.resolve();

        return new Promise((resolve) => {
            this.synthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text.trim());
            
            if (options.lang === 'it-IT' && this.italianVoice) {
                utterance.voice = this.italianVoice;
            } else if (options.lang === 'de-DE' && this.germanVoice) {
                utterance.voice = this.germanVoice;
            }
            
            utterance.lang = options.lang || 'it-IT';
            utterance.rate = options.rate || 0.85;
            utterance.pitch = options.pitch || 1;
            utterance.volume = options.volume || 0.8;

            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();

            this.synthesis.speak(utterance);
        });
    }

    async speakItalian(text, rate = 0.85) {
        return this.speak(text, { lang: 'it-IT', rate });
    }

    async speakGerman(text, rate = 0.85) {
        return this.speak(text, { lang: 'de-DE', rate });
    }

    stop() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }
}

const audioManager = new AudioManager();

// Utility functions
function norm(s){return(s||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9äöüß ]/gi,'').trim()}
function shuffle(a){return a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1])}
function byId(id){return document.getElementById(id)}

// Levenshtein distance for fuzzy matching
function levenshtein(a,b){
    const dp=Array(a.length+1).fill().map(()=>Array(b.length+1).fill(0));
    for(let i=0;i<=a.length;i++)dp[i][0]=i;
    for(let j=0;j<=b.length;j++)dp[0][j]=j;
    for(let i=1;i<=a.length;i++){
        for(let j=1;j<=b.length;j++){
            if(a[i-1]===b[j-1])dp[i][j]=dp[i-1][j-1];
            else dp[i][j]=Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1])+1;
        }
    }
    return dp[a.length][b.length];
}

function isClose(a,b){
    const A=norm(a),B=norm(b);
    if(!A||!B)return false;
    if(A===B)return true;
    const dist=levenshtein(A,B);
    const tol=Math.max(0,Math.round((state.settings.tolerance||20)/100*B.length));
    return dist<=tol;
}

// Global variables
let currentId=null;
let lastCorrect=false;
let currentConjugation=null;
let currentPrepContext=null;
let currentArticle=null;
let currentGaptext=null;

// DOM Elements
const dirSelect = byId('dirSelect');
const learnWord = byId('learnWord');
const learnMeta = byId('learnMeta');

// Core functions
function dir(){return state.settings.direction}
function mode(){return state.settings.mode}
function cardById(id){return state.items.find(c=>c.id===id)}

// Tab system
function showView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.hidden = true);
    // Show selected view
    const targetView = byId(`view-${viewName}`);
    if (targetView) {
        targetView.hidden = false;
    }
    // Update tab buttons
    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === viewName);
    });
}

// Mode selection with visual feedback
function selectMode(modeName) {
    console.log('selectMode called with:', modeName);
    
    // Clear previous active states
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Set active mode
    const targetId = `quick${modeName.charAt(0).toUpperCase() + modeName.slice(1)}`;
    console.log('Looking for button with ID:', targetId);
    
    const modeBtn = byId(targetId);
    if (modeBtn) {
        console.log('Found mode button, activating');
        modeBtn.classList.add('active');
    } else {
        console.log('Mode button not found!');
    }
    
    // Update state
    state.settings.mode = modeName;
    currentId = null;
    save();
    console.log('Calling updateLearn...');
    updateLearn();
}

// Data management functions
function exportData() {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parola-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Daten wurden exportiert!');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (!importedData.items || !Array.isArray(importedData.items)) {
                throw new Error('Ungültiges Datenformat');
            }
            
            if (confirm(`${importedData.items.length} Karten importieren? Dies ersetzt alle aktuellen Daten.`)) {
                // Merge with existing data or replace
                const shouldMerge = confirm('Möchten Sie die Daten zusammenführen? (Nein = komplett ersetzen)');
                
                if (shouldMerge) {
                    // Add imported items to existing ones
                    importedData.items.forEach(item => {
                        if (!state.items.find(existing => existing.id === item.id)) {
                            state.items.push(item);
                        }
                    });
                } else {
                    // Replace completely
                    Object.assign(state, importedData);
                }
                
                save();
                renderList();
                updateLearn();
                alert('Daten wurden erfolgreich importiert!');
            }
        } catch (error) {
            alert('Fehler beim Import: ' + error.message);
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

function clearAllData() {
    const itemCount = state.items.length;
    if (confirm(`Wirklich ALLE ${itemCount} Karten löschen? Diese Aktion kann nicht rückgängig gemacht werden!`)) {
        if (confirm('Sind Sie sicher? Alle Fortschritte gehen verloren!')) {
            state.items = [];
            state.history = [];
            state.achievements = [];
            state.streak = 0;
            save();
            renderList();
            updateLearn();
            renderStats();
            alert('Alle Daten wurden gelöscht.');
        }
    }
}

// Settings management
function initializeSettings() {
    // Load current settings into UI
    const newPerSession = byId('newPerSession');
    const maxReviews = byId('maxReviews');
    const toleranceSelect = byId('toleranceSelect');
    const speechRateSelect = byId('speechRateSelect');
    const autoSpeakCheck = byId('autoSpeakCheck');
    const speakOnFlipCheck = byId('speakOnFlipCheck');
    const repeatAudioCheck = byId('repeatAudioCheck');
    const dailyGoalInput = byId('dailyGoalInput');
    
    // Set current values
    if (newPerSession) newPerSession.value = state.settings.newPerSession || 10;
    if (maxReviews) maxReviews.value = state.settings.maxReviews || 100;
    if (toleranceSelect) toleranceSelect.value = state.settings.tolerance || 20;
    if (speechRateSelect) speechRateSelect.value = state.settings.speechRate || 0.8;
    if (autoSpeakCheck) autoSpeakCheck.checked = state.settings.autoSpeak || false;
    if (speakOnFlipCheck) speakOnFlipCheck.checked = state.settings.speakOnFlip !== false;
    if (repeatAudioCheck) repeatAudioCheck.checked = state.settings.repeatAudio || false;
    if (dailyGoalInput) dailyGoalInput.value = state.dailyGoal || 20;
    
    // Add event listeners
    if (newPerSession) {
        newPerSession.addEventListener('change', () => {
            state.settings.newPerSession = parseInt(newPerSession.value) || 10;
            save();
        });
    }
    
    if (maxReviews) {
        maxReviews.addEventListener('change', () => {
            state.settings.maxReviews = parseInt(maxReviews.value) || 100;
            save();
        });
    }
    
    if (toleranceSelect) {
        toleranceSelect.addEventListener('change', () => {
            state.settings.tolerance = parseInt(toleranceSelect.value) || 20;
            save();
        });
    }
    
    if (speechRateSelect) {
        speechRateSelect.addEventListener('change', () => {
            state.settings.speechRate = parseFloat(speechRateSelect.value) || 0.8;
            save();
        });
    }
    
    if (autoSpeakCheck) {
        autoSpeakCheck.addEventListener('change', () => {
            state.settings.autoSpeak = autoSpeakCheck.checked;
            save();
        });
    }
    
    if (speakOnFlipCheck) {
        speakOnFlipCheck.addEventListener('change', () => {
            state.settings.speakOnFlip = speakOnFlipCheck.checked;
            save();
        });
    }
    
    if (repeatAudioCheck) {
        repeatAudioCheck.addEventListener('change', () => {
            state.settings.repeatAudio = repeatAudioCheck.checked;
            save();
        });
    }
    
    if (dailyGoalInput) {
        dailyGoalInput.addEventListener('change', () => {
            state.dailyGoal = parseInt(dailyGoalInput.value) || 20;
            save();
            renderStats();
        });
    }
    
    // Initial stats render
    renderStats();
}

// Statistics and progress tracking
function addHistory(result) {
    const today = new Date().toISOString().slice(0, 10);
    if (!state.history) state.history = [];
    
    let entry = state.history.find(h => h.date === today);
    if (!entry) {
        entry = { date: today, correct: 0, incorrect: 0, total: 0 };
        state.history.push(entry);
    }
    
    entry.total++;
    if (result === 'good') {
        entry.correct++;
    } else {
        entry.incorrect++;
    }
    
    // Update streak
    if (result === 'good') {
        state.streak = (state.streak || 0) + 1;
    } else if (result === 'again') {
        state.streak = 0;
    }
    
    // Keep only last 30 days
    state.history = state.history
        .filter(h => (now() - new Date(h.date).getTime()) < 30 * 24 * 60 * 60 * 1000)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    save();
    renderStats();
}

function renderStats() {
    const today = new Date().toISOString().slice(0, 10);
    const todayEntry = state.history?.find(h => h.date === today);
    const todayCount = todayEntry?.total || 0;
    const todayCorrect = todayEntry?.correct || 0;
    
    // Update basic stats
    const statToday = byId('statToday');
    const statTotal = byId('statTotal');
    const statStreak = byId('statStreak');
    const statLevel = byId('statLevel');
    const goalProgress = byId('goalProgress');
    
    if (statToday) statToday.textContent = todayCount;
    if (statTotal) statTotal.textContent = state.items.length;
    if (statStreak) statStreak.textContent = state.streak || 0;
    if (statLevel) statLevel.textContent = Math.floor((state.streak || 0) / 10) + 1;
    if (goalProgress) goalProgress.textContent = `${todayCount}/${state.dailyGoal || 20}`;
    
    // Category stats
    renderCategoryStats();
    
    // Achievements
    checkAchievements();
}

function renderCategoryStats() {
    const categoryStats = byId('categoryStats');
    if (!categoryStats) return;
    
    const categories = {};
    state.items.forEach(item => {
        const cat = item.category || 'other';
        if (!categories[cat]) {
            categories[cat] = { total: 0, correct: 0, attempts: 0 };
        }
        categories[cat].total++;
        categories[cat].correct += item.correct || 0;
        categories[cat].attempts += item.attempts || 0;
    });
    
    categoryStats.innerHTML = Object.entries(categories)
        .map(([cat, stats]) => {
            const rate = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
            return `
                <div class="stat">
                    <div class="stat-num">${rate}%</div>
                    <div class="stat-label">${cat} (${stats.total})</div>
                </div>
            `;
        }).join('');
}

function checkAchievements() {
    if (!state.achievements) state.achievements = [];
    
    const today = new Date().toISOString().slice(0, 10);
    const todayEntry = state.history?.find(h => h.date === today);
    const todayCount = todayEntry?.total || 0;
    
    // Check for new achievements
    const achievements = [
        { id: 'first_word', name: 'Erste Schritte', desc: 'Erste Vokabel gelernt', condition: () => state.items.some(i => i.attempts > 0) },
        { id: 'daily_goal', name: 'Tägliches Ziel', desc: 'Tagesziel erreicht', condition: () => todayCount >= (state.dailyGoal || 20) },
        { id: 'streak_7', name: 'Woche perfekt', desc: '7 Tage Streak', condition: () => (state.streak || 0) >= 7 },
        { id: 'streak_30', name: 'Monat perfekt', desc: '30 Tage Streak', condition: () => (state.streak || 0) >= 30 },
        { id: 'hundred_cards', name: 'Jahrhundert', desc: '100 Karten gelernt', condition: () => state.items.length >= 100 }
    ];
    
    achievements.forEach(achievement => {
        if (!state.achievements.includes(achievement.id) && achievement.condition()) {
            state.achievements.push(achievement.id);
            showAchievementNotification(achievement);
        }
    });
    
    // Render achievements list
    const achievementsList = byId('achievementsList');
    if (achievementsList) {
        achievementsList.innerHTML = achievements
            .filter(a => state.achievements.includes(a.id))
            .map(a => `<div class="achievement">🏆 <strong>${a.name}</strong>: ${a.desc}</div>`)
            .join('');
    }
}

function showAchievementNotification(achievement) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-popup">
            <div class="achievement-icon">🏆</div>
            <div>
                <div style="font-weight:600;">${achievement.name}</div>
                <div style="font-size:12px;">${achievement.desc}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after animation
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 4000);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Tab navigation
    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            console.log('Tab clicked:', tabName);
            showView(tabName);
            if (tabName === 'learn') {
                updateLearn();
            } else if (tabName === 'manage') {
                renderList();
            }
        });
    });
    
    // Form type switching for Add tab
    const addTypeSelect = byId('addTypeSelect');
    if (addTypeSelect) {
        addTypeSelect.addEventListener('change', () => {
            const selectedType = addTypeSelect.value;
            showAddForm(selectedType);
        });
    }
    
    // Mode selection buttons
    const modeButtons = document.querySelectorAll('.mode-btn');
    console.log('Found mode buttons:', modeButtons.length);
    
    modeButtons.forEach(btn => {
        console.log('Setting up button:', btn.id, 'with mode:', btn.getAttribute('data-mode'));
        btn.addEventListener('click', (e) => {
            console.log('Mode button clicked:', btn.id);
            const mode = btn.getAttribute('data-mode');
            console.log('Mode to select:', mode);
            selectMode(mode);
        });
    });
    
    // Direction change
    if (dirSelect) {
        dirSelect.value = state.settings.direction;
        dirSelect.addEventListener('change', () => {
            state.settings.direction = dirSelect.value;
            currentId = null;
            save();
            updateLearn();
        });
    }
    
    // Audio button
    const speakBtn = byId('speakBtn');
    if (speakBtn) {
        speakBtn.addEventListener('click', async () => {
            if (!currentId) return;
            const card = cardById(currentId);
            if (!card) return;
            
            const textToSpeak = dir() === 'it-de' ? card.it : card.de;
            const isItalian = dir() === 'it-de';
            
            try {
                if (isItalian) {
                    await audioManager.speakItalian(textToSpeak);
                } else {
                    await audioManager.speakGerman(textToSpeak);
                }
            } catch (error) {
                console.log('Audio failed:', error);
            }
        });
    }
    
    // Type checking buttons
    const typeCheckBtn = byId('typeCheckBtn');
    const typeRevealBtn = byId('typeRevealBtn');
    if (typeCheckBtn) {
        typeCheckBtn.onclick = () => {
            const input = byId('typeInput')?.value.trim();
            const correct = dir() === 'it-de' ? cardById(currentId).de : cardById(currentId).it;
            checkType(input, correct);
        };
    }
    if (typeRevealBtn) {
        typeRevealBtn.onclick = () => {
            const correct = dir() === 'it-de' ? cardById(currentId).de : cardById(currentId).it;
            const feedback = byId('typeFeedback');
            if (feedback) {
                feedback.textContent = `Antwort: ${correct}`;
                feedback.className = 'type-feedback';
                feedback.style.display = 'block';
            }
        };
    }
    
    // Enter key support for type input
    const typeInput = byId('typeInput');
    if (typeInput) {
        typeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                
                // Only proceed if input is not disabled (hasn't been checked yet)
                if (typeInput.disabled) return;
                
                const input = typeInput.value.trim();
                if (!input) return; // Don't check empty input
                
                const correct = dir() === 'it-de' ? cardById(currentId).de : cardById(currentId).it;
                console.log('Enter pressed - checking type:', input, 'vs', correct);
                checkType(input, correct);
            }
        });
    }
    
    // Conjugation checking buttons
    const conjCheckBtn = byId('conjCheckBtn');
    const conjRevealBtn = byId('conjRevealBtn');
    if (conjCheckBtn) {
        conjCheckBtn.onclick = checkConjugation;
    }
    if (conjRevealBtn) {
        conjRevealBtn.onclick = () => {
            if (!currentConjugation) return;
            const correct = currentConjugation.card.extra.conjugations[currentConjugation.tense][currentConjugation.pronoun];
            const feedback = byId('conjFeedback');
            if (feedback) {
                feedback.textContent = `Antwort: ${correct}`;
                feedback.className = 'type-feedback';
                feedback.style.display = 'block';
            }
        };
    }
    
    // Enter key support for conjugation input
    const conjugationInput = byId('conjugationInput');
    if (conjugationInput) {
        conjugationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                
                // Only proceed if input is not disabled (hasn't been checked yet)
                if (conjugationInput.disabled) return;
                
                const input = conjugationInput.value.trim();
                if (!input) return; // Don't check empty input
                
                console.log('Enter pressed - checking conjugation:', input);
                checkConjugation();
            }
        });
    }
    
    // Gaptext checking buttons
    const gaptextCheckBtn = byId('gaptextCheckBtn');
    const gaptextRevealBtn = byId('gaptextRevealBtn');
    if (gaptextCheckBtn) {
        gaptextCheckBtn.onclick = checkGaptext;
    }
    if (gaptextRevealBtn) {
        gaptextRevealBtn.onclick = () => {
            if (!currentGaptext) return;
            const feedback = byId('gaptextFeedback');
            if (feedback) {
                feedback.textContent = `Antwort: ${currentGaptext.answer}`;
                feedback.className = 'type-feedback';
                feedback.style.display = 'block';
            }
        };
    }
    
    // Add button functionality
    const addBtn = byId('addBtn');
    if (addBtn) {
        addBtn.addEventListener('click', addCard);
    }
    
    // Reset button functionality
    const resetBtn = byId('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            // Clear all input fields
            const inputs = ['itInput', 'deInput', 'notesInput', 'prepWord', 'prepMeaning', 'prepDescription', 'prepContext1', 'prepContext2', 'prepContext3', 'articleWord', 'articleTranslation', 'articleNotes'];
            inputs.forEach(id => {
                const input = byId(id);
                if (input) input.value = '';
            });
            
            // Reset selects
            const selects = ['addTypeSelect', 'articleSelect', 'genderSelect'];
            selects.forEach(id => {
                const select = byId(id);
                if (select) select.selectedIndex = 0;
            });
            
            // Show default form
            showAddForm('vocab');
        });
    }
    
    // Export/Import/Clear functionality
    const exportBtn = byId('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    const importBtn = byId('importBtn');
    const importFile = byId('importFile');
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', importData);
    }
    
    // CSV Template Download
    const csvTplBtn = byId('csvTplBtn');
    if (csvTplBtn) {
        csvTplBtn.addEventListener('click', downloadCSVTemplate);
    }
    
    const clearBtn = byId('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllData);
    }
    
    // Initialize settings controls
    initializeSettings();
    
    // Lade und zeige Statistiken
    renderStats();
    
    // Initialize
    showView('learn');
    selectMode('flashcards'); // Default mode
    updateLearn();
});

// Learning algorithm
function updateLearn(){
    console.log('updateLearn called, currentId:', currentId);
    const activeItems=state.items.filter(i=>!i.suspended);
    console.log('Active items:', activeItems.length);
    if(!activeItems.length){
        learnWord.textContent='Keine aktiven Karten';
        learnMeta.textContent='Füge neue Wörter hinzu!';
        return;
    }
    
    // Filter by current mode
    const m = mode();
    let filteredItems = activeItems;
    
    if (m === 'conjugation') {
        filteredItems = activeItems.filter(i => i.type === 'verb');
    } else if (m === 'preposition') {
        filteredItems = activeItems.filter(i => i.type === 'prep');
    } else if (m === 'articles') {
        filteredItems = activeItems.filter(i => i.type === 'article');
    }
    // flashcards, mc, type, gaptext accept all types
    
    if(!filteredItems.length){
        learnWord.textContent=`Keine ${m === 'conjugation' ? 'Verben' : m === 'preposition' ? 'Präpositionen' : m === 'articles' ? 'Artikel' : 'Karten'} verfügbar`;
        learnMeta.textContent='Wähle einen anderen Modus oder füge Inhalte hinzu';
        return;
    }
    
    const due=filteredItems.filter(i=>(i.dueAt||0)<=now());
    console.log('Due items:', due.length, 'of', filteredItems.length, 'filtered items');
    console.log('Current time:', now(), 'First few due dates:', filteredItems.slice(0,3).map(i => ({id: i.id, dueAt: i.dueAt, isDue: (i.dueAt||0)<=now()})));
    
    // If no due cards, allow practice with any card for nextFlashcard
    let cardsToUse = due;
    if(!due.length && window.lastClickWasNext) {
        console.log('No due cards, but allowing practice');
        cardsToUse = filteredItems; // Allow practice with any card
        window.lastClickWasNext = false;
    }
    
    if(!cardsToUse.length){
        const nextDue=filteredItems.reduce((min,i)=>!min||(i.dueAt||0)<(min.dueAt||0)?i:min,null);
        if(nextDue?.dueAt){
            learnWord.textContent='Gut gemacht! 🎉';
            learnMeta.textContent='Alle Karten für heute gelernt! Drücke "Weiter" zum Üben';
        } else {
            learnWord.textContent='Alle Karten gelernt!';
            learnMeta.textContent='Füge neue Inhalte hinzu';
        }
        return;
    }
    
    if(!currentId||!cardsToUse.find(i=>i.id===currentId)){
        // Prioritize cards based on difficulty and skip count
        const sorted=cardsToUse.slice().sort((a,b)=>{
            // Higher priority for frequently skipped cards
            const aSkipPriority = (a.skippedCount || 0) * 10;
            const bSkipPriority = (b.skippedCount || 0) * 10;
            
            // Higher priority for low success rate
            const aSuccessRate = a.attempts ? (a.correct || 0) / a.attempts : 1;
            const bSuccessRate = b.attempts ? (b.correct || 0) / b.attempts : 1;
            const aFailurePriority = (1 - aSuccessRate) * 5;
            const bFailurePriority = (1 - bSuccessRate) * 5;
            
            // Combined priority score (higher = more priority)
            const aPriority = aSkipPriority + aFailurePriority;
            const bPriority = bSkipPriority + bFailurePriority;
            
            // If priorities are similar, sort by due date
            if(Math.abs(aPriority - bPriority) < 0.1) {
                return (a.dueAt||0)-(b.dueAt||0);
            }
            
            return bPriority - aPriority; // Higher priority first
        });
        
        // If this was triggered by "Weiter" button and we have multiple cards,
        // try to pick a different card than the last one
        if(window.lastClickWasNext && sorted.length > 1) {
            // Find a different card than the last one shown
            const lastId = window.lastCardId || currentId;
            const differentCards = sorted.filter(c => c.id !== lastId);
            if(differentCards.length > 0) {
                // Pick the highest priority different card
                currentId = differentCards[0].id;
                console.log('Selected different card for practice:', currentId, 'avoiding last card:', lastId);
            } else {
                currentId = sorted[0].id;
                console.log('Only one card available, selected:', currentId);
            }
        } else {
            // Pick the highest priority card
            currentId = sorted[0].id;
            console.log('Normal card selection:', currentId, 'from', cardsToUse.length, 'cards to use');
        }
    }
    
    const card=cardById(currentId);
    console.log('Card found:', card ? card.it : 'No card');
    if(!card) return;
    
    // Mode-specific display
    const currentMode = mode();
    if (currentMode === 'flashcards') {
        setupFlashcardMode(card);
    } else if (currentMode === 'type') {
        setupTypeMode(card);
    } else if (currentMode === 'conjugation' && card.type === 'verb') {
        setupConjugationMode(card);
    } else if (currentMode === 'preposition' && card.type === 'prep') {
        setupPrepositionMode(card);
    } else if (currentMode === 'articles' && card.type === 'article') {
        setupArticleMode(card);
    } else {
        // Fallback to flashcards
        setupFlashcardMode(card);
    }
}

// Mode setup functions
function setupFlashcardMode(card) {
    hideAllModeBoxes();
    const q = dir() === 'it-de' ? card.it : card.de;
    const a = dir() === 'it-de' ? card.de : card.it;
    
    // Show flashcard container
    const flashcardContainer = document.getElementById('flashcardContainer');
    flashcardContainer.style.display = 'block';
    
    // Set up flashcard content - einfach ohne Animation
    const flashcardWord = document.getElementById('flashcardWord');
    const flashcard = document.getElementById('flashcard');
    const flashcardActions = document.getElementById('flashcardActions');
    
    // Einfach die Frage anzeigen
    flashcardWord.textContent = q;
    flashcardWord.style.color = 'var(--text)'; // Normale Farbe für Frage
    
    // Status verfolgen
    let isShowingAnswer = false;
    
    // Buttons initial zurücksetzen
    const flashcardButtons = document.getElementById('flashcardButtons');
    const nextCardBtn = document.getElementById('nextCardBtn');
    if (flashcardButtons) flashcardButtons.style.display = 'none';
    if (nextCardBtn) nextCardBtn.style.display = 'block';
    
    // Show actions
    if (flashcardActions) flashcardActions.style.display = 'block';
    
    // Hide the word area since we're using flashcards
    learnWord.textContent = '';
    learnMeta.textContent = `${card.type === 'verb' ? '⚡' : card.type === 'prep' ? '🔗' : card.type === 'article' ? '🎯' : '📚'} Karteikarten - ${getDirText()} - Einfacher Wechsel`;
    
    // Auto-speak if enabled
    if (state.settings.autoSpeak) {
        setTimeout(async () => {
            try {
                const isItalian = dir() === 'it-de';
                if (isItalian) {
                    await audioManager.speakItalian(q);
                } else {
                    await audioManager.speakGerman(q);
                }
            } catch (error) {
                console.log('Auto speak failed:', error);
            }
        }, 300);
    }
    
    // Setup flashcard mode with manual control only
    // because it interferes with the manual click-based grading system
    
    // Einfacher Klick-Handler: Text wechseln statt drehen
    const clickHandler = async () => {
        const flashcardButtons = document.getElementById('flashcardButtons');
        const nextCardBtn = document.getElementById('nextCardBtn');
        
        if (!isShowingAnswer) {
            flashcardWord.textContent = a;
            flashcardWord.style.color = 'var(--ok)'; // Grün für Antwort
            isShowingAnswer = true;
            
            // Audio beim Umdrehen abspielen (speakOnFlip)
            if (state.settings.speakOnFlip) {
                try {
                    const isItalian = dir() === 'it-de';
                    if (isItalian) {
                        await audioManager.speakGerman(a); // Antwort ist deutsch
                    } else {
                        await audioManager.speakItalian(a); // Antwort ist italienisch
                    }
                } catch (error) {
                    console.log('Speak on flip failed:', error);
                }
            }
            
            // Zeige Bewertungsbuttons, verstecke Weiter-Button
            if (flashcardButtons) {
                flashcardButtons.style.display = 'flex';
            }
            if (nextCardBtn) {
                nextCardBtn.style.display = 'none';
            }
        } else {
            flashcardWord.textContent = q;
            flashcardWord.style.color = 'var(--text)'; // Normal für Frage
            isShowingAnswer = false;
            
            // Verstecke Bewertungsbuttons, zeige Weiter-Button
            if (flashcardButtons) {
                flashcardButtons.style.display = 'none';
            }
            if (nextCardBtn) {
                nextCardBtn.style.display = 'block';
            }
        }
    };
    
    flashcard.removeEventListener('click', clickHandler);
    flashcard.addEventListener('click', clickHandler);
    flashcard.style.cursor = 'pointer';
}

function setupTypeMode(card) {
    hideAllModeBoxes();
    const typeBox = byId('typeBox');
    if (typeBox) typeBox.style.display = 'block';
    
    const q = dir() === 'it-de' ? card.it : card.de;
    const a = dir() === 'it-de' ? card.de : card.it;
    
    learnWord.textContent = q;
    learnMeta.textContent = '⌨️ Tippen - Übersetze das Wort';
    
    const typeInput = byId('typeInput');
    if (typeInput) {
        typeInput.value = '';
        typeInput.focus();
        typeInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                checkType(typeInput.value, a);
            }
        };
    }
}

function setupConjugationMode(card) {
    if (!card.extra?.conjugations) return updateLearn();
    
    hideAllModeBoxes();
    const conjBox = byId('conjugationBox');
    if (conjBox) conjBox.style.display = 'block';
    
    const tense = 'presente'; // Default to present tense
    const pronouns = ['io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro'];
    const pronoun = pronouns[Math.floor(Math.random() * pronouns.length)];
    
    currentConjugation = { pronoun, card, tense };
    
    learnWord.textContent = card.extra.infinitive || card.it;
    learnMeta.textContent = '⚡ Verb-Konjugation - Presente';
    
    const pronounEl = byId('conjugationPronoun');
    if (pronounEl) pronounEl.textContent = pronoun;
    
    const conjInput = byId('conjugationInput');
    if (conjInput) {
        conjInput.value = '';
        conjInput.focus();
        conjInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                checkConjugation();
            }
        };
    }
}

function checkConjugation() {
    if (!currentConjugation) return;
    
    const input = byId('conjugationInput')?.value.trim();
    const correct = currentConjugation.card.extra.conjugations[currentConjugation.tense][currentConjugation.pronoun];
    const isCorrect = isClose(input, correct);
    
    const feedback = byId('conjFeedback');
    if (feedback) {
        feedback.textContent = isCorrect ? '✓ Richtig!' : `✗ Richtig wäre: ${correct}`;
        feedback.className = `type-feedback ${isCorrect ? 'ok' : 'bad'}`;
        feedback.style.display = 'block';
    }
    
    // Show continue button instead of auto-advancing
    const continueBtn = byId('conjContinueBtn');
    if (continueBtn) {
        continueBtn.style.display = 'block';
        continueBtn.textContent = isCorrect ? 'Weiter' : 'Verstanden, weiter';
        continueBtn.focus();
    }
    
    // Disable input field
    const conjInput = byId('conjugationInput');
    if (conjInput) conjInput.disabled = true;
    
    // Store result
    window.pendingConjResult = isCorrect ? 'good' : 'again';
}

function continueFromConjugation() {
    if (window.pendingConjResult) {
        gradeCard(window.pendingConjResult);
        window.pendingConjResult = null;
    }
    
    // Reset UI
    const feedback = byId('conjFeedback');
    if (feedback) feedback.style.display = 'none';
    
    const continueBtn = byId('conjContinueBtn');
    if (continueBtn) continueBtn.style.display = 'none';
    
    const conjInput = byId('conjugationInput');
    if (conjInput) {
        conjInput.disabled = false;
        conjInput.value = '';
    }
}

function setupPrepositionMode(card) {
    hideAllModeBoxes();
    const prepBox = byId('prepositionBox');
    if (prepBox) prepBox.style.display = 'block';
    
    const contexts = card.extra?.contexts || [];
    if (!contexts.length) return updateLearn();
    
    const context = contexts[Math.floor(Math.random() * contexts.length)];
    const correctPrep = card.it;
    
    currentPrepContext = { context, correct: correctPrep };
    
    learnWord.textContent = '';
    learnMeta.textContent = '🔗 Präposition - Welche passt?';
    
    const contextEl = byId('prepositionContext');
    if (contextEl) contextEl.textContent = context;
    
    // Generate preposition options
    const prepOptions = byId('prepOptions');
    if (prepOptions) {
        // Get all available prepositions
        const allPrepositions = ['a', 'di', 'da', 'in', 'con', 'per', 'su', 'tra', 'fra'];
        const correctPreposition = card.it;
        
        // Always include correct answer and 2-3 distractors
        let options = [correctPreposition];
        const distractors = allPrepositions.filter(p => p !== correctPreposition);
        options.push(...shuffle(distractors).slice(0, 2));
        options = shuffle(options);
        
        prepOptions.innerHTML = options.map(prep => 
            `<button class="btn ghost clickfx" onclick="checkPreposition('${prep}', '${correctPreposition}')">${prep}</button>`
        ).join('');
    }
}

function setupArticleMode(card) {
    hideAllModeBoxes();
    const articleBox = byId('articleBox');
    if (articleBox) articleBox.style.display = 'block';
    
    if (!card.extra?.article || !card.extra?.word) return updateLearn();
    
    currentArticle = { correct: card.extra.article, word: card.extra.word };
    
    learnWord.textContent = '';
    learnMeta.textContent = '🎯 Artikel - Welcher ist richtig?';
    
    const wordEl = byId('articleWord');
    if (wordEl) wordEl.textContent = card.extra.word;
    
    // Generate article options
    const articleOptions = byId('articleOptions');
    if (articleOptions) {
        const allArticles = ['il', 'la', 'lo', 'l\'', 'i', 'le', 'gli'];
        const correctArticle = card.extra.article;
        
        // Always include correct answer and 2-3 distractors
        let options = [correctArticle];
        const distractors = allArticles.filter(a => a !== correctArticle);
        options.push(...shuffle(distractors).slice(0, 2));
        options = shuffle(options);
        
        articleOptions.innerHTML = options.map(article => 
            `<button class="btn ghost clickfx" onclick="checkArticle('${article}', '${correctArticle}')">${article}</button>`
        ).join('');
    }
}

function hideAllModeBoxes() {
    const boxes = ['typeBox', 'conjugationBox', 'prepositionBox', 'articleBox', 'flashcardContainer'];
    boxes.forEach(boxId => {
        const box = byId(boxId);
        if (box) box.style.display = 'none';
    });
    
    // Also hide flashcard actions
    const flashcardActions = byId('flashcardActions');
    if (flashcardActions) flashcardActions.style.display = 'none';
    
    // Reset word display
    if (learnWord) {
        learnWord.style.cursor = 'default';
        learnWord.title = '';
        learnWord.innerHTML = learnWord.textContent; // Clear any HTML
    }
}

// Answer checking functions
function checkArticle(selected, correct) {
    const isCorrect = selected === correct;
    lastCorrect = isCorrect;
    
    const feedback = byId('articleFeedback');
    if (feedback) {
        feedback.textContent = isCorrect ? '✓ Richtig!' : `✗ Richtig wäre: ${correct}`;
        feedback.className = `type-feedback ${isCorrect ? 'ok' : 'bad'}`;
        feedback.style.display = 'block';
    }
    
    // Show continue button and disable article buttons
    const continueBtn = byId('articleContinueBtn');
    if (continueBtn) {
        continueBtn.style.display = 'block';
        continueBtn.textContent = isCorrect ? 'Weiter' : 'Verstanden, weiter';
        continueBtn.focus();
    }
    
    // Disable all article option buttons
    const articleOptions = byId('articleOptions');
    if (articleOptions) {
        const buttons = articleOptions.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);
    }
    
    // Store result for continue function
    window.pendingArticleResult = isCorrect ? 'good' : 'again';
}

function checkPreposition(selected, correct) {
    const isCorrect = selected === correct;
    lastCorrect = isCorrect;
    
    const feedback = byId('prepFeedback');
    if (feedback) {
        feedback.textContent = isCorrect ? '✓ Richtig!' : `✗ Richtig wäre: ${correct}`;
        feedback.className = `type-feedback ${isCorrect ? 'ok' : 'bad'}`;
        feedback.style.display = 'block';
    }
    
    // Show continue button and disable preposition buttons
    const continueBtn = byId('prepContinueBtn');
    if (continueBtn) {
        continueBtn.style.display = 'block';
        continueBtn.textContent = isCorrect ? 'Weiter' : 'Verstanden, weiter';
        continueBtn.focus();
    }
    
    // Disable all preposition buttons
    const prepButtons = document.querySelectorAll('#prepositionOptions button');
    prepButtons.forEach(btn => btn.disabled = true);
    
    // Store result
    window.pendingPrepResult = isCorrect ? 'good' : 'again';
}

function continueFromPreposition() {
    if (window.pendingPrepResult) {
        gradeCard(window.pendingPrepResult);
        window.pendingPrepResult = null;
    }
    
    // Reset UI
    const feedback = byId('prepFeedback');
    if (feedback) feedback.style.display = 'none';
    
    const continueBtn = byId('prepContinueBtn');
    if (continueBtn) continueBtn.style.display = 'none';
    
    // Re-enable preposition buttons (will be reset when new question loads)
    const prepButtons = document.querySelectorAll('#prepositionOptions button');
    prepButtons.forEach(btn => btn.disabled = false);
}

function checkType(input, correct) {
    const isCorrect = isClose(input, correct);
    lastCorrect = isCorrect;
    
    const feedback = byId('typeFeedback');
    if (feedback) {
        feedback.textContent = isCorrect ? '✓ Richtig!' : `✗ Richtig wäre: ${correct}`;
        feedback.className = `type-feedback ${isCorrect ? 'ok' : 'bad'}`;
        feedback.style.display = 'block';
    }
    
    // Show continue button instead of auto-advancing
    const continueBtn = byId('typeContinueBtn');
    if (continueBtn) {
        continueBtn.style.display = 'block';
        continueBtn.textContent = isCorrect ? 'Weiter' : 'Verstanden, weiter';
        continueBtn.focus();
    }
    
    // Disable input field to prevent further typing
    const typeInput = byId('typeInput');
    if (typeInput) {
        typeInput.disabled = true;
    }
    
    // Store the result for when user clicks continue
    window.pendingTypeResult = isCorrect ? 'good' : 'again';
}

function continueFromType() {
    // Process the stored result
    if (window.pendingTypeResult) {
        gradeCard(window.pendingTypeResult);
        window.pendingTypeResult = null;
    }
    
    // Reset UI elements
    const feedback = byId('typeFeedback');
    if (feedback) feedback.style.display = 'none';
    
    const continueBtn = byId('typeContinueBtn');
    if (continueBtn) continueBtn.style.display = 'none';
    
    const typeInput = byId('typeInput');
    if (typeInput) {
        typeInput.disabled = false;
        typeInput.value = '';
    }
}

// Grading system
function gradeCard(result) {
    if (!currentId) return;
    
    const card = cardById(currentId);
    if (!card) return;
    
    const updated = nextSchedule(card, result);
    Object.assign(card, updated);
    
    addHistory(result);
    currentId = null;
    save();
    
    setTimeout(updateLearn, 500);
}

function addHistory(r) {
    const k = new Date().toISOString().slice(0, 10);
    let row = state.history.find(x => x.d === k);
    if (!row) {
        row = { 
            d: k, 
            good: 0, 
            bad: 0, 
            categories: {}, 
            total: 0, 
            timeSpent: 0
        };
        state.history.push(row);
    }
    
    // Grundlegende Statistiken
    if (r === 'good') row.good++;
    else row.bad++;
    row.total = (row.total || 0) + 1;
    
    // Kategorie-Statistiken
    if (state.currentLesson && state.currentLesson.category) {
        const category = state.currentLesson.category;
        if (!row.categories) row.categories = {};
        if (!row.categories[category]) {
            row.categories[category] = { total: 0, correct: 0 };
        }
        row.categories[category].total++;
        if (r === 'good') {
            row.categories[category].correct++;
        }
    }
    
    save();
    checkAchievements();
}

function calculateStreak() {
    if (!state.history || state.history.length === 0) return 0;
    
    let streak = 0;
    const sortedHistory = [...state.history]
        .sort((a, b) => new Date(b.d) - new Date(a.d));
    
    for (const entry of sortedHistory) {
        const total = entry.total || (entry.good + entry.bad);
        if (total > 0) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

// Export/Import Funktionen für Statistiken
function exportData() {
    const data = {
        lessons: state.lessons,
        history: state.history,
        settings: {
            newPerSession: state.newPerSession,
            maxReviews: state.maxReviews,
            tolerance: state.tolerance,
            speechRate: state.speechRate,
            autoSpeak: state.autoSpeak,
            speakOnFlip: state.speakOnFlip,
            repeatAudio: state.repeatAudio,
            dailyGoal: state.dailyGoal
        },
        exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `italienisch-lernen-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            let data;
            
            if (file.name.endsWith('.csv')) {
                // CSV Import
                data = parseCSV(content);
                if (data.lessons) {
                    state.lessons = [...state.lessons, ...data.lessons];
                    save();
                    render();
                    alert(`${data.lessons.length} Vokabeln aus CSV erfolgreich importiert!`);
                }
            } else {
                // JSON Import (vollständiger Backup)
                data = JSON.parse(content);
                
                if (data.lessons) state.lessons = data.lessons;
                if (data.history) state.history = data.history;
                if (data.settings) {
                    state.newPerSession = data.settings.newPerSession || 10;
                    state.maxReviews = data.settings.maxReviews || 100;
                    state.tolerance = data.settings.tolerance || 'medium';
                    state.speechRate = data.settings.speechRate || 1.0;
                    state.autoSpeak = data.settings.autoSpeak || false;
                    state.speakOnFlip = data.settings.speakOnFlip !== false;
                    state.repeatAudio = data.settings.repeatAudio || false;
                    state.dailyGoal = data.settings.dailyGoal || 20;
                }
                
                save();
                initializeSettings(); // Aktualisiere UI
                renderStats(); // Aktualisiere Statistiken
                render(); // Aktualisiere Hauptansicht
                
                alert('Vollständige Daten erfolgreich importiert!');
            }
        } catch (error) {
            alert('Fehler beim Importieren: ' + error.message);
        }
        
        // Reset file input
        event.target.value = '';
    };
    reader.readAsText(file);
}

function parseCSV(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const lessons = [];
    
    // Skip header if it exists
    let startIndex = 0;
    if (lines[0] && lines[0].toLowerCase().includes('italian')) {
        startIndex = 1;
    }
    
    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple CSV parsing (handles basic cases)
        const parts = line.split(',').map(part => part.trim().replace(/^"|"$/g, ''));
        
        if (parts.length >= 2) {
            const italian = parts[0];
            const german = parts[1];
            const category = parts[2] || 'imported';
            
            if (italian && german) {
                lessons.push({
                    id: Date.now() + Math.random(),
                    it: italian,
                    de: german,
                    category: category,
                    reps: 0,
                    interval: 1,
                    ef: 2.5,
                    due: Date.now(),
                    suspended: false
                });
            }
        }
    }
    
    return { lessons };
}

function downloadCSVTemplate() {
    const csvContent = `italian,german,category
mangiare,essen,verbs
casa,Haus,nouns
bello,schön,adjectives
con,mit,prepositions`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'italienisch-lernen-vorlage.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// Helper functions
function getModeText() {
    const m = mode();
    const modes = {
        'flashcards': 'Karteikarten',
        'type': 'Tippen',
        'conjugation': 'Verben',
        'preposition': 'Präpositionen',
        'articles': 'Artikel',
        'gaptext': 'Lückentext'
    };
    return modes[m] || 'Lernen';
}

function getDirText() {
    return dir() === 'it-de' ? 'IT→DE' : 'DE→IT';
}

// List management with bulk actions
function renderList() {
    const tbody = byId('tableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    state.items.forEach(item => {
        const row = document.createElement('tr');
        const successRate = item.attempts > 0 ? Math.round((item.correct / item.attempts) * 100) : 0;
        const dueText = item.dueAt && item.dueAt > now() ? 
            Math.ceil((item.dueAt - now()) / (1000 * 60 * 60 * 24)) + ' Tage' : 
            'Fällig';
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="row-checkbox" data-id="${item.id}">
            </td>
            <td><strong>${item.it}</strong></td>
            <td>${item.de}</td>
            <td>${dueText}</td>
            <td>${item.streak || 0}</td>
            <td>${successRate}%</td>
            <td>${item.suspended ? '⏸️ Pausiert' : '▶️ Aktiv'}</td>
            <td>
                <button class="btn ghost btn-xs suspend-btn" data-id="${item.id}">
                    ${item.suspended ? 'Aktivieren' : 'Pausieren'}
                </button>
                <button class="btn ghost btn-xs delete-btn" data-id="${item.id}">Löschen</button>
            </td>
        `;
        
        // Add event listeners for the buttons
        const suspendBtn = row.querySelector('.suspend-btn');
        const deleteBtn = row.querySelector('.delete-btn');
        const checkbox = row.querySelector('.row-checkbox');
        
        if (suspendBtn) {
            suspendBtn.addEventListener('click', () => toggleSuspend(item.id));
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteCard(item.id));
        }
        
        if (checkbox) {
            checkbox.addEventListener('change', updateBulkToolbar);
        }
        
        tbody.appendChild(row);
    });
    
    // Update counter
    const countTxt = byId('countTxt');
    if (countTxt) countTxt.textContent = state.items.length;
    
    updateBulkToolbar();
    initializeBulkActions();
}

function toggleSuspend(id) {
    const card = cardById(id);
    if (card) {
        card.suspended = !card.suspended;
        save();
        renderList();
    }
}

function deleteCard(id) {
    if (confirm('Karte wirklich löschen?')) {
        state.items = state.items.filter(c => c.id !== id);
        save();
        renderList();
    }
}

// Bulk actions functionality
function updateBulkToolbar() {
    const checkboxes = document.querySelectorAll('.row-checkbox');
    const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
    const bulkToolbar = byId('bulkToolbar');
    const selectedCount = byId('selectedCount');
    const selectAllCheckbox = byId('selectAllCheckbox');
    
    if (!bulkToolbar || !selectedCount || !selectAllCheckbox) return;
    
    const selectedItems = selectedCheckboxes.length;
    const totalItems = checkboxes.length;
    
    // Show/hide toolbar
    if (selectedItems > 0) {
        bulkToolbar.style.display = 'flex';
        selectedCount.textContent = selectedItems;
    } else {
        bulkToolbar.style.display = 'none';
    }
    
    // Update select all checkbox
    if (selectedItems === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
    } else if (selectedItems === totalItems) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = true;
    } else {
        selectAllCheckbox.indeterminate = true;
        selectAllCheckbox.checked = false;
    }
    
    // Update row styling
    document.querySelectorAll('tbody tr').forEach((row, index) => {
        const checkbox = row.querySelector('.row-checkbox');
        if (checkbox && checkbox.checked) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    });
}

function getSelectedIds() {
    const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
    return Array.from(selectedCheckboxes).map(cb => cb.getAttribute('data-id'));
}

function bulkDelete() {
    console.log('bulkDelete called');
    const selectedIds = getSelectedIds();
    console.log('Selected IDs:', selectedIds);
    
    if (selectedIds.length === 0) {
        alert('Keine Karten ausgewählt!');
        return;
    }
    
    if (confirm(`${selectedIds.length} Karten wirklich löschen?`)) {
        console.log('User confirmed deletion');
        state.items = state.items.filter(item => !selectedIds.includes(item.id));
        save();
        renderList();
        alert('Karten wurden gelöscht!');
    }
}

function bulkSuspend() {
    const selectedIds = getSelectedIds();
    if (selectedIds.length === 0) return;
    
    selectedIds.forEach(id => {
        const card = cardById(id);
        if (card) card.suspended = true;
    });
    save();
    renderList();
}

function bulkActivate() {
    const selectedIds = getSelectedIds();
    if (selectedIds.length === 0) return;
    
    selectedIds.forEach(id => {
        const card = cardById(id);
        if (card) card.suspended = false;
    });
    save();
    renderList();
}

function selectAll() {
    const checkboxes = document.querySelectorAll('.row-checkbox');
    const selectAllCheckbox = byId('selectAllCheckbox');
    
    if (!selectAllCheckbox) return;
    
    const shouldCheck = selectAllCheckbox.checked;
    checkboxes.forEach(cb => cb.checked = shouldCheck);
    updateBulkToolbar();
}

function deselectAll() {
    const checkboxes = document.querySelectorAll('.row-checkbox');
    const selectAllCheckbox = byId('selectAllCheckbox');
    
    checkboxes.forEach(cb => cb.checked = false);
    if (selectAllCheckbox) selectAllCheckbox.checked = false;
    updateBulkToolbar();
}

// Initialize bulk actions (called after DOM elements are available)
function initializeBulkActions() {
    // Only initialize once
    if (window.bulkActionsInitialized) return;
    
    const selectAllCheckbox = byId('selectAllCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', selectAll);
    }
    
    const bulkDeleteBtn = byId('bulkDeleteBtn');
    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', bulkDelete);
    }
    
    const bulkSuspendBtn = byId('bulkSuspendBtn');
    if (bulkSuspendBtn) {
        bulkSuspendBtn.addEventListener('click', bulkSuspend);
    }
    
    const bulkActivateBtn = byId('bulkActivateBtn');
    if (bulkActivateBtn) {
        bulkActivateBtn.addEventListener('click', bulkActivate);
    }
    
    const deselectAllBtn = byId('deselectAllBtn');
    if (deselectAllBtn) {
        deselectAllBtn.addEventListener('click', deselectAll);
    }
    
    window.bulkActionsInitialized = true;
    console.log('Bulk actions initialized successfully');
}

// Add new card (enhanced for all types)
function addCard() {
    const typeSelect = byId('addTypeSelect');
    const type = typeSelect?.value || 'vocab';
    
    if (type === 'article') {
        addArticleCard();
        return;
    }
    
    if (type === 'prep') {
        addPrepositionCard();
        return;
    }
    
    const itInput = byId('itInput');
    const deInput = byId('deInput');
    const notesInput = byId('notesInput');
    
    if (!itInput || !deInput || !itInput.value.trim() || !deInput.value.trim()) {
        alert('Bitte füllen Sie beide Felder aus!');
        return;
    }
    
    const newCard = {
        id: uid(),
        it: itInput.value.trim(),
        de: deInput.value.trim(),
        notes: notesInput?.value?.trim() || '',
        type: type,
        category: 'custom',
        createdAt: now(),
        dueAt: now(),
        intervalIndex: 0,
        streak: 0,
        suspended: false,
        attempts: 0,
        correct: 0
    };
    
    state.items.push(newCard);
    save();
    
    // Clear inputs
    itInput.value = '';
    deInput.value = '';
    if (notesInput) notesInput.value = '';
    
    alert('Karte hinzugefügt!');
}

// Add article card specifically
function addArticleCard() {
    const wordInput = byId('articleWord');
    const translationInput = byId('articleTranslation');
    const articleSelect = byId('articleSelect');
    const genderSelect = byId('genderSelect');
    const notesInput = byId('articleNotes');
    
    if (!wordInput?.value.trim() || !translationInput?.value.trim() || !articleSelect?.value || !genderSelect?.value) {
        alert('Bitte füllen Sie alle Pflichtfelder aus!');
        return;
    }
    
    const newCard = {
        id: uid(),
        it: wordInput.value.trim(),
        de: translationInput.value.trim(),
        notes: notesInput?.value?.trim() || '',
        type: 'article',
        category: 'custom',
        extra: {
            article: articleSelect.value,
            gender: genderSelect.value,
            word: wordInput.value.trim()
        },
        createdAt: now(),
        dueAt: now(),
        intervalIndex: 0,
        streak: 0,
        suspended: false,
        attempts: 0,
        correct: 0
    };
    
    state.items.push(newCard);
    save();
    
    // Clear inputs
    wordInput.value = '';
    translationInput.value = '';
    articleSelect.value = '';
    genderSelect.value = '';
    if (notesInput) notesInput.value = '';
    
    alert('Artikel hinzugefügt!');
}

// Add preposition card specifically  
function addPrepositionCard() {
    const wordInput = byId('prepWord');
    const meaningInput = byId('prepMeaning');
    const descriptionInput = byId('prepDescription');
    const context1Input = byId('prepContext1');
    const context2Input = byId('prepContext2');
    const context3Input = byId('prepContext3');
    
    if (!wordInput?.value.trim() || !meaningInput?.value.trim() || !context1Input?.value.trim() || !context2Input?.value.trim()) {
        alert('Bitte füllen Sie mindestens Präposition, Bedeutung und 2 Kontextsätze aus!');
        return;
    }
    
    const contexts = [
        context1Input.value.trim(),
        context2Input.value.trim()
    ];
    
    if (context3Input?.value.trim()) {
        contexts.push(context3Input.value.trim());
    }
    
    const newCard = {
        id: uid(),
        it: wordInput.value.trim(),
        de: meaningInput.value.trim(),
        notes: descriptionInput?.value?.trim() || '',
        type: 'prep',
        category: 'custom',
        extra: {
            contexts: contexts
        },
        createdAt: now(),
        dueAt: now(),
        intervalIndex: 0,
        streak: 0,
        suspended: false,
        attempts: 0,
        correct: 0
    };
    
    state.items.push(newCard);
    save();
    
    // Clear inputs
    wordInput.value = '';
    meaningInput.value = '';
    if (descriptionInput) descriptionInput.value = '';
    context1Input.value = '';
    context2Input.value = '';
    if (context3Input) context3Input.value = '';
    
    alert('Präposition hinzugefügt!');
}

// Show appropriate form based on card type
function showAddForm(type) {
    const forms = ['basicForm', 'prepForm', 'verbForm', 'articleForm'];
    forms.forEach(formId => {
        const form = byId(formId);
        if (form) form.style.display = 'none';
    });
    
    if (type === 'prep') {
        const prepForm = byId('prepForm');
        if (prepForm) prepForm.style.display = 'block';
    } else if (type === 'verb') {
        const verbForm = byId('verbForm');
        if (verbForm) verbForm.style.display = 'block';
    } else if (type === 'article') {
        const articleForm = byId('articleForm');
        if (articleForm) articleForm.style.display = 'block';
    } else {
        const basicForm = byId('basicForm');
        if (basicForm) basicForm.style.display = 'block';
    }
}

// Stop learning function
function stopLearning() {
    // Hide all mode boxes and reset to selection screen
    hideAllModeBoxes();
    
    // Reset learn display
    learnWord.textContent = '—';
    learnMeta.textContent = 'Wähle einen Lernmodus';
    
    // Reset all active mode buttons
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => btn.classList.remove('active'));
    
    console.log('Learning stopped by user');
}

// Next flashcard function
function nextFlashcard() {
    // Einfach zur nächsten Karte ohne Bewertung (für Überspringen)
    console.log('nextFlashcard called, currentId before:', currentId);
    window.lastClickWasNext = true; // Flag to allow practice with any card
    window.lastCardId = currentId; // Remember current card to avoid repeating it
    currentId = null; // Reset current card to get a new one
    console.log('currentId after reset:', currentId, 'last card was:', window.lastCardId);
    updateLearn();
}

// Grade flashcard function  
function gradeFlashcard(grade) {
    // Schwierige Wörter wiederholen (repeatAudio) - Audio bei "again" nochmals abspielen
    if (grade === 'again' && state.settings.repeatAudio && currentId) {
        const card = cardById(currentId);
        if (card) {
            setTimeout(async () => {
                try {
                    const currentText = document.getElementById('flashcardWord').textContent;
                    const isItalian = dir() === 'it-de';
                    const isShowingAnswer = document.getElementById('flashcardWord').style.color === 'var(--ok)';
                    
                    if (isShowingAnswer) {
                        // Antwort wird gerade gezeigt
                        if (isItalian) {
                            await audioManager.speakGerman(currentText);
                        } else {
                            await audioManager.speakItalian(currentText);
                        }
                    } else {
                        // Frage wird gerade gezeigt
                        if (isItalian) {
                            await audioManager.speakItalian(currentText);
                        } else {
                            await audioManager.speakGerman(currentText);
                        }
                    }
                } catch (error) {
                    console.log('Repeat audio failed:', error);
                }
            }, 200);
        }
    }
    
    // Bewerte die aktuelle Karte und gehe zur nächsten
    gradeCard(grade);
}

// Show appropriate form based on card type
function showAddForm(type) {
    const basicForm = byId('basicForm');
    const verbForm = byId('verbForm');
    const articleForm = byId('articleForm');
    
    // Hide all forms first
    if (basicForm) basicForm.style.display = 'none';
    if (verbForm) verbForm.style.display = 'none';
    if (articleForm) articleForm.style.display = 'none';
    
    // Show appropriate form
    if (type === 'article' && articleForm) {
        articleForm.style.display = 'block';
    } else if (type === 'verb' && verbForm) {
        verbForm.style.display = 'block';
    } else if (basicForm) {
        basicForm.style.display = 'block';
    }
}

// Skip functions for different modes
function skipFromType() {
    if (currentId) {
        // Mark card as skipped - it will get a shorter interval and be seen more often
        const card = cardById(currentId);
        if (card) {
            // Add skip marker to track this behavior
            card.skippedCount = (card.skippedCount || 0) + 1;
            card.lastSkipped = now();
            
            // Apply penalty: reset to short interval
            card.intervalIndex = 0;
            card.dueAt = now() + (5 * 60 * 1000); // 5 minutes
            
            save();
            console.log('Card skipped:', card.it || card.de, 'skip count:', card.skippedCount);
        }
    }
    
    // Reset UI and move to next card
    const feedback = byId('typeFeedback');
    if (feedback) feedback.style.display = 'none';
    
    const continueBtn = byId('typeContinueBtn');
    if (continueBtn) continueBtn.style.display = 'none';
    
    const typeInput = byId('typeInput');
    if (typeInput) {
        typeInput.disabled = false;
        typeInput.value = '';
    }
    
    updateLearn();
}

function skipFromConjugation() {
    if (currentId) {
        const card = cardById(currentId);
        if (card) {
            card.skippedCount = (card.skippedCount || 0) + 1;
            card.lastSkipped = now();
            card.intervalIndex = 0;
            card.dueAt = now() + (5 * 60 * 1000);
            save();
            console.log('Verb skipped:', card.it || card.de, 'skip count:', card.skippedCount);
        }
    }
    
    // Reset UI
    const feedback = byId('conjFeedback');
    if (feedback) feedback.style.display = 'none';
    
    const continueBtn = byId('conjContinueBtn');
    if (continueBtn) continueBtn.style.display = 'none';
    
    const conjInput = byId('conjugationInput');
    if (conjInput) {
        conjInput.disabled = false;
        conjInput.value = '';
    }
    
    updateLearn();
}

function skipFromPreposition() {
    if (currentId) {
        const card = cardById(currentId);
        if (card) {
            card.skippedCount = (card.skippedCount || 0) + 1;
            card.lastSkipped = now();
            card.intervalIndex = 0;
            card.dueAt = now() + (5 * 60 * 1000);
            save();
            console.log('Preposition skipped:', card.it || card.de, 'skip count:', card.skippedCount);
        }
    }
    
    updateLearn();
}

function continueFromArticle() {
    if (window.pendingArticleResult) {
        gradeCard(window.pendingArticleResult);
        window.pendingArticleResult = null;
    }
    
    // Reset UI
    const feedback = byId('articleFeedback');
    if (feedback) feedback.style.display = 'none';
    
    const continueBtn = byId('articleContinueBtn');
    if (continueBtn) continueBtn.style.display = 'none';
    
    // Re-enable article buttons for next card
    const articleOptions = byId('articleOptions');
    if (articleOptions) {
        const buttons = articleOptions.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = false);
    }
    
    updateLearn();
}

function skipFromArticle() {
    if (currentId) {
        const card = cardById(currentId);
        if (card) {
            card.skippedCount = (card.skippedCount || 0) + 1;
            card.lastSkipped = now();
            card.intervalIndex = 0;
            card.dueAt = now() + (5 * 60 * 1000);
            save();
            console.log('Article skipped:', card.it || card.de, 'skip count:', card.skippedCount);
        }
    }
    
    updateLearn();
}

function skipFlashcard() {
    if (currentId) {
        const card = cardById(currentId);
        if (card) {
            card.skippedCount = (card.skippedCount || 0) + 1;
            card.lastSkipped = now();
            card.intervalIndex = 0;
            card.dueAt = now() + (5 * 60 * 1000);
            save();
            console.log('Flashcard skipped:', card.it || card.de, 'skip count:', card.skippedCount);
        }
    }
    
    // Simply move to next card
    currentId = null;
    updateLearn();
}

// Expose global functions for HTML onclick handlers
window.selectMode = selectMode;
window.stopLearning = stopLearning;
window.nextFlashcard = nextFlashcard;
window.gradeFlashcard = gradeFlashcard;
window.checkArticle = checkArticle;
window.checkPreposition = checkPreposition;
window.toggleSuspend = toggleSuspend;
window.deleteCard = deleteCard;
window.addCard = addCard;
window.continueFromType = continueFromType;
window.continueFromConjugation = continueFromConjugation;
window.continueFromPreposition = continueFromPreposition;
window.continueFromArticle = continueFromArticle;
window.skipFromType = skipFromType;
window.skipFromConjugation = skipFromConjugation;
window.skipFromPreposition = skipFromPreposition;
window.skipFromArticle = skipFromArticle;
window.skipFlashcard = skipFlashcard;
window.deleteCard = deleteCard;
window.toggleSuspend = toggleSuspend;
window.bulkDelete = bulkDelete;
window.bulkSuspend = bulkSuspend;
window.bulkActivate = bulkActivate;
window.selectAll = selectAll;
window.deselectAll = deselectAll;

// Test function to verify buttons work
window.testButton = function() {
    console.log('Button test successful!');
    alert('Buttons are working!');
};

console.log('Streamlined Italian Learning App loaded! 🇮🇹');
console.log('selectMode function available:', typeof window.selectMode);
