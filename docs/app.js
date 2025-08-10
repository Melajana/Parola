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
    autoFlip:false,
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
            tolerance:20,sortBy:'default',autoSpeak:false,speechRate:0.8,autoFlip:false
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
    
    // Initialize
    showView('learn');
    selectMode('flashcards'); // Default mode
    updateLearn();
});

// Learning algorithm
function updateLearn(){
    const activeItems=state.items.filter(i=>!i.suspended);
    if(!activeItems.length){
        learnWord.textContent='Keine aktiven Karten';
        learnMeta.textContent='Füge neue Wörter hinzu!';
        return;
    }
    
    const due=activeItems.filter(i=>(i.dueAt||0)<=now());
    if(!due.length){
        const nextDue=activeItems.reduce((min,i)=>!min||(i.dueAt||0)<(min.dueAt||0)?i:min,null);
        if(nextDue?.dueAt){
            const waitTime=Math.ceil(((nextDue.dueAt||0)-now())/(1000*60));
            learnWord.textContent='Gut gemacht! 🎉';
            learnMeta.textContent=`Nächste Wiederholung in ${waitTime} Min.`;
        } else {
            learnWord.textContent='Alle Karten gelernt!';
            learnMeta.textContent='Füge neue Inhalte hinzu';
        }
        return;
    }
    
    if(!currentId||!due.find(i=>i.id===currentId)){
        const sorted=due.slice().sort((a,b)=>(a.dueAt||0)-(b.dueAt||0));
        currentId=sorted[0].id;
    }
    
    const card=cardById(currentId);
    if(!card) return;
    
    // Mode-specific display
    const m = mode();
    if (m === 'flashcards') {
        setupFlashcardMode(card);
    } else if (m === 'mc') {
        setupMCMode(card);
    } else if (m === 'type') {
        setupTypeMode(card);
    } else if (m === 'conjugation' && card.type === 'verb') {
        setupConjugationMode(card);
    } else if (m === 'preposition' && card.type === 'prep') {
        setupPrepositionMode(card);
    } else if (m === 'articles' && card.type === 'article') {
        setupArticleMode(card);
    } else if (m === 'gaptext') {
        setupGaptextMode(card);
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
    
    learnWord.textContent = q;
    learnMeta.textContent = `${card.type === 'verb' ? '⚡' : card.type === 'prep' ? '🔗' : card.type === 'article' ? '🎯' : '📚'} ${getModeText()} - ${getDirText()}`;
    
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
    
    // Simple click to reveal answer after short delay
    setTimeout(() => {
        const clickHandler = () => {
            learnWord.textContent = a;
            learnMeta.textContent = `Antwort: ${q} = ${a}`;
            
            // Auto-advance after showing answer
            setTimeout(() => {
                const grade = Math.random() > 0.3 ? 'good' : 'again'; // Simple auto-grading
                gradeCard(grade);
            }, 2000);
            
            // Remove click handler
            learnWord.removeEventListener('click', clickHandler);
        };
        
        learnWord.addEventListener('click', clickHandler);
        learnWord.style.cursor = 'pointer';
        learnWord.title = 'Klicken für Antwort';
    }, 100);
}

function setupMCMode(card) {
    hideAllModeBoxes();
    const q = dir() === 'it-de' ? card.it : card.de;
    const correct = dir() === 'it-de' ? card.de : card.it;
    
    // Generate distractors
    const allCards = state.items.filter(c => c.id !== card.id);
    const distractors = shuffle(allCards).slice(0, 3).map(c => dir() === 'it-de' ? c.de : c.it);
    const options = shuffle([correct, ...distractors]);
    
    learnWord.textContent = q;
    learnMeta.textContent = '🎯 Multiple Choice - Wähle die richtige Antwort';
    
    // Create option buttons (simplified)
    const optionsHtml = options.map((opt, idx) => 
        `<button class="btn ghost" onclick="checkMC('${opt}', '${correct}')" style="margin: 4px; display: block;">${opt}</button>`
    ).join('');
    
    learnWord.innerHTML = `${q}<div style="margin-top: 16px;">${optionsHtml}</div>`;
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
    
    setTimeout(() => gradeCard(isCorrect ? 'good' : 'again'), 1500);
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
}

function setupGaptextMode(card) {
    hideAllModeBoxes();
    const gaptextBox = byId('gaptextBox');
    if (gaptextBox) gaptextBox.style.display = 'block';
    
    learnWord.textContent = '';
    learnMeta.textContent = '📝 Lückentext - Ergänze den Satz';
    
    // Simple gaptext based on card type
    let sentence = '';
    let answer = '';
    
    if (card.type === 'verb' && card.extra?.conjugations?.presente) {
        sentence = `Io _____ ${card.extra.infinitive}`;
        answer = card.extra.conjugations.presente.io;
    } else if (card.type === 'prep') {
        const contexts = card.extra?.contexts || [];
        if (contexts.length > 0) {
            sentence = contexts[0].replace('___', '_____');
            answer = card.it;
        }
    } else {
        // Fallback
        sentence = `"${card.it}" bedeutet auf Deutsch: _____`;
        answer = card.de;
    }
    
    currentGaptext = { sentence, answer };
    
    const sentenceEl = byId('gaptextSentence');
    if (sentenceEl) sentenceEl.textContent = sentence;
    
    const gaptextInput = byId('gaptextInput');
    if (gaptextInput) {
        gaptextInput.value = '';
        gaptextInput.focus();
        gaptextInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                checkGaptext();
            }
        };
    }
}

