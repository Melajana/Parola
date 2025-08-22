// @ts-nocheck
/* jshint esversion: 11 */
/* global speechSynthesis, SpeechSynthesisUtterance */
// SRS11: Streamlined Learning App - Verbesserte Version
const LS_KEY = 'parola:srs11';
const MIN = 60 * 1000, DAY = 24 * 60 * 60 * 1000;
const INTERVALS = [10 * MIN, 1 * DAY, 3 * DAY, 7 * DAY, 16 * DAY];

// State initialisieren
const state = load() || seed();
state.settings = Object.assign({
    newPerSession: 10,
    maxReviews: 100,
    direction: 'it-de',
    mode: 'flashcards',
    tolerance: 20,
    sortBy: 'default',
    autoSpeak: false,
    speechRate: 0.8,
    speakOnFlip: false, // Audio beim Umdrehen standardmäßig deaktiviert
    repeatAudio: false
}, state.settings || {});

save();

function load() { try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch { return null; } }
function save() { localStorage.setItem(LS_KEY, JSON.stringify(state)); }
function uid() { return Math.random().toString(36).slice(2); }
function now() { return Date.now(); }

function nextSchedule(c, res) {
    let idx = Math.max(0, Math.min(INTERVALS.length - 1, c.intervalIndex ?? 0));
    let st = c.streak ?? 0;
    if (res === 'good') {
        idx = Math.min(INTERVALS.length - 1, idx + 1);
        st++;
    } else {
        idx = 0; st = 0;
    }
    const attempts = (c.attempts || 0) + 1;
    const correct = (c.correct || 0) + (res === 'good' ? 1 : 0);
    return { ...c, intervalIndex: idx, streak: st, dueAt: now() + INTERVALS[idx], attempts, correct };
}