function checkGaptext() {
    if (!currentGaptext) return;
    
    const input = byId('gaptextInput')?.value.trim();
    const isCorrect = isClose(input, currentGaptext.answer);
    
    const feedback = byId('gaptextFeedback');
    if (feedback) {
        feedback.textContent = isCorrect ? '✓ Richtig!' : `✗ Richtig wäre: ${currentGaptext.answer}`;
        feedback.className = `type-feedback ${isCorrect ? 'ok' : 'bad'}`;
        feedback.style.display = 'block';
    }
    
    setTimeout(() => gradeCard(isCorrect ? 'good' : 'again'), 1500);
}
}

function hideAllModeBoxes() {
    const boxes = ['typeBox', 'conjugationBox', 'prepositionBox', 'articleBox', 'gaptextBox'];
    boxes.forEach(boxId => {
        const box = byId(boxId);
        if (box) box.style.display = 'none';
    });
    
    // Reset word display
    if (learnWord) {
        learnWord.style.cursor = 'default';
        learnWord.title = '';
        learnWord.innerHTML = learnWord.textContent; // Clear any HTML
    }
}

// Answer checking functions
function checkMC(selected, correct) {
    const isCorrect = selected === correct;
    lastCorrect = isCorrect;
    
    learnWord.innerHTML = `
        <div>${dir() === 'it-de' ? cardById(currentId).it : cardById(currentId).de}</div>
        <div style="margin-top: 12px; font-size: 18px; color: ${isCorrect ? 'var(--ok)' : 'var(--bad)'};">
            ${isCorrect ? '✓ Richtig!' : '✗ Falsch - Richtig: ' + correct}
        </div>
    `;
    
    setTimeout(() => gradeCard(isCorrect ? 'good' : 'again'), 1500);
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
    
    setTimeout(() => gradeCard(isCorrect ? 'good' : 'again'), 1500);
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
        row = { d: k, good: 0, bad: 0 };
        state.history.push(row);
    }
    if (r === 'good') row.good++;
    else row.bad++;
    save();
}

// Helper functions
function getModeText() {
    const m = mode();
    const modes = {
        'flashcards': 'Karteikarten',
        'mc': 'Multiple Choice',
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

// List management (simplified)
function renderList() {
    const tbody = document.querySelector('#cardTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    state.items.forEach(item => {
        const row = document.createElement('tr');
        const successRate = item.attempts > 0 ? Math.round((item.correct / item.attempts) * 100) : 0;
        
        row.innerHTML = `
            <td><strong>${item.it}</strong></td>
            <td>${item.de}</td>
            <td>${item.streak || 0}</td>
            <td>${successRate}%</td>
            <td>
                <button class="btn ghost btn-xs" onclick="toggleSuspend('${item.id}')">
                    ${item.suspended ? 'Aktivieren' : 'Pausieren'}
                </button>
                <button class="btn ghost btn-xs" onclick="deleteCard('${item.id}')">Löschen</button>
            </td>
        `;
        tbody.appendChild(row);
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

// Add new card (simplified)
function addCard() {
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
        type: 'vocab',
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

// Expose global functions for HTML onclick handlers
window.selectMode = selectMode;
window.checkMC = checkMC;
window.toggleSuspend = toggleSuspend;
window.deleteCard = deleteCard;
window.addCard = addCard;

console.log('Streamlined Italian Learning App loaded! 🇮🇹');