function seed() {
    const t = now();
    const m = (it, de, notes, extra, category, type = 'vocab') => ({
        id: uid(), it, de, notes, type, extra, category, createdAt: t, dueAt: t,
        intervalIndex: 0, streak: 0, suspended: false, attempts: 0, correct: 0
    });
    
    return {
        items: [
            // Greetings
            m('ciao','hallo; tschüss','',null,'greetings','vocab'),
            m('grazie','danke','',null,'greetings','vocab'),
            m('per favore','bitte','',null,'greetings','vocab'),
            m('come stai?','wie geht\'s?','',null,'greetings','vocab'),
            
            // Food
            m('acqua','Wasser','f. - l\'acqua',{article:'l\'',gender:'f'},'food','vocab'),
            m('pane','Brot','m. - il pane',{article:'il',gender:'m'},'food','vocab'),
            m('vino','Wein','m. - il vino',{article:'il',gender:'m'},'food','vocab'),
            m('pizza','Pizza','f. - la pizza',{article:'la',gender:'f'},'food','vocab'),
            m('gelato','Eis','m. - il gelato',{article:'il',gender:'m'},'food','vocab'),
            
            // Family
            m('padre','Vater','m. - il padre',{article:'il',gender:'m'},'family','vocab'),
            m('madre','Mutter','f. - la madre',{article:'la',gender:'f'},'family','vocab'),
            m('figlio','Sohn','m. - il figlio',{article:'il',gender:'m'},'family','vocab'),
            m('figlia','Tochter','f. - la figlia',{article:'la',gender:'f'},'family','vocab'),
            
            // Prepositions
            m('a','zu, nach, in','Ortsangabe, Zeit, Art',{contexts:['Vado ___ scuola','Penso ___ te','Arrivo ___ Milano','Alle tre (alle ore ___)']},'grammar','prep'),
            m('di','von, aus','Besitz/Herkunft',{contexts:['Il libro ___ Maria','Sono ___ Roma','Una camicia ___ cotone']},'grammar','prep'),
            m('da','von, seit, bei','Ausgangspunkt',{contexts:['Vengo ___ casa','Aspetto ___ ieri','Vado ___ medico']},'grammar','prep'),
            m('in','in, nach','Richtung/Ort',{contexts:['Siamo ___ Italia','Vivo ___ città','___ primavera']},'grammar','prep'),
            m('con','mit','Begleitung',{contexts:['Vengo ___ te','Parlo ___ lui','Scrivo ___ la penna']},'grammar','prep'),
            m('per','für, durch','Zweck/Richtung',{contexts:['Questo è ___ te','Parto ___ Roma','___ due settimane']},'grammar','prep'),
            
            // Verbs - Extended
            m('essere','sein','io sono, tu sei, lui/lei è',{
                infinitive:'essere',
                conjugations:{
                    presente:{io:'sono',tu:'sei',lui:'è',lei:'è',noi:'siamo',voi:'siete',loro:'sono'},
                    passato_prossimo:{io:'sono stato/a',tu:'sei stato/a',lui:'è stato',lei:'è stata',noi:'siamo stati/e',voi:'siete stati/e',loro:'sono stati/e'},
                    imperfetto:{io:'ero',tu:'eri',lui:'era',lei:'era',noi:'eravamo',voi:'eravate',loro:'erano'},
                    passato_remoto:{io:'fui',tu:'fosti',lui:'fu',lei:'fu',noi:'fummo',voi:'foste',loro:'furono'},
                    futuro:{io:'sarò',tu:'sarai',lui:'sarà',lei:'sarà',noi:'saremo',voi:'sarete',loro:'saranno'},
                    condizionale:{io:'sarei',tu:'saresti',lui:'sarebbe',lei:'sarebbe',noi:'saremmo',voi:'sareste',loro:'sarebbero'},
                    congiuntivo_presente:{io:'sia',tu:'sia',lui:'sia',lei:'sia',noi:'siamo',voi:'siate',loro:'siano'},
                    congiuntivo_imperfetto:{io:'fossi',tu:'fossi',lui:'fosse',lei:'fosse',noi:'fossimo',voi:'foste',loro:'fossero'},
                    imperativo:{tu:'sii',lui:'sia',lei:'sia',noi:'siamo',voi:'siate',loro:'siano'}
                }
            },'verbs','verb'),
            m('avere','haben','io ho, tu hai, lui/lei ha',{
                infinitive:'avere',
                conjugations:{
                    presente:{io:'ho',tu:'hai',lui:'ha',lei:'ha',noi:'abbiamo',voi:'avete',loro:'hanno'},
                    passato_prossimo:{io:'ho avuto',tu:'hai avuto',lui:'ha avuto',lei:'ha avuto',noi:'abbiamo avuto',voi:'avete avuto',loro:'hanno avuto'},
                    imperfetto:{io:'avevo',tu:'avevi',lui:'aveva',lei:'aveva',noi:'avevamo',voi:'avevate',loro:'avevano'},
                    passato_remoto:{io:'ebbi',tu:'avesti',lui:'ebbe',lei:'ebbe',noi:'avemmo',voi:'aveste',loro:'ebbero'},
                    futuro:{io:'avrò',tu:'avrai',lui:'avrà',lei:'avrà',noi:'avremo',voi:'avrete',loro:'avranno'},
                    condizionale:{io:'avrei',tu:'avresti',lui:'avrebbe',lei:'avrebbe',noi:'avremmo',voi:'avreste',loro:'avrebbero'},
                    congiuntivo_presente:{io:'abbia',tu:'abbia',lui:'abbia',lei:'abbia',noi:'abbiamo',voi:'abbiate',loro:'abbiano'},
                    congiuntivo_imperfetto:{io:'avessi',tu:'avessi',lui:'avesse',lei:'avesse',noi:'avessimo',voi:'aveste',loro:'avessero'},
                    imperativo:{tu:'abbi',lui:'abbia',lei:'abbia',noi:'abbiamo',voi:'abbiate',loro:'abbiano'}
                }
            },'verbs','verb'),
            m('parlare','sprechen','io parlo, tu parli',{
                infinitive:'parlare',
                conjugations:{
                    presente:{io:'parlo',tu:'parli',lui:'parla',lei:'parla',noi:'parliamo',voi:'parlate',loro:'parlano'},
                    passato_prossimo:{io:'ho parlato',tu:'hai parlato',lui:'ha parlato',lei:'ha parlato',noi:'abbiamo parlato',voi:'avete parlato',loro:'hanno parlato'}
                }
            },'verbs','verb'),
            m('fare','machen','io faccio, tu fai',{
                infinitive:'fare',
                conjugations:{
                    presente:{io:'faccio',tu:'fai',lui:'fa',lei:'fa',noi:'facciamo',voi:'fate',loro:'fanno'},
                    passato_prossimo:{io:'ho fatto',tu:'hai fatto',lui:'ha fatto',lei:'ha fatto',noi:'abbiamo fatto',voi:'avete fatto',loro:'hanno fatto'}
                }
            },'verbs','verb'),
            m('andare','gehen','io vado, tu vai',{
                infinitive:'andare',
                conjugations:{
                    presente:{io:'vado',tu:'vai',lui:'va',lei:'va',noi:'andiamo',voi:'andate',loro:'vanno'},
                    passato_prossimo:{io:'sono andato/a',tu:'sei andato/a',lui:'è andato',lei:'è andata',noi:'siamo andati/e',voi:'siete andati/e',loro:'sono andati/e'},
                    imperfetto:{io:'andavo',tu:'andavi',lui:'andava',lei:'andava',noi:'andavamo',voi:'andavate',loro:'andavano'},
                    futuro:{io:'andrò',tu:'andrai',lui:'andrà',lei:'andrà',noi:'andremo',voi:'andrete',loro:'andranno'}
                }
            },'verbs','verb'),
            m('venire','kommen','io vengo, tu vieni',{
                infinitive:'venire',
                conjugations:{
                    presente:{io:'vengo',tu:'vieni',lui:'viene',lei:'viene',noi:'veniamo',voi:'venite',loro:'vengono'},
                    passato_prossimo:{io:'sono venuto/a',tu:'sei venuto/a',lui:'è venuto',lei:'è venuta',noi:'siamo venuti/e',voi:'siete venuti/e',loro:'sono venuti/e'},
                    imperfetto:{io:'venivo',tu:'venivi',lui:'veniva',lei:'veniva',noi:'venivamo',voi:'venivate',loro:'venivano'},
                    futuro:{io:'verrò',tu:'verrai',lui:'verrà',lei:'verrà',noi:'verremo',voi:'verrete',loro:'verranno'}
                }
            },'verbs','verb'),
            m('dare','geben','io do, tu dai',{
                infinitive:'dare',
                conjugations:{
                    presente:{io:'do',tu:'dai',lui:'dà',lei:'dà',noi:'diamo',voi:'date',loro:'danno'},
                    passato_prossimo:{io:'ho dato',tu:'hai dato',lui:'ha dato',lei:'ha dato',noi:'abbiamo dato',voi:'avete dato',loro:'hanno dato'},
                    imperfetto:{io:'davo',tu:'davi',lui:'dava',lei:'dava',noi:'davamo',voi:'davate',loro:'davano'}
                }
            },'verbs','verb'),
            
            // Articles
            m('ragazzo','der Junge','m. - il ragazzo',{article:'il',gender:'m',word:'ragazzo'},'articles','article'),
            m('ragazza','das Mädchen','f. - la ragazza',{article:'la',gender:'f',word:'ragazza'},'articles','article'),
            m('studente','der Student','m. - lo studente',{article:'lo',gender:'m',word:'studente'},'articles','article'),
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

function isClose(a, b) {
    const A = norm(a);
    // Unterstütze mehrere Lösungen, getrennt durch ; oder ,
    const solutions = b.split(/[,;]/).map(s => norm(s.trim())).filter(Boolean);
    if (!A || solutions.length === 0) return false;
    for (const B of solutions) {
        if (A === B) return true;
        const dist = levenshtein(A, B);
        const tol = Math.max(0, Math.round((state.settings.tolerance || 20) / 100 * B.length));
        if (dist <= tol) return true;
    }
    return false;
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

// Mode selection with visual feedback + Progressive Disclosure (Perplexity-Style)
function selectMode(modeName) {
    console.log('selectMode called with:', modeName);
    
    // ERST alles zurücksetzen - das ist wichtig!
    resetAllModes();
    
    // Clear previous active states
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Set active mode - Handle special cases for button IDs
    let targetId;
    if (modeName === 'articles') {
        targetId = 'quickArticles'; // Special case: HTML has 'quickArticles' not 'quickArticle'
    } else {
        targetId = `quick${modeName.charAt(0).toUpperCase() + modeName.slice(1)}`;
    }
    console.log('Looking for button with ID:', targetId);
    
    const modeBtn = byId(targetId);
    if (modeBtn) {
        console.log('Found mode button, activating');
        modeBtn.classList.add('active');
    } else {
        console.log('Mode button not found!');
    }
    
    // 🚀 Progressive Disclosure: Lernrichtung erst nach Modus-Auswahl zeigen
    const learnControls = document.querySelector('.learn-controls');
    if (learnControls) {
        // Smooth fade-in animation
        learnControls.classList.add('active');
        learnControls.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Kurze Verzögerung für smooth UX
        setTimeout(() => {
            learnControls.style.opacity = '1';
            learnControls.style.transform = 'scale(1) translateY(0)';
        }, 150);
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
        state.streak = (state.streak || 0) + 1;
    } else {
        entry.incorrect++;
        if (result === 'again') {
            state.streak = 0;
        }
    }
    
    // Keep only last 30 days
    state.history = state.history
        .filter(h => (now() - new Date(h.date).getTime()) < 30 * 24 * 60 * 60 * 1000)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    save();
    renderStats(); // Statistiken sofort aktualisieren
}

function renderStats() {
    const today = new Date().toISOString().slice(0, 10);
    const todayEntry = state.history?.find(h => h.date === today);
    const todayLearned = todayEntry?.correct || 0; // Heute richtig beantwortete Vokabeln
    
    // Berechne gesamt gelernte Vokabeln (Vokabeln mit mindestens einer richtigen Antwort)
    const totalLearned = state.items.filter(item => (item.correct || 0) > 0).length;
    
    // Aktueller Streak (richtige Antworten in Folge)
    const currentStreak = state.streak || 0;
    
    // Level basierend auf Gesamtzahl richtige Antworten
    const totalCorrect = state.history?.reduce((sum, h) => sum + (h.correct || 0), 0) || 0;
    const level = Math.floor(totalCorrect / 20) + 1;
    
    // Update basic stats
    const statToday = byId('statToday');
    const statTotalLearned = byId('statTotalLearned'); 
    const statStreak = byId('statStreak');
    const statLevel = byId('statLevel');
    const goalProgress = byId('goalProgress');
    
    if (statToday) statToday.textContent = todayLearned; // Heute richtig beantwortet
    if (statTotalLearned) statTotalLearned.textContent = totalLearned; // Vokabeln mit min. 1 richtiger Antwort
    if (statLevel) statLevel.textContent = level; // Level basierend auf Gesamterfolg
    if (goalProgress) goalProgress.textContent = `${todayLearned}/${state.dailyGoal || 20}`;
    
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
    
    // German category names
    const categoryNames = {
        'greetings': 'Begrüßungen',
        'food': 'Essen',
        'family': 'Familie',
        'verbs': 'Verben',
        'grammar': 'Grammatik',
        'articles': 'Artikel',
        'adjectives': 'Adjektive',
        'numbers': 'Zahlen',
        'time': 'Zeit',
        'colors': 'Farben',
        'body': 'Körper',
        'clothing': 'Kleidung',
        'travel': 'Reisen',
        'general': 'Allgemein',
        'other': 'Sonstiges'
    };
    
    categoryStats.innerHTML = Object.entries(categories)
        .map(([cat, stats]) => {
            const rate = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
            const displayName = categoryNames[cat] || cat;
            const color = rate >= 80 ? 'var(--ok)' : rate >= 60 ? 'var(--accent)' : 'var(--bad)';
            return `
                <div style="text-align:center;padding:12px;background:var(--surface);border-radius:8px;border:1px solid var(--border)">
                    <div style="font-size:20px;font-weight:700;color:${color};margin-bottom:4px">${rate}%</div>
                    <div style="font-size:14px;color:var(--text);opacity:0.8;font-weight:500">${displayName}</div>
                    <div style="font-size:11px;color:var(--text);opacity:0.5;margin-top:2px">(${stats.total} Karten)</div>
                </div>
            `;
        }).join('');
}

function checkAchievements() {
    if (!state.achievements) state.achievements = [];
    
    const today = new Date().toISOString().slice(0, 10);
    const todayEntry = state.history?.find(h => h.date === today);
    const todayCount = todayEntry?.total || 0;
    
    // Calculate total learned items (items with at least one correct answer)
    const learnedItems = state.items.filter(item => (item.correct || 0) > 0).length;
    
    // Check for new achievements
    const achievements = [
        { id: 'daily_goal', name: 'Tägliches Ziel', desc: 'Tagesziel erreicht', condition: () => todayCount >= (state.dailyGoal || 20) },
        { id: 'streak_7', name: 'Woche perfekt', desc: '7 Tage Streak', condition: () => (state.streak || 0) >= 7 },
        { id: 'streak_30', name: 'Monat perfekt', desc: '30 Tage Streak', condition: () => (state.streak || 0) >= 30 },
        { id: 'hundred_cards', name: 'Jahrhundert', desc: '100 Karten gelernt', condition: () => learnedItems >= 100 }
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
    
    // Card type buttons
    const cardTypeButtons = document.querySelectorAll('.card-type-btn');
    cardTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active state from all buttons
            cardTypeButtons.forEach(btn => {
                btn.style.borderColor = 'var(--border)';
                btn.style.backgroundColor = 'var(--surface)';
                btn.style.transform = 'none';
            });
            
            // Add active state to clicked button
            button.style.borderColor = 'var(--accent)';
            button.style.backgroundColor = 'color-mix(in srgb, var(--accent) 10%, var(--surface))';
            button.style.transform = 'translateY(-2px)';
            
            // Update the hidden select and show form
            const selectedType = button.dataset.type;
            addTypeSelect.value = selectedType;
            showAddForm(selectedType);
        });
    });
    
    // Initialize first card type button as active
    if (cardTypeButtons.length > 0) {
        cardTypeButtons[0].click();
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
    
    // Filter and sorting event listeners
    const searchInput = byId('searchInput');
    const statusFilter = byId('statusFilter');
    const successFilter = byId('successFilter');
    const sortBy = byId('sortBy');
    
    if (searchInput) {
        searchInput.addEventListener('input', renderList);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', renderList);
    }
    
    if (successFilter) {
        successFilter.addEventListener('change', renderList);
    }
    
    if (sortBy) {
        sortBy.addEventListener('change', renderList);
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
    
    // Type checking buttons - Mehr robuste Event-Handler
    const typeCheckBtn = byId('typeCheckBtn');
    const typeRevealBtn = byId('typeRevealBtn');
    if (typeCheckBtn) {
        // Entferne alle alten Event-Listener
        typeCheckBtn.onclick = null;
        typeCheckBtn.onclick = () => {
            console.log('Prüfen-Button geklickt!');
            const input = byId('typeInput')?.value.trim();
            const correct = dir() === 'it-de' ? cardById(currentId).de : cardById(currentId).it;
            console.log('Input:', input, 'Correct:', correct);
            if (!input || input.length === 0) {
                console.log('Eingabe leer, kein checkType');
                alert('Bitte gib eine Antwort ein!');
                return;
            }
            checkType(input, correct);
        };
        // Zusätzlicher addEventListener als Fallback
        typeCheckBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('addEventListener: Prüfen-Button geklickt!');
        });
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
    
    // Zusätzlicher Event-Handler für "Weiter"-Button im Type-Modus
    const typeContinueBtn = byId('typeContinueBtn');
    if (typeContinueBtn) {
        console.log('Registriere Event-Handler für typeContinueBtn');
        typeContinueBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('typeContinueBtn geklickt via addEventListener');
            continueFromType();
        });
    }
    
    // Enter key support for type input
    const typeInput = byId('typeInput');
    if (typeInput) {
        typeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                if (typeInput.disabled) return;
                const input = typeInput.value.trim();
                const correct = dir() === 'it-de' ? cardById(currentId).de : cardById(currentId).it;
                console.log('ENTER pressed:', input, correct);
                if (input.length === 0) {
                    console.log('Eingabe leer, kein checkType');
                    return;
                }
                checkType(input, correct);
            }
        });
    // Keine automatische Prüfung beim Tippen – Feedback nur bei Enter oder Prüfen
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
                if (conjugationInput.disabled) return;
                const input = conjugationInput.value.trim();
                if (!input) return;
                console.log('Enter pressed - checking conjugation:', input);
                checkConjugation();
            }
        });
        // Sofortige Prüfung beim Tippen
        conjugationInput.addEventListener('input', (e) => {
            if (conjugationInput.disabled) return;
            const input = conjugationInput.value.trim();
            if (!input) return;
            // Nur prüfen, wenn die Länge gleich der Lösung ist
            if (window.currentConjugation) {
                const correct = window.currentConjugation.card.extra.conjugations[window.currentConjugation.tense][window.currentConjugation.pronoun];
                if (input.length === correct.length) {
                    checkConjugation();
                }
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
    
    // Excel Import
    const excelBtn = byId('excelBtn');
    const excelFile = byId('excelFile');
    if (excelBtn && excelFile) {
        excelBtn.addEventListener('click', () => excelFile.click());
        excelFile.addEventListener('change', handleExcelImport);
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
function resetAllModes() {
    console.log('Resetting all modes...');
    
    // Hide ALL possible mode containers and elements
    const allContainers = [
        'flashcardContainer', 'typeContainer', 'typeBox', 'conjugationContainer', 
        'prepositionContainer', 'articleContainer', 'continueSection'
    ];
    
    allContainers.forEach(containerId => {
        const container = byId(containerId);
        if (container) {
            container.style.display = 'none';
            console.log(`Hidden container: ${containerId}`);
        }
    });
    
    // Reset all feedback elements
    const feedbackElements = [
        'typeFeedback', 'prepositionFeedback', 'articleFeedback', 'conjugationFeedback'
    ];
    
    feedbackElements.forEach(feedbackId => {
        const feedback = byId(feedbackId);
        if (feedback) feedback.style.display = 'none';
    });
    
    // Reset all continue buttons
    const continueButtons = [
        'typeContinueBtn', 'prepContinueBtn', 'articleContinueBtn', 'conjContinueBtn', 'mainContinueBtn'
    ];
    
    continueButtons.forEach(btnId => {
        const btn = byId(btnId);
        if (btn) btn.style.display = 'none';
    });
    
    // Reset Type mode elements specifically
    const typeInput = byId('typeInput');
    const typeCheckBtn = byId('typeCheckBtn');
    const typeRevealBtn = byId('typeRevealBtn');
    const typeSkipBtn = byId('typeSkipBtn');
    
    if (typeInput) {
        typeInput.disabled = false;
        typeInput.value = '';
    }
    if (typeCheckBtn) typeCheckBtn.style.display = 'inline-flex';
    if (typeRevealBtn) typeRevealBtn.style.display = 'inline-flex';
    if (typeSkipBtn) typeSkipBtn.style.display = 'inline-flex';
    
    // Show speaker button when in normal learning mode
    const speakBtn = byId('speakBtn');
    if (speakBtn) speakBtn.style.display = 'block';
    
    // Reset flashcard mode elements
    const nextCardBtn = byId('nextCardBtn');
    if (nextCardBtn) {
        nextCardBtn.style.display = 'block';
        nextCardBtn.textContent = 'Weiter'; // Reset text
    }
    
    console.log('All modes completely reset.');
}

function updateLearn(){
    console.log('updateLearn called, currentId:', currentId);
    
    // Reset all modes first to clean up previous state
    resetAllModes();
    
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
            console.log('All cards learned - showing completion screen for mode:', mode());
            
            // Sicherstellen, dass der Haupt-Wort-Container sichtbar ist
            const learnWordElement = byId('learnWord');
            if (learnWordElement) {
                learnWordElement.style.display = 'block';
                learnWordElement.style.visibility = 'visible';
                learnWordElement.textContent = 'Gut gemacht! 🎉'; // Das große "Gut gemacht!" im Wort-Container
                console.log('Set learnWord to: Gut gemacht! 🎉');
            }
            
            const learnMetaElement = byId('learnMeta');
            if (learnMetaElement) {
                learnMetaElement.textContent = 'Alle Karten für heute gelernt! Drücke "Weiter" zum Üben';
                learnMetaElement.style.display = 'block';
                console.log('Set learnMeta text');
            }
            
            // Verstecke ALLE möglichen Container - garantiert saubere Ansicht
            const allContainers = [
                'typeContainer', 'typeBox', 'articleContainer', 'prepositionContainer', 
                'conjugationContainer', 'conjugationBox', 'flashcardContainer', 'conjContainer',
                'prepContainer', 'verbContainer', 'prepositionBox', 'articleBox'
            ];
            
            allContainers.forEach(containerId => {
                const container = byId(containerId);
                if (container) {
                    container.style.display = 'none';
                    console.log(`Hiding container: ${containerId}`);
                }
            });
            
            // Verstecke auch alle Feedback-Elemente
            const allFeedback = [
                'typeFeedback', 'prepositionFeedback', 'articleFeedback', 'conjugationFeedback'
            ];
            allFeedback.forEach(feedbackId => {
                const feedback = byId(feedbackId);
                if (feedback) feedback.style.display = 'none';
            });
            
            // Zeige IMMER die Haupt-Continue-Section
            const continueSection = byId('continueSection');
            const mainContinueBtn = byId('mainContinueBtn');
            if (continueSection) {
                continueSection.style.display = 'block';
                console.log('Showing main continue section');
            }
            if (mainContinueBtn) {
                mainContinueBtn.style.display = 'inline-flex';
                mainContinueBtn.textContent = 'Weiter üben';
                console.log('Showing main continue button');
            }
            
            // Speaker-Button ausblenden (da kein aktuelles Wort)
            const speakBtn = byId('speakBtn');
            if (speakBtn) speakBtn.style.display = 'none';
            
        } else {
            const learnWordElement = byId('learnWord');
            const learnMetaElement = byId('learnMeta');
            if (learnWordElement) learnWordElement.textContent = 'Alle Karten gelernt!';
            if (learnMetaElement) learnMetaElement.textContent = 'Füge neue Inhalte hinzu';
            
            // Hide continue section when no more cards available
            const continueSection = byId('continueSection');
            if (continueSection) continueSection.style.display = 'none';
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
    console.log('Current mode:', currentMode, 'Card type:', card.type);
    
    if (currentMode === 'flashcards') {
        setupFlashcardMode(card);
    } else if (currentMode === 'type') {
        setupTypeMode(card);
    } else if (currentMode === 'conjugation') {
        console.log('Setting up conjugation mode');
        setupConjugationMode(card);
    } else if (currentMode === 'preposition') {
        console.log('Setting up preposition mode');
        setupPrepositionMode(card);
    } else if (currentMode === 'articles') {
        console.log('Setting up article mode');
        setupArticleMode(card);
    } else {
        console.log('Fallback to flashcards, mode:', currentMode);
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
    const flashcardContent = document.getElementById('flashcard-content');
    
    // Einfach die Frage anzeigen
    flashcardWord.textContent = q;
    flashcardWord.style.color = 'var(--text)'; // Normale Farbe für Frage
    
    // Status verfolgen
    let isShowingAnswer = false;
    
    // Reset card to normal blue color
    if (flashcardContent) {
        flashcardContent.classList.remove('showing-answer');
    }
    
    // Buttons initial zurücksetzen
    const flashcardButtons = document.getElementById('flashcardButtons');
    const nextCardBtn = document.getElementById('nextCardBtn');
    if (flashcardButtons) flashcardButtons.style.display = 'none';
    if (nextCardBtn) nextCardBtn.style.display = 'block';
    
    // Show actions
    if (flashcardActions) flashcardActions.style.display = 'block';
    
    // Hide the word area since we're using flashcards
    learnWord.textContent = '';
    learnWord.style.display = 'none'; // Hide learnWord for flashcard mode
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
        const flashcardContent = document.getElementById('flashcard-content');
        
        if (!isShowingAnswer) {
            flashcardWord.textContent = a;
            flashcardWord.style.color = 'var(--ok)'; // Grün für Antwort
            isShowingAnswer = true;
            
            // Add CSS class for yellow background
            if (flashcardContent) {
                flashcardContent.classList.add('showing-answer');
            }
            
            // Audio beim Umdrehen abspielen (speakOnFlip)
            if (state.settings.speakOnFlip) {
                setTimeout(async () => {
                    try {
                        const isItalian = dir() === 'it-de';
                        if (isItalian) {
                            await audioManager.speakGerman(a);
                        } else {
                            await audioManager.speakItalian(a);
                        }
                    } catch (error) {
                        console.log('Speak on flip failed:', error);
                    }
                }, 200);
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
            
            // Remove CSS class for normal blue background
            if (flashcardContent) {
                flashcardContent.classList.remove('showing-answer');
            }
            
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
    learnWord.style.display = 'block'; // Make sure learnWord is visible for typing mode
    learnMeta.textContent = '⌨️ Tippen - Übersetze das Wort';
    
    const typeInput = byId('typeInput');
    if (typeInput) {
        typeInput.value = '';
        typeInput.focus();
        // Kein eigenes onkeydown, damit globales keypress-Event greift
    }
    
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
}

function setupConjugationMode(card) {
    if (!card.extra?.conjugations) return updateLearn();
    
    hideAllModeBoxes();
    const conjBox = byId('conjugationBox');
    if (conjBox) conjBox.style.display = 'block';
    
    // Get selected tense from dropdown, default to presente
    const tenseSelect = byId('tenseSelect');
    const selectedTense = tenseSelect ? tenseSelect.value : 'presente';
    
    // Check if the selected tense exists for this verb
    const availableTenses = Object.keys(card.extra.conjugations);
    const tense = availableTenses.includes(selectedTense) ? selectedTense : 'presente';
    
    // Select appropriate pronouns based on tense
    let pronouns;
    if (tense === 'imperativo') {
        // Imperativ hat andere Pronomen (kein "io")
        pronouns = ['tu', 'lui', 'lei', 'noi', 'voi', 'loro'];
    } else {
        pronouns = ['io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro'];
    }
    
    // Get available pronouns for this tense and verb
    const availablePronouns = Object.keys(card.extra.conjugations[tense] || {});
    const validPronouns = pronouns.filter(p => availablePronouns.includes(p));
    
    const pronoun = validPronouns.length > 0 ? 
        validPronouns[Math.floor(Math.random() * validPronouns.length)] : 
        pronouns[Math.floor(Math.random() * pronouns.length)];
    
    currentConjugation = { pronoun, card, tense };
    
    learnWord.textContent = card.extra.infinitive || card.it;
    learnWord.style.display = 'block'; // Make sure learnWord is visible for conjugation mode
    
    // Update meta text - just show "Verb-Konjugation"
    learnMeta.textContent = 'Verb-Konjugation';
    
    const pronounEl = byId('conjugationPronoun');
    if (pronounEl) pronounEl.textContent = pronoun;
    
    const conjInput = byId('conjugationInput');
    if (conjInput) {
        conjInput.value = '';
        conjInput.focus();
        // Kein eigenes onkeydown, damit globale Events greifen
    }
    
    // Update tense selector to show available tenses for this verb
    updateTenseSelector(card);
}

function updateTenseSelector(card) {
    const tenseSelect = byId('tenseSelect');
    if (!tenseSelect || !card.extra?.conjugations) return;
    
    const availableTenses = Object.keys(card.extra.conjugations);
    const currentSelection = tenseSelect.value;
    
    // Clear and rebuild options
    tenseSelect.innerHTML = '';
    
    const tenseOptions = [
        { value: 'presente', label: 'Präsens (presente)' },
        { value: 'passato_prossimo', label: 'Perfekt (passato prossimo)' },
        { value: 'imperfetto', label: 'Imperfekt (imperfetto)' },
        { value: 'passato_remoto', label: 'Historisches Perfekt (passato remoto)' },
        { value: 'futuro', label: 'Futur (futuro semplice)' },
        { value: 'futuro_anteriore', label: 'Futur II (futuro anteriore)' },
        { value: 'condizionale', label: 'Konditional (condizionale presente)' },
        { value: 'condizionale_passato', label: 'Konditional Perfekt (condizionale passato)' },
        { value: 'congiuntivo_presente', label: 'Konjunktiv Präsens (congiuntivo presente)' },
        { value: 'congiuntivo_imperfetto', label: 'Konjunktiv Imperfekt (congiuntivo imperfetto)' },
        { value: 'imperativo', label: 'Imperativ (imperativo)' }
    ];
    
    tenseOptions.forEach(option => {
        if (availableTenses.includes(option.value)) {
            const optionEl = document.createElement('option');
            optionEl.value = option.value;
            optionEl.textContent = option.label;
            if (option.value === currentSelection) {
                optionEl.selected = true;
            }
            tenseSelect.appendChild(optionEl);
        }
    });
    
    // Add event listener for tense changes
    tenseSelect.onchange = () => {
        // Restart conjugation with new tense
        setupConjugationMode(currentConjugation.card);
    };
}

function checkConjugation() {
    if (!currentConjugation) return;
    
    const input = byId('conjugationInput')?.value.trim();
    const correct = currentConjugation.card.extra.conjugations[currentConjugation.tense][currentConjugation.pronoun];
    const isCorrect = isClose(input, correct);
    
    const feedback = byId('conjFeedback');
    if (feedback) {
        feedback.style.display = '';
        feedback.textContent = '';
        // Force reflow to ensure style update
        void feedback.offsetWidth;
        feedback.textContent = isCorrect ? '✓ Richtig!' : `❌ Falsch! Richtig ist: ${correct}`;
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
    console.log('setupPrepositionMode called with card:', card);
    hideAllModeBoxes();
    const prepBox = byId('prepositionBox');
    if (prepBox) prepBox.style.display = 'block';
    
    // Hide continue button initially
    const continueBtn = byId('prepContinueBtn');
    if (continueBtn) continueBtn.style.display = 'none';
    
    // Verstecke das learnWord Element (brauchen wir nicht in diesem Modus)
    learnWord.style.display = 'none';
    
    const contexts = card.extra?.contexts || [];
    console.log('Contexts found:', contexts);
    if (!contexts.length) {
        // Create a default context using the Italian word
        const italienischWort = card.it || '';
        if (italienischWort) {
            contexts.push(`Io vado ___ ${italienischWort.toLowerCase()}`);
        } else {
            contexts.push(`Vado ___ scuola`); // Default fallback
        }
        console.log('Generated fallback contexts:', contexts);
    }
    
    const context = contexts[Math.floor(Math.random() * contexts.length)];
    
    // Use the Italian word as the correct preposition if it looks like one
    let correctPrep = card.it;
    const commonPreps = ['a', 'di', 'da', 'in', 'con', 'per', 'su', 'tra', 'fra'];
    if (!commonPreps.includes(correctPrep)) {
        correctPrep = 'a'; // Default fallback preposition
    }
    
    console.log('Selected context:', context, 'Correct prep:', correctPrep);
    
    // Generate distractors (other prepositions)
    const allPreps = ['a', 'di', 'da', 'in', 'con', 'per', 'su', 'tra', 'fra'];
    const distractors = shuffle(allPreps.filter(p => p !== correctPrep)).slice(0, 3);
    const options = shuffle([correctPrep, ...distractors]);
    console.log('Generated options:', options);
    
    currentPrepContext = { context, correct: correctPrep };
    
    learnMeta.textContent = '🔗 Präposition - Welche passt in die Lücke?';
    
    // Create multiple choice options
    const choices = byId('prepositionChoices');
    console.log('Choices element found:', choices);
    if (choices) {
        const optionsHtml = options.map(prep => 
            `<button style="
                display: inline-block;
                padding: 14px 24px;
                margin: 8px;
                border: 2px solid #e91e63;
                border-radius: 12px;
                background: var(--surface);
                color: #c2185b;
                cursor: pointer;
                font-family: Montserrat, sans-serif;
                font-size: 16px;
                font-weight: 500;
                min-width: 80px;
                box-shadow: 0 2px 8px rgba(233, 30, 99, 0.2);
                transition: all 0.2s ease;
            " 
            onmouseover="this.style.backgroundColor='#fce4ec'; this.style.transform='translateY(-2px)'"
            onmouseout="this.style.backgroundColor='var(--surface)'; this.style.transform='translateY(0px)'"
            onclick="checkPreposition('${prep}', '${correctPrep}')">${prep}</button>`
        ).join('');
        
        const fullHtml = `
            <div class="mc-question" style="
                font-size: 32px;
                font-weight: 600;
                text-align: center;
                margin: 16px auto 24px auto;
                padding: 16px 20px;
                background: var(--surface);
                border: 2px solid var(--border);
                border-radius: 12px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, .08);
                max-width: 400px;
            ">${context}</div>
            <div style="
                display: flex;
                gap: 12px;
                justify-content: center;
                flex-wrap: wrap;
                margin: 20px 0;
            ">
                ${optionsHtml}
            </div>
        `;
        
        console.log('Setting HTML:', fullHtml);
        choices.innerHTML = fullHtml;
        
        // Force display of buttons
        const buttons = choices.querySelectorAll('button');
        console.log('Buttons created:', buttons.length);
        buttons.forEach((btn, i) => {
            console.log(`Button ${i}:`, btn, 'Display:', getComputedStyle(btn).display);
        });
    }
}

function setupArticleMode(card) {
    console.log('setupArticleMode called with card:', card);
    hideAllModeBoxes();
    const articleBox = byId('articleBox');
    if (articleBox) articleBox.style.display = 'block';
    
    // Hide continue button initially
    const continueBtn = byId('articleContinueBtn');
    if (continueBtn) continueBtn.style.display = 'none';
    
    // Verstecke das learnWord Element (brauchen wir nicht in diesem Modus)
    learnWord.style.display = 'none';
    
    if (!card.extra?.article || !card.extra?.word) {
        console.log('No article data found, generating fallback');
        // Generate fallback data
        const word = card.it || 'ragazzo'; // Use Italian word or fallback
        const articles = ['il', 'la', 'lo', 'gli', 'le'];
        const correctArticle = articles[Math.floor(Math.random() * articles.length)];
        
        // Create temporary extra data
        card.extra = card.extra || {};
        card.extra.word = word;
        card.extra.article = correctArticle;
        console.log('Generated fallback article data:', { word, correctArticle });
    }
    
    // Generate article options
    const allArticles = ['il', 'la', 'lo', 'gli', 'le'];
    const correctArticle = card.extra.article;
    const distractors = shuffle(allArticles.filter(a => a !== correctArticle)).slice(0, 3);
    const options = shuffle([correctArticle, ...distractors]);
    console.log('Generated article options:', options);
    
    currentArticle = { correct: correctArticle, word: card.extra.word };
    
    learnMeta.textContent = '🎯 Artikel - Welcher Artikel gehört zu diesem Wort?';
    
    // Create multiple choice options
    const choices = byId('articleChoices');
    console.log('Article choices element found:', choices);
    if (choices) {
        const optionsHtml = options.map(article => 
            `<button style="
                display: inline-block;
                padding: 14px 24px;
                margin: 8px;
                border: 2px solid #9c27b0;
                border-radius: 12px;
                background: var(--surface);
                color: #8e24aa;
                cursor: pointer;
                font-family: Montserrat, sans-serif;
                font-size: 16px;
                font-weight: 500;
                min-width: 80px;
                box-shadow: 0 2px 8px rgba(156, 39, 176, 0.2);
                transition: all 0.2s ease;
            " 
            onmouseover="this.style.backgroundColor='#f3e5f5'; this.style.transform='translateY(-2px)'"
            onmouseout="this.style.backgroundColor='var(--surface)'; this.style.transform='translateY(0px)'"
            onclick="checkArticle('${article}', '${correctArticle}')">${article}</button>`
        ).join('');
        
        const fullHtml = `
            <div style="
                font-size: 32px;
                font-weight: 600;
                text-align: center;
                margin: 16px auto 24px auto;
                padding: 16px 20px;
                background: var(--surface);
                border: 2px solid var(--border);
                border-radius: 12px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, .08);
                max-width: 400px;
            ">${card.extra.word}</div>
            <div style="
                display: flex;
                gap: 12px;
                justify-content: center;
                flex-wrap: wrap;
                margin: 20px 0;
            ">
                ${optionsHtml}
            </div>
        `;
        
        console.log('Setting article HTML:', fullHtml);
        choices.innerHTML = fullHtml;
        
        // Force display of buttons
        const buttons = choices.querySelectorAll('button');
        console.log('Article buttons created:', buttons.length);
        buttons.forEach((btn, i) => {
            console.log(`Article button ${i}:`, btn, 'Display:', getComputedStyle(btn).display);
        });
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
    
    // Hide context fields when switching modes
    const prepositionContext = byId('prepositionContext');
    if (prepositionContext) prepositionContext.style.display = 'none';
    
    const articleWord = byId('articleWord');
    if (articleWord) articleWord.style.display = 'none';
    
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
    
    console.log('checkArticle called:', selected, 'vs', correct, 'isCorrect:', isCorrect);
    
    // Disable all buttons and mark correct/wrong with consistent colors
    const articleButtons = document.querySelectorAll('#articleChoices button');
    articleButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
        btn.style.pointerEvents = 'none'; // Disable all hover effects
        
        if (btn.textContent === correct) {
            // Correct answer - white background with green border
            btn.style.backgroundColor = 'white';
            btn.style.borderColor = '#4caf50';
            btn.style.color = '#4caf50';
            btn.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.4)';
        } else if (btn.textContent === selected && !isCorrect) {
            // Wrong selection - white background with red border and red text
            btn.style.backgroundColor = 'white';
            btn.style.borderColor = '#f44336';
            btn.style.color = '#f44336';
            btn.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.4)';
        } else {
            // Other options - dim them
            btn.style.opacity = '0.4';
            btn.style.transform = 'scale(0.95)';
        }
    });
    
    // Show feedback text
    const choices = document.getElementById('articleChoices');
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'type-feedback';
    
    if (isCorrect) {
        feedbackDiv.innerHTML = '✅ Richtig!';
        feedbackDiv.classList.add('ok');
    } else {
        feedbackDiv.innerHTML = `❌ Falsch! Richtig ist: <strong>${correct}</strong>`;
        feedbackDiv.classList.add('bad');
    }
    
    choices.appendChild(feedbackDiv);
    
    // Show the "Weiter" button and hide "Überspringen"
    const continueBtn = document.getElementById('articleContinueBtn');
    const skipBtn = document.getElementById('articleSkipBtn');
    if (continueBtn) {
        continueBtn.style.display = 'inline-flex';
    }
    if (skipBtn) {
        skipBtn.style.display = 'none';
    }
}

function showArticleFeedback(isCorrect, selected, correct) {
    const feedbackContainer = byId('articleFeedback');
    const feedbackText = feedbackContainer.querySelector('.feedback-text');
    const continueBtn = feedbackContainer.querySelector('.feedback-continue');
    
    if (isCorrect) {
        feedbackText.className = 'feedback-text correct';
        feedbackContainer.className = 'feedback-container correct';
        feedbackText.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 12px;">🎯</div>
            <div>Perfekt!</div>
            <div style="font-size: 16px; font-weight: 400; margin-top: 8px; opacity: 0.8;">
                "${correct}" ist der richtige Artikel
            </div>
        `;
        feedbackContainer.style.borderColor = 'var(--ok)';
        feedbackContainer.style.background = 'color-mix(in srgb, var(--ok) 8%, var(--surface))';
    } else {
        feedbackText.className = 'feedback-text incorrect';
        feedbackContainer.className = 'feedback-container';
        feedbackText.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 12px;">📝</div>
            <div>Noch einmal!</div>
            <div style="font-size: 16px; font-weight: 400; margin-top: 8px; opacity: 0.8;">
                Du hast "${selected}" gewählt, richtig ist "${correct}"
            </div>
        `;
        feedbackContainer.style.borderColor = 'var(--bad)';
        feedbackContainer.style.background = 'color-mix(in srgb, var(--bad) 8%, var(--surface))';
    }
    
    feedbackContainer.style.display = 'block';
    
    // Continue button functionality
    continueBtn.onclick = () => {
        gradeCard(isCorrect ? 'good' : 'again');
    };
}

function checkPreposition(selected, correct) {
    const isCorrect = selected === correct;
    lastCorrect = isCorrect;
    
    console.log('checkPreposition called:', selected, 'vs', correct, 'isCorrect:', isCorrect);
    
    // Disable all buttons and mark correct/wrong with consistent colors
    const prepButtons = document.querySelectorAll('#prepositionChoices button');
    prepButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
        btn.style.pointerEvents = 'none'; // Disable all hover effects
        
        if (btn.textContent === correct) {
            // Correct answer - white background with green border
            btn.style.backgroundColor = 'white';
            btn.style.borderColor = '#4caf50';
            btn.style.color = '#4caf50';
            btn.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.4)';
        } else if (btn.textContent === selected && !isCorrect) {
            // Wrong selection - white background with red border and red text
            btn.style.backgroundColor = 'white';
            btn.style.borderColor = '#f44336';
            btn.style.color = '#f44336';
            btn.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.4)';
        } else {
            // Other options - dim them
            btn.style.opacity = '0.4';
            btn.style.transform = 'scale(0.95)';
        }
    });
    
    // Show feedback text
    const choices = document.getElementById('prepositionChoices');
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'type-feedback';
    
    if (isCorrect) {
        feedbackDiv.innerHTML = '✅ Richtig!';
        feedbackDiv.classList.add('ok');
    } else {
        feedbackDiv.innerHTML = `❌ Falsch! Richtig ist: <strong>${correct}</strong>`;
        feedbackDiv.classList.add('bad');
    }
    
    choices.appendChild(feedbackDiv);
    
    // Show the "Weiter" button and hide "Überspringen"
    const continueBtn = document.getElementById('prepContinueBtn');
    const skipBtn = document.getElementById('prepSkipBtn');
    if (continueBtn) {
        continueBtn.style.display = 'inline-flex';
    }
    if (skipBtn) {
        skipBtn.style.display = 'none';
    }
}

function showPrepositionFeedback(isCorrect, selected, correct) {
    const feedbackContainer = byId('prepositionFeedback');
    const feedbackText = feedbackContainer.querySelector('.feedback-text');
    const continueBtn = feedbackContainer.querySelector('.feedback-continue');
    
    if (isCorrect) {
        feedbackText.className = 'feedback-text correct';
        feedbackContainer.className = 'feedback-container correct';
        feedbackText.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 12px;">🎉</div>
            <div>Richtig!</div>
            <div style="font-size: 16px; font-weight: 400; margin-top: 8px; opacity: 0.8;">
                "${correct}" ist korrekt
            </div>
        `;
        feedbackContainer.style.borderColor = 'var(--ok)';
        feedbackContainer.style.background = 'color-mix(in srgb, var(--ok) 8%, var(--surface))';
    } else {
        feedbackText.className = 'feedback-text incorrect';
        feedbackContainer.className = 'feedback-container';
        feedbackText.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 12px;">🤔</div>
            <div>Nicht ganz!</div>
            <div style="font-size: 16px; font-weight: 400; margin-top: 8px; opacity: 0.8;">
                Du hast "${selected}" gewählt, richtig ist "${correct}"
            </div>
        `;
        feedbackContainer.style.borderColor = 'var(--bad)';
        feedbackContainer.style.background = 'color-mix(in srgb, var(--bad) 8%, var(--surface))';
    }
    
    feedbackContainer.style.display = 'block';
    
    // Continue button functionality
    continueBtn.onclick = () => {
        gradeCard(isCorrect ? 'good' : 'again');
    };
}

function continueFromPreposition() {
    // Use the same logic as verb conjugation - grade the card based on lastCorrect
    gradeCard(lastCorrect ? 'good' : 'again');
}

function checkType(input, correct) {
    const isCorrect = isClose(input, correct);
    lastCorrect = isCorrect;
    console.log('checkType aufgerufen:', input, correct, 'isCorrect:', isCorrect);
    const feedback = byId('typeFeedback');
    if (feedback) {
        feedback.style.display = '';
        feedback.textContent = '';
        // Force reflow to ensure style update
        void feedback.offsetWidth;
        feedback.textContent = isCorrect ? '✓ Richtig!' : `❌ Falsch! Richtig ist: ${correct}`;
        feedback.className = `type-feedback ${isCorrect ? 'ok' : 'bad'}`;
        feedback.style.display = 'block';
    }
    
    // Verstecke die unteren Buttons (Auflösung zeigen, Prüfen, Überspringen)
    const typeCheckBtn = byId('typeCheckBtn');
    const typeRevealBtn = byId('typeRevealBtn');
    const typeSkipBtn = byId('typeSkipBtn');
    
    if (typeCheckBtn) typeCheckBtn.style.display = 'none';
    if (typeRevealBtn) typeRevealBtn.style.display = 'none';
    if (typeSkipBtn) typeSkipBtn.style.display = 'none';
    
    // Show continue button instead of auto-advancing
    const continueBtn = byId('typeContinueBtn');
    if (continueBtn) {
        continueBtn.style.display = 'inline-flex';
        continueBtn.style.visibility = 'visible';
        continueBtn.textContent = isCorrect ? 'Weiter' : 'Verstanden, weiter';
        continueBtn.focus();
        console.log('Continue button should be visible now:', continueBtn);
    } else {
        console.error('typeContinueBtn not found!');
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
    console.log('continueFromType aufgerufen!');
    // Process the stored result
    if (window.pendingTypeResult) {
        console.log('Processing result:', window.pendingTypeResult);
        gradeCard(window.pendingTypeResult);
        window.pendingTypeResult = null;
    }
    
    // Reset UI elements
    const feedback = byId('typeFeedback');
    if (feedback) feedback.style.display = 'none';
    
    const continueBtn = byId('typeContinueBtn');
    if (continueBtn) continueBtn.style.display = 'none';
    
    // Zeige die unteren Buttons wieder an
    const typeCheckBtn = byId('typeCheckBtn');
    const typeRevealBtn = byId('typeRevealBtn');
    const typeSkipBtn = byId('typeSkipBtn');
    
    if (typeCheckBtn) typeCheckBtn.style.display = 'inline-flex';
    if (typeRevealBtn) typeRevealBtn.style.display = 'inline-flex';
    if (typeSkipBtn) typeSkipBtn.style.display = 'inline-flex';
    
    const typeInput = byId('typeInput');
    if (typeInput) {
        typeInput.disabled = false;
        typeInput.value = '';
    }
    
    console.log('continueFromType beendet, nextCard wird aufgerufen...');
    // Go to next card
    nextCard();
}

// Grading system
function gradeCard(result) {
    if (!currentId) return;
    
    const card = cardById(currentId);
    if (!card) return;
    
    lastCorrect = isCorrect;
    
    const feedback = byId('prepFeedback');
    if (feedback) {
        feedback.textContent = isCorrect ? '✓ Richtig!' : `❌ Falsch! Richtig ist: ${currentPrepContext.correct}`;
        feedback.className = `type-feedback ${isCorrect ? 'ok' : 'bad'}`;
        feedback.style.display = 'block';
    }
    
    // Show continue button and disable input
    const continueBtn = byId('prepContinueBtn');
    if (continueBtn) {
        continueBtn.style.display = 'block';
        continueBtn.textContent = isCorrect ? 'Weiter' : 'Verstanden, weiter';
        continueBtn.focus();
    }
    
    // Disable input field
    prepInput.disabled = true;
    
    // Store result
    window.pendingPrepResult = isCorrect ? 'good' : 'again';
}

function revealPrepositionAnswer() {
    if (!currentPrepContext) return;
    
    const prepInput = byId('prepositionInput');
    if (prepInput) {
        prepInput.value = currentPrepContext.correct;
        prepInput.disabled = true;
    }
    
    const feedback = byId('prepFeedback');
    if (feedback) {
        feedback.textContent = `Die richtige Antwort ist: ${currentPrepContext.correct}`;
        feedback.className = 'type-feedback bad';
        feedback.style.display = 'block';
    }
    
    const continueBtn = byId('prepContinueBtn');
    if (continueBtn) {
        continueBtn.style.display = 'block';
        continueBtn.textContent = 'Verstanden, weiter';
        continueBtn.focus();
    }
    
    window.pendingPrepResult = 'again';
}

// New input-based functions for articles
function checkArticleInput() {
    const articleInput = byId('articleInput');
    if (!articleInput || !currentArticle) return;
    
    const userAnswer = articleInput.value.trim().toLowerCase();
    const correctAnswer = currentArticle.correct.toLowerCase();
    const isCorrect = userAnswer === correctAnswer;
    
    lastCorrect = isCorrect;
    
    const feedback = byId('articleFeedback');
    if (feedback) {
        feedback.textContent = isCorrect ? '✓ Richtig!' : `❌ Falsch! Richtig ist: ${currentArticle.correct}`;
        feedback.className = `type-feedback ${isCorrect ? 'ok' : 'bad'}`;
        feedback.style.display = 'block';
    }
    
    // Show continue button and disable input
    const continueBtn = byId('articleContinueBtn');
    if (continueBtn) {
        continueBtn.style.display = 'block';
        continueBtn.textContent = isCorrect ? 'Weiter' : 'Verstanden, weiter';
        continueBtn.focus();
    }
    
    // Disable input field
    articleInput.disabled = true;
    
    // Store result
    window.pendingArticleResult = isCorrect ? 'good' : 'again';
}

function revealArticleAnswer() {
    if (!currentArticle) return;
    
    const articleInput = byId('articleInput');
    if (articleInput) {
        articleInput.value = currentArticle.correct;
        articleInput.disabled = true;
    }
    
    const feedback = byId('articleFeedback');
    if (feedback) {
        feedback.textContent = `Der richtige Artikel ist: ${currentArticle.correct}`;
        feedback.className = 'type-feedback bad';
        feedback.style.display = 'block';
    }
    
    const continueBtn = byId('articleContinueBtn');
    if (continueBtn) {
        continueBtn.style.display = 'block';
        continueBtn.textContent = 'Verstanden, weiter';
        continueBtn.focus();
    }
    
    window.pendingArticleResult = 'again';
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
    const mobileCards = byId('mobileCards');
    if (!tbody && !mobileCards) return;
    
    // Apply filters and sorting
    let filteredItems = applyFilters(state.items);
    filteredItems = applySorting(filteredItems);
    
    // Render desktop table
    if (tbody) {
        tbody.innerHTML = '';
        
        filteredItems.forEach(item => {
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
    }
    
    // Render mobile cards
    if (mobileCards) {
        mobileCards.innerHTML = '';
        
        filteredItems.forEach(item => {
            const successRate = item.attempts > 0 ? Math.round((item.correct / item.attempts) * 100) : 0;
            const dueText = item.dueAt && item.dueAt > now() ? 
                Math.ceil((item.dueAt - now()) / (1000 * 60 * 60 * 24)) + ' Tage' : 
                'Fällig';
            
            const card = document.createElement('div');
            card.className = 'vocab-card';
            
            card.innerHTML = `
                <div class="vocab-card-header">
                    <input type="checkbox" class="vocab-checkbox row-checkbox" data-id="${item.id}">
                    <div class="vocab-words">
                        <div class="vocab-italian">${item.it}</div>
                        <div class="vocab-german">${item.de}</div>
                    </div>
                </div>
                <div class="vocab-stats">
                    <div class="vocab-stat">
                        <span>⏰</span>
                        <span>${dueText}</span>
                    </div>
                    <div class="vocab-stat">
                        <span>🔥</span>
                        <span>${item.streak || 0}</span>
                    </div>
                    <div class="vocab-stat">
                        <span>📊</span>
                        <span>${successRate}%</span>
                    </div>
                    <div class="vocab-stat">
                        <span>${item.suspended ? '⏸️' : '▶️'}</span>
                        <span>${item.suspended ? 'Pausiert' : 'Aktiv'}</span>
                    </div>
                </div>
                <div class="vocab-actions">
                    <button class="btn ghost suspend-btn" data-id="${item.id}">
                        ${item.suspended ? '▶️ Aktivieren' : '⏸️ Pausieren'}
                    </button>
                    <button class="btn ghost delete-btn" data-id="${item.id}" style="color: var(--bad);">🗑️ Löschen</button>
                </div>
            `;
            
            // Add event listeners
            const suspendBtn = card.querySelector('.suspend-btn');
            const deleteBtn = card.querySelector('.delete-btn');
            const checkbox = card.querySelector('.row-checkbox');
            
            if (suspendBtn) {
                suspendBtn.addEventListener('click', () => toggleSuspend(item.id));
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => deleteCard(item.id));
            }
            
            if (checkbox) {
                checkbox.addEventListener('change', updateBulkToolbar);
            }
            
            mobileCards.appendChild(card);
        });
    }
    
    // Update counter
    const countTxt = byId('countTxt');
    if (countTxt) countTxt.textContent = filteredItems.length;
    
    updateBulkToolbar();
    initializeBulkActions();
}

// Filter and sorting functions
function applyFilters(items) {
    const searchTerm = byId('searchInput')?.value.toLowerCase() || '';
    const statusFilter = byId('statusFilter')?.value || 'all';
    const successFilter = byId('successFilter')?.value || 'all';
    
    return items.filter(item => {
        // Search filter
        if (searchTerm && !item.it.toLowerCase().includes(searchTerm) && 
            !item.de.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Status filter
        if (statusFilter !== 'all') {
            const isDue = !item.dueAt || item.dueAt <= now();
            switch (statusFilter) {
                case 'due': if (!isDue) return false; break;
                case 'active': if (item.suspended) return false; break;
                case 'suspended': if (!item.suspended) return false; break;
            }
        }
        
        // Success filter
        if (successFilter !== 'all') {
            const successRate = item.attempts > 0 ? Math.round((item.correct / item.attempts) * 100) : 0;
            switch (successFilter) {
                case 'lt50': if (successRate >= 50) return false; break;
                case '50to79': if (successRate < 50 || successRate >= 80) return false; break;
                case 'ge80': if (successRate < 80) return false; break;
            }
        }
        
        return true;
    });
}

function applySorting(items) {
    const sortBy = byId('sortBy')?.value || 'default';
    
    return [...items].sort((a, b) => {
        switch (sortBy) {
            case 'dueFirst':
                const aDue = a.dueAt || 0;
                const bDue = b.dueAt || 0;
                return aDue - bDue;
                
            case 'succAsc':
                const aSucc = a.attempts > 0 ? (a.correct / a.attempts) : 0;
                const bSucc = b.attempts > 0 ? (b.correct / b.attempts) : 0;
                return aSucc - bSucc;
                
            case 'succDesc':
                const aSuccDesc = a.attempts > 0 ? (a.correct / a.attempts) : 0;
                const bSuccDesc = b.attempts > 0 ? (b.correct / b.attempts) : 0;
                return bSuccDesc - aSuccDesc;
                
            case 'itAZ':
                return a.it.localeCompare(b.it);
                
            case 'deAZ':
                return a.de.localeCompare(b.de);
                
            default: // 'default'
                return 0; // Keep original order
        }
    });
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
    
    // Update row styling for desktop table
    document.querySelectorAll('tbody tr').forEach((row, index) => {
        const checkbox = row.querySelector('.row-checkbox');
        if (checkbox && checkbox.checked) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    });
    
    // Update card styling for mobile
    document.querySelectorAll('.vocab-card').forEach((card) => {
        const checkbox = card.querySelector('.row-checkbox');
        if (checkbox && checkbox.checked) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
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
    const prepForm = byId('prepForm');
    const verbForm = byId('verbForm');
    const articleForm = byId('articleForm');
    
    // Hide all forms first
    if (basicForm) basicForm.style.display = 'none';
    if (prepForm) prepForm.style.display = 'none';
    if (verbForm) verbForm.style.display = 'none';
    if (articleForm) articleForm.style.display = 'none';
    
    // Show appropriate form
    if (type === 'prep' && prepForm) {
        prepForm.style.display = 'block';
    } else if (type === 'article' && articleForm) {
        articleForm.style.display = 'block';
    } else if (type === 'verb' && verbForm) {
        verbForm.style.display = 'block';
    } else if (basicForm) {
        basicForm.style.display = 'block';
    }
}

// Skip functions for different modes
function skipFromPreposition() {
    if (currentId) {
        const card = cardById(currentId);
        if (card) {
            // Mark as skipped and apply penalty
            card.skippedCount = (card.skippedCount || 0) + 1;
            card.lastSkipped = now();
            // Apply skip penalty - shorter interval
            card.due = now() + 60*1000; // 1 minute
            card.interval = Math.max(1, Math.floor(card.interval * 0.5));
        }
    }
    updateLearn();
}

function skipFromArticle() {
    if (currentId) {
        const card = cardById(currentId);
        if (card) {
            // Mark as skipped and apply penalty
            card.skippedCount = (card.skippedCount || 0) + 1;
            card.lastSkipped = now();
            // Apply skip penalty - shorter interval
            card.due = now() + 60*1000; // 1 minute
            card.interval = Math.max(1, Math.floor(card.interval * 0.5));
        }
    }
    updateLearn();
}

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
    // Use the same logic as verb conjugation - grade the card based on lastCorrect
    gradeCard(lastCorrect ? 'good' : 'again');
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
window.skipFromPreposition = skipFromPreposition;
window.skipFromArticle = skipFromArticle;
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

// Excel Import Functionality
function handleExcelImport() {
    const fileInput = byId('excelFile');
    if (!fileInput.files[0]) {
        alert('Bitte wählen Sie eine Excel-Datei aus.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (rawData.length < 2) {
                alert('Excel-Datei enthält keine verwertbaren Daten. Mindestens 2 Zeilen erforderlich.');
                return;
            }

            // Process the data with intelligent analysis
            const result = processExcelData(rawData);
            const { items: processedItems, duplicatesCount, totalProcessed, duplicateDetails } = result;

            if (processedItems.length === 0) {
                // Show detailed results even when no items to import
                let message = `❌ Excel-Import Analyse:\n\n`;
                message += `• ${totalProcessed} Zeilen verarbeitet\n`;
                message += `• ${duplicatesCount} Duplikate übersprungen\n\n`;
                if (duplicateDetails.length > 0) {
                    message += `Übersprungene Duplikate:\n`;
                    duplicateDetails.slice(0, 5).forEach(dup => {
                        message += `• ${dup.italian} → ${dup.german} (${dup.reason})\n`;
                    });
                    if (duplicateDetails.length > 5) {
                        message += `... und ${duplicateDetails.length - 5} weitere\n`;
                    }
                }
                message += `\nAlle Vokabeln sind bereits vorhanden. Import abgebrochen.`;
                alert(message);
                return;
            }

            // Show preview with import statistics
            showExcelImportPreview(processedItems, duplicatesCount, totalProcessed, duplicateDetails);

        } catch (error) {
            console.error('Excel import error:', error);
            alert('Fehler beim Excel-Import: ' + error.message);
        }
    };

    reader.readAsArrayBuffer(file);
}

function processExcelData(rawData) {
    console.log('Processing Excel data with', rawData.length, 'rows');
    
    const items = [];
    const duplicateCheck = new Set();
    const duplicateDetails = [];
    let duplicatesCount = 0;
    let totalProcessed = 0;
    
    // Skip header row, process data rows
    for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (!row || row.length < 2) continue;
        
        // Clean the data
        let col1 = (row[0] || '').toString().trim();
        let col2 = (row[1] || '').toString().trim();
        
        if (!col1 || !col2) continue;
        
        totalProcessed++;
        
        // Intelligent language detection
        const analysis = analyzeLanguagePair(col1, col2);
        let italian, german;
        
        if (analysis) {
            italian = analysis.italian;
            german = analysis.german;
        } else {
            // If language analysis fails, assume first column is Italian, second is German
            italian = col1;
            german = col2;
            console.log('Language analysis failed, using default assignment:', italian, '->', german);
        }
        
        if (!italian || !german) continue;
        
        // Check for duplicates within Excel file
        const duplicateKey = `${italian.toLowerCase()}-${german.toLowerCase()}`;
        if (duplicateCheck.has(duplicateKey)) {
            console.log('Skipping duplicate within Excel:', italian, '->', german);
            duplicateDetails.push({ italian, german, reason: 'Excel-Duplikat' });
            duplicatesCount++;
            continue;
        }
        duplicateCheck.add(duplicateKey);
        
        // Check against existing items (exact match)
        const exactMatch = state.items.some(existing => 
            existing.it.toLowerCase() === italian.toLowerCase() && 
            existing.de.toLowerCase() === german.toLowerCase()
        );
        
        if (exactMatch) {
            console.log('Already exists in app:', italian, '->', german);
            duplicateDetails.push({ italian, german, reason: 'Bereits vorhanden' });
            duplicatesCount++;
            continue;
        }
        
        // Check for similar entries (fuzzy matching)
        const similarEntry = state.items.find(existing => 
            (existing.it.toLowerCase().includes(italian.toLowerCase()) || italian.toLowerCase().includes(existing.it.toLowerCase())) &&
            (existing.de.toLowerCase().includes(german.toLowerCase()) || german.toLowerCase().includes(existing.de.toLowerCase())) &&
            (Math.abs(existing.it.length - italian.length) <= 2 && Math.abs(existing.de.length - german.length) <= 2)
        );
        
        if (similarEntry) {
            console.log('Similar entry found:', italian, '->', german, 'vs', similarEntry.it, '->', similarEntry.de);
            duplicateDetails.push({ italian, german, reason: `Ähnlich: ${similarEntry.it} → ${similarEntry.de}` });
            duplicatesCount++;
            continue;
        }
        
        // Intelligent categorization
        const category = categorizeWord(italian, german);
        const type = determineWordType(italian, german);
        
        // Create vocabulary item
        const item = createAdvancedVocabItem(italian, german, category, type, row[2]);
        items.push(item);
        
        console.log('Processed:', italian, '->', german, '(', category, '/', type, ')');
    }
    
    console.log('Processed', items.length, 'unique items from Excel,', duplicatesCount, 'duplicates found');
    return { items, duplicatesCount, totalProcessed, duplicateDetails };
}

function analyzeLanguagePair(text1, text2) {
    const italianIndicators = /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]|gn|gl|sc|qu|zione|aggio|mente/i;
    const germanIndicators = /[äöüß]|sch|tsch|tion|heit|keit|ung|chen|lein|lich/i;
    
    const text1HasItalian = italianIndicators.test(text1);
    const text1HasGerman = germanIndicators.test(text1);
    const text2HasItalian = italianIndicators.test(text2);
    const text2HasGerman = germanIndicators.test(text2);
    
    // Decision logic
    if (text1HasItalian && !text1HasGerman && text2HasGerman && !text2HasItalian) {
        return { italian: text1, german: text2 };
    } else if (text2HasItalian && !text2HasGerman && text1HasGerman && !text1HasItalian) {
        return { italian: text2, german: text1 };
    } else if (text1HasItalian && !text2HasItalian) {
        return { italian: text1, german: text2 };
    } else if (text2HasItalian && !text1HasItalian) {
        return { italian: text2, german: text1 };
    } else if (text1HasGerman && !text2HasGerman) {
        return { italian: text2, german: text1 };
    } else if (text2HasGerman && !text1HasGerman) {
        return { italian: text1, german: text2 };
    }
    
    // Default: first column Italian, second German
    return { italian: text1, german: text2 };
}

function categorizeWord(italian, german) {
    const italianLower = italian.toLowerCase();
    const germanLower = german.toLowerCase();
    
    // Greetings and common phrases
    if (/ciao|buongiorno|buonasera|grazie|prego|scusi/.test(italianLower) ||
        /hallo|guten tag|danke|bitte|entschuldigung/.test(germanLower)) {
        return 'greetings';
    }
    
    // Food
    if (/pizza|pasta|pane|acqua|vino|carne|pesce|frutta|verdura|dolce/.test(italianLower) ||
        /pizza|nudeln|brot|wasser|wein|fleisch|fisch|obst|gemüse|süß/.test(germanLower)) {
        return 'food';
    }
    
    // Family
    if (/famiglia|padre|madre|figlio|figlia|fratello|sorella|nonno|nonna/.test(italianLower) ||
        /familie|vater|mutter|sohn|tochter|bruder|schwester|großvater|großmutter/.test(germanLower)) {
        return 'family';
    }
    
    // Verbs (common endings)
    if (/are$|ere$|ire$/.test(italianLower) || /en$/.test(germanLower)) {
        return 'verbs';
    }
    
    // Articles
    if (/^(il|la|lo|gli|le|un|una|uno)$/i.test(italianLower) || 
        /^(der|die|das|ein|eine)$/i.test(germanLower)) {
        return 'articles';
    }
    
    return 'general';
}

function determineWordType(italian, german) {
    // Verbs
    if (/are$|ere$|ire$/.test(italian.toLowerCase()) || /en$/.test(german.toLowerCase())) {
        return 'verb';
    }
    
    // Articles
    if (/^(il|la|lo|gli|le|un|una|uno)$/i.test(italian) || 
        /^(der|die|das|ein|eine)$/i.test(german)) {
        return 'article';
    }
    
    // Adjectives (common endings)
    if (/o$|a$|e$/.test(italian.toLowerCase()) && 
        /(ig|lich|isch|ent|ant)$/.test(german.toLowerCase())) {
        return 'adjective';
    }
    
    return 'noun';
}

function createAdvancedVocabItem(italian, german, category, type, notes) {
    return {
        id: uid(),
        it: italian,
        de: german,
        notes: notes || '',
        category: category || 'general',
        type: type || 'noun',
        createdAt: now(),
        dueAt: now(),
        intervalIndex: 0,
        streak: 0,
        suspended: false,
        attempts: 0,
        correct: 0
    };
}

function showExcelImportPreview(items, duplicatesCount = 0, totalProcessed = 0, duplicateDetails = []) {
    // Build statistics message
    let statsMessage = `📊 Excel-Import Analyse:\n\n`;
    statsMessage += `• ${totalProcessed} Zeilen verarbeitet\n`;
    statsMessage += `• ${items.length} neue Vokabeln gefunden\n`;
    
    if (duplicatesCount > 0) {
        statsMessage += `• ${duplicatesCount} Duplikate übersprungen\n\n`;
        if (duplicateDetails.length > 0) {
            statsMessage += `Übersprungene Duplikate:\n`;
            duplicateDetails.slice(0, 3).forEach(dup => {
                statsMessage += `• ${dup.italian} → ${dup.german} (${dup.reason})\n`;
            });
            if (duplicateDetails.length > 3) {
                statsMessage += `... und ${duplicateDetails.length - 3} weitere\n`;
            }
        }
        statsMessage += `\n`;
    }
    
    // Build preview of new items
    const preview = items.slice(0, 5).map(item => 
        `• ${item.it} → ${item.de} (${item.category})`
    ).join('\n');
    
    const more = items.length > 5 ? `\n... und ${items.length - 5} weitere` : '';
    
    const fullMessage = `${statsMessage}✅ Neue Vokabeln zum Import:\n\n${preview}${more}\n\nMöchten Sie diese ${items.length} Vokabeln importieren?`;
    
    const confirmed = confirm(fullMessage);
    
    if (confirmed) {
        // Add to state
        state.items.unshift(...items);
        save();
        
        // Update UI
        renderList();
        updateLearn();
        renderStats();
        
        alert(`✅ Excel-Import erfolgreich!\n\n${items.length} Vokabeln importiert`);
    }
}

console.log('Streamlined Italian Learning App loaded! 🇮🇹');
console.log('selectMode function available:', typeof window.selectMode);
console.log('continueFromType function available:', typeof window.continueFromType);

// Test alle wichtigen Buttons nach DOM Load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const typeCheckBtn = byId('typeCheckBtn');
        const typeContinueBtn = byId('typeContinueBtn');
        console.log('typeCheckBtn found:', !!typeCheckBtn);
        console.log('typeContinueBtn found:', !!typeContinueBtn);
        
        if (typeContinueBtn) {
            console.log('typeContinueBtn onclick:', typeContinueBtn.onclick);
            console.log('typeContinueBtn addEventListener count:', typeContinueBtn.eventListeners?.length || 'unknown');
        }
    }, 1000);
});
