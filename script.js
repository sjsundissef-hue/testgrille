// ==========================================
// === 1. CONFIGURATION PRINCIPALE DU JEU ===
// ==========================================

// Définition des constantes essentielles & initialisation globale
const GRID_SIZES     = [4, 5];         // Tailles valides de grilles (4x4, 5x5)
const DEFAULT_GRID   = 4;              // Taille de grille par défaut
const CHRONO_DURATIONS = {
    "4x4": 120,
    "5x5": 180,
    "expert3x3": 120,
    "fun2x2": 180
};

// Initialisation de l'état du jeu (sera modifié dynamiquement)
let gridSize         = DEFAULT_GRID;
let isChronoGame     = false;
let isRankedEligible = false;
let isExpertMode     = false;
let isCustomGame     = false;
let isFunMode        = false;
let currentGameId    = null;
let challengeModeName = "";
let currentChronoMode = null;
let currentFunIndex  = 0;
let shuffledFunCombos = [];
let gridData         = [];
let cachedSolutions  = null;
let foundWords       = new Set();
let gameSolved       = false;
let solutionMode     = false;
let isChallengeActive = false;

// (Les DOMContentLoaded ou initialisations dom viendront après)

// Classes pour contrôle d'affichage des boutons & zones en mode chrono/solutions/leaderboard
const BODY_CHRONO_CLASS = "chrono-active";
const BODY_SOLUTIONS_CLASS = "solutions-open";
const BODY_LEADERBOARD_CLASS = "leaderboard-open";

// Helpers pour afficher/cacher le classement (leaderboard) selon l'état et le device

function setLeaderboardUI(open) {
  // Contrôle l'ouverture/fermeture du panneau classement
  // open = true => ouvert, false => fermé
  const body = document.body;
  if (open) {
    body.classList.add(BODY_LEADERBOARD_CLASS);
  } else {
    body.classList.remove(BODY_LEADERBOARD_CLASS);
  }
}

// État courant
let isLeaderboardOpen = false;

// Detecte si l'utilisateur est sur mobile (basé sur largeur fenêtre, améliorable selon besoins)
function isMobileDevice() {
  return window.matchMedia("(max-width: 700px)").matches;
}

// Fonction pour mettre à jour le texte du bouton
function updateLeaderboardButtonText() {
  const leaderboardBtn = document.getElementById("leaderboardToggleBtn");
  if (leaderboardBtn) {
    leaderboardBtn.textContent = isLeaderboardOpen ? "❌ Fermer le classement" : "📊 Voir le classement";
  }
}

// Attache l'écouteur sur le bouton toggle leaderboard dès que le DOM est prêt
document.addEventListener("DOMContentLoaded", function() {
  const leaderboardBtn = document.getElementById("leaderboardToggleBtn");
  if (leaderboardBtn) {
    leaderboardBtn.addEventListener("click", function() {
      isLeaderboardOpen = !isLeaderboardOpen;
      setLeaderboardUI(isLeaderboardOpen);
      updateLeaderboardButtonText();
    });
  }

  // Sur mobile: panneau fermé par défaut au départ. 
  // Sur PC: fermé par défaut aussi (cohérent)
  if (isMobileDevice()) {
    isLeaderboardOpen = false;
    setLeaderboardUI(false);
  } else {
    isLeaderboardOpen = false;
    setLeaderboardUI(false);
  }
  updateLeaderboardButtonText();
});

// Si l'utilisateur redimensionne la page, on ajuste la visibilité si besoin
window.addEventListener("resize", function() {
  // S'assurer que sur mobile il reste fermé par défaut (pas ouvert par resize)
  if (isMobileDevice() && isLeaderboardOpen) {
    isLeaderboardOpen = false;
    setLeaderboardUI(false);
    updateLeaderboardButtonText();
  }
});

// Helpers pour afficher les bons boutons/panels selon l'état du mode chrono/solutions.
// On ajoute ou retire des classes sur <body> pour piloter le CSS.

function setChronoModeUI(active) {
  // active = true au démarrage du chrono, false sinon
  const body = document.body;
  if (active) {
    body.classList.add(BODY_CHRONO_CLASS);
    body.classList.remove(BODY_SOLUTIONS_CLASS);
  } else {
    body.classList.remove(BODY_CHRONO_CLASS);
  }
}

function openSolutionsUI() {
  // Affiche uniquement le bouton "replay" et la grille compacte, grâce à la classe solutions-open.
  // Le panneau score et la word-list restent visibles.
  // La CSS doit gérer le layout via .solutions-open.
  const body = document.body;
  body.classList.add(BODY_SOLUTIONS_CLASS);
  // Laisse BODY_CHRONO_CLASS si besoin pour l'effet compact, le CSS choisira la combinaison.
}

// Exemple d'intégration avec le reste du JS :
// Quand le chrono est lancé :
/*
setChronoModeUI(true);
// (Le bouton Voir solutions 'solveBtn' doit rester affiché via le CSS associé à .chrono-active)
*/

// Quand le chrono est arrêté ou quitte le mode chrono :
/*
setChronoModeUI(false);
*/

// Quand l'utilisateur clique sur "Voir solutions" (solveBtn) :
/*
openSolutionsUI();
*/

// Quand il clique sur "Rejouer" (replayBtn) ou quitte le panneau solutions :
/*
setChronoModeUI(false);
document.body.classList.remove(BODY_SOLUTIONS_CLASS);
*/


const SUPABASE_URL = "https://dtaufxcpiapzdpiqthmu.supabase.co";
const SUPABASE_KEY = "sb_publishable_GblvazVWGG23qdrX4GEtvw_Ypn01EFa";

const MIN_WORD_LENGTH = 4;
const DICT_URL = "dictionnaire.json";

const FUN_COMBOS = [
  "ERSU","ACER","AILS","AIRS","AIST","EORS","AIRV","AEIM",
  "AELP","AEMR","AIMS","AINS","AEPR","AEPT","AERS","ARST",
  "AERT","ABET","CERU","DERU"
];

const EXPERT_GRIDS = [
  ["T","E","M","R","I","S","D","A","T"],
  ["T","E","R","N","I","R","T","A","T"],
  ["R","A","S","T","I","S","S","N","E"],
  ["A","P","E","I","T","A","S","R","E"],
  ["T","A","O","R","I","S","U","E","L"]
];

const FALLBACK_WORDS = ["TEST","WORD","GAME","JOUER","GAGNE"];

const FREQUENCIES = [
  { l:"E", w:14.7 },{ l:"A", w:7.6 },{ l:"I", w:7.5 },{ l:"S", w:7.9 },
  { l:"N", w:7.0 },{ l:"R", w:6.6 },{ l:"T", w:7.2 },{ l:"O", w:5.7 },
  { l:"L", w:5.4 },{ l:"U", w:6.3 },{ l:"D", w:3.6 },{ l:"C", w:3.2 },
  { l:"M", w:2.9 },{ l:"P", w:2.5 },{ l:"G", w:1.0 },{ l:"B", w:0.9 },
  { l:"V", w:1.8 },{ l:"H", w:0.7 },{ l:"F", w:1.0 },{ l:"Q", w:1.3 },  
  { l:"Y", w:0.3 },{ l:"X", w:0.3 },{ l:"J", w:0.6 },{ l:"K", w:0.07 },
  { l:"W", w:0.06 },{ l:"Z", w:0.05 }
];

const VOWELS    = ["A","E","I","O","U","Y"];
const CONSONANTS= ["B","C","D","F","G","H","J","K","L","M","N","P","Q","R","S","T","V","W","X","Z"];

let cumulativeWeights = [];
let totalWeight = 0;
for (const item of FREQUENCIES) {
  totalWeight += item.w;
  cumulativeWeights.push({ l:item.l, max:totalWeight });
}

// Table Supabase pour le classement 3x3 (ancien système)
const LEADERBOARD_TABLE = "leaderboard_3x3";

// NOUVEAU : table générique pour tous les scores chrono (3x3, 4x4, 5x5)
const SCORES_CHRONO_TABLE = "scores_chrono";

// ==========================================
// ============= PLAYER & GAME IDs =========
// ==========================================

// ID unique par joueur (conservé dans le navigateur)
let PLAYER_ID = localStorage.getItem("wb_player_id");
if (!PLAYER_ID) {
  if (window.crypto && window.crypto.randomUUID) {
    PLAYER_ID = window.crypto.randomUUID();
  } else {
    PLAYER_ID = "wb_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
  }
  localStorage.setItem("wb_player_id", PLAYER_ID);
}

// ==========================================
// ============= 2. VARIABLES & DOM =========
// ==========================================

let currentScore = 0;
let selectionPath = [];
let isDragging = false;
let isEditing = false;

let challengeInterval = null;
let challengeTimeLeft = 0;

// pour ne pas spammer la popup de score
let hasOfferedScore = false;

// NOUVEAU : gestion des parties chrono / classement
let isTimedModeEnabled = false;   // toggle global pour 4x4 / 5x5

// Dictionnaire
const DICTIONARY = new Set();
const PREFIXES   = new Set();
let dictionaryLoaded = false;

// DOM Elements
const gridEl = document.getElementById("grid");
const canvas = document.getElementById("lineCanvas");
const ctx    = canvas.getContext("2d");
const bgCanvas = document.getElementById("bgCanvas");
const ctxBg    = bgCanvas.getContext("2d");
const gridScaleRange = document.getElementById("gridScaleRange");
const gridGapRange   = document.getElementById("gridGapRange");



const wordDisplay   = document.getElementById("currentWord");
const feedbackEl    = document.getElementById("feedbackMsg");
const listEl        = document.getElementById("wordList");
const scoreDisplayEl= document.getElementById("scoreDisplay");
const scoreCompEl   = document.getElementById("scoreComparison");
const listTitleEl   = document.getElementById("listTitle");
const filterInput   = document.getElementById("filterInput");
const timerDisplay  = document.getElementById("timerDisplay");
const historyList   = document.getElementById("historyList");
const leaderboardList = document.getElementById("leaderboardList");
const globalRankingList = document.getElementById("globalRankingList");


// Boutons
const newGridBtn      = document.getElementById("newGridBtn");
const replayBtn       = document.getElementById("replayBtn");
const createGridBtn   = document.getElementById("createGridBtn");
const funBtn          = document.getElementById("funBtn");
const topExpertBtn    = document.getElementById("topExpertBtn");
const help2x2Btn      = document.getElementById("help2x2Btn");
const globalStatsBtn  = document.getElementById("globalStatsBtn") || document.getElementById("statsBtn");
const validateCustomBtn = document.getElementById("validateCustomBtn");
const passBtn         = document.getElementById("passBtn");
const solveBtn        = document.getElementById("solveBtn");
const btn4x4          = document.getElementById("btn4x4");
const btn5x5          = document.getElementById("btn5x5");

// NOUVEAU : éléments potentiels pour le mode chrono (à ajouter côté HTML plus tard)
const chronoToggleBtn = document.getElementById("chronoToggleBtn");
const chronoModeBadge = document.getElementById("chronoModeBadge");

// Modals
const onlineScoreModal = document.getElementById("onlineScoreModal");
const modalScoreMsg    = document.getElementById("modalScoreMsg");
const onlinePseudoInput= document.getElementById("onlinePseudoInput");
const btnIgnoreScore   = document.getElementById("btnIgnoreScore");
const btnSendScore     = document.getElementById("btnSendScore");

const helpModal    = document.getElementById("helpModal");
const closeHelpBtn = document.getElementById("closeHelpBtn");
const helpGridList = document.getElementById("helpGridList");

const statsModal   = document.getElementById("statsModal");
const closeStatsBtn= document.getElementById("closeStatsBtn");
const totalWordsVal= document.getElementById("totalWordsVal");
const uniqueWordsVal = document.getElementById("uniqueWordsVal");
const statsWordList  = document.getElementById("statsWordList");

// Nouveaux éléments pour les stats joueur
const statsTabGlobal = document.getElementById("statsTabGlobal");
const statsTabPlayer = document.getElementById("statsTabPlayer");
const statsMyControls= document.getElementById("statsMyControls");
const statsModeFilters = document.getElementById("statsModeFilters");
const statsMySummary = document.getElementById("statsMySummary");

// ==========================================
// ============= 3. FONCTIONS DE BASE =======
// ==========================================

function clearCanvas() {
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function stopTimer() {
  if (challengeInterval) clearInterval(challengeInterval);
  if (timerDisplay) {
    timerDisplay.style.display = "none";
    timerDisplay.classList.remove("low-time");
  }
  isChallengeActive = false;
}

function updateTimerDisplay() {
  let min = Math.floor(challengeTimeLeft / 60);
  let sec = challengeTimeLeft % 60;
  timerDisplay.textContent = (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
  if (challengeTimeLeft <= 10) timerDisplay.classList.add("low-time");
  else timerDisplay.classList.remove("low-time");
}

function startTimer(seconds) {
  challengeTimeLeft = seconds;
  if (!timerDisplay) return;
  timerDisplay.style.display = "block";
  updateTimerDisplay();
  if (challengeInterval) clearInterval(challengeInterval);
  challengeInterval = setInterval(() => {
    challengeTimeLeft--;
    updateTimerDisplay();
    if (challengeTimeLeft <= 0) endChallenge();
  }, 1000);
}

function endChallenge() {
  stopTimer();
  gameSolved = true;
  if (solveBtn) solveBtn.disabled = false;
  showFeedback("Temps écoulé", "invalid");
  maybeOfferExpertScore();
}

function updateScoreDisplay() {
  if (!scoreDisplayEl) return;
  scoreDisplayEl.textContent = currentScore + " pts";
}

function showFeedback(text, type) {
  if (!feedbackEl) return;
  feedbackEl.textContent = text;
  feedbackEl.className = "feedback visible " + type;
  setTimeout(() => {
    if (feedbackEl.textContent === text) feedbackEl.className = "feedback";
  }, 1200);
}

// NOUVEAU : maj de l’UI chrono
function updateChronoUI() {
  if (chronoToggleBtn) {
    chronoToggleBtn.classList.toggle("chrono-active", isTimedModeEnabled);
    chronoToggleBtn.textContent = isTimedModeEnabled ? "⏱ Mode chrono : ON" : "⏱ Mode chrono : OFF";
  }
  if (chronoModeBadge) {
    const shouldShow = isChronoGame && (isExpertMode || (!isExpertMode && (gridSize === 4 || gridSize === 5)));
    chronoModeBadge.style.display = shouldShow ? "inline-block" : "none";
    if (shouldShow) chronoModeBadge.textContent = "Partie chrono";
  }
}

function resetGameState() {
 // On enlève le mode "solutions ouvertes" au début d'une nouvelle partie
  document.body.classList.remove("solutions-open");
  isEditing = false;
  isCustomGame = false;
  isFunMode = false;
  isExpertMode = false;
  foundWords.clear();
  cachedSolutions = null;
  solutionMode = false;
  currentScore = 0;
  selectionPath = [];
  isChallengeActive = false;
  hasOfferedScore = false;

  isChronoGame = false;
  isRankedEligible = false;
  currentChronoMode = null;
  updateChronoUI();

  if (wordDisplay) wordDisplay.textContent = "";
  if (feedbackEl) {
    feedbackEl.className = "feedback";
    feedbackEl.textContent = "";
  }
  gameSolved = false;
  if (filterInput) filterInput.value = "";
  if (listTitleEl) listTitleEl.textContent = "Score Actuel";
  if (scoreCompEl) scoreCompEl.textContent = "";
  updateScoreDisplay();
  updateWordList();

  if (gridEl) gridEl.style.gridTemplateColumns = "repeat(" + gridSize + ", 1fr)";

  if (solveBtn) {
    solveBtn.textContent = "Voir solutions";
    solveBtn.disabled = false;
  }
}

// Chargement du dictionnaire
function loadDictionary() {
  console.log("Chargement du dictionnaire...");
  fetch(DICT_URL)
    .then((response) => {
      if (!response.ok) throw new Error("Fichier introuvable");
      return response.json();
    })
    .then((words) => {
      for (const w of words) {
        if (typeof w === "string" && w.length >= 2) {
          const clean = w.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          DICTIONARY.add(clean);
          for (let i = 1; i <= clean.length; i++) {
            PREFIXES.add(clean.substring(0, i));
          }
        }
      }
      dictionaryLoaded = true;
      if (feedbackEl) {
        feedbackEl.textContent = "Prêt !";
        feedbackEl.className = "feedback visible valid";
        setTimeout(() => (feedbackEl.className = "feedback"), 1000);
      }
      initGame();
    })
    .catch((err) => {
      console.error("Erreur chargement dictionnaire:", err);
      dictionaryLoaded = false;
      if (feedbackEl) {
        feedbackEl.textContent = "Dico indisponible (mode libre)";
        feedbackEl.className = "feedback visible invalid";
        setTimeout(() => (feedbackEl.className = "feedback"), 1500);
      }
      initGame();
    });
}

// ==========================================
// ============= 4. LOGIQUE PRINCIPALE ======
// ==========================================

function generateNewGameId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "game_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
}

function initGame() {
  stopTimer();
  resetGameState();

  currentGameId = generateNewGameId();

  if (newGridBtn) newGridBtn.style.display = "block";
  if (replayBtn)  replayBtn.style.display = "block";
  if (createGridBtn) createGridBtn.style.display = "block";
  if (funBtn) funBtn.style.display = "block";
  if (help2x2Btn) help2x2Btn.style.display = "block";
  if (globalStatsBtn) globalStatsBtn.style.display = "block";
  if (solveBtn) solveBtn.style.display = "block";
  if (validateCustomBtn) validateCustomBtn.style.display = "none";
  if (passBtn) passBtn.style.display = "none";

  if (gridEl) {
    gridEl.classList.remove("fun-grid");
    gridEl.classList.remove("expert-grid");
  }

  gridData = Array.from({ length: gridSize }, () => Array(gridSize).fill(""));

  if (gridSize === 4) {
    for (let r = 0; r < gridSize; r++) {
      const patternType = Math.floor(Math.random() * 5);
      let pattern = patternType === 0 ? ["C", "V", "C", "V"] : patternType === 1 ? ["V", "C", "V", "C"] : patternType === 2 ? ["C", "V", "C", "C"] : patternType === 3 ? ["C", "V", "C", "E"] : ["?", "?", "?", "?"];
      for (let c = 0; c < gridSize; c++) {
        let char = pattern[c] === "C" ? getLetterByType("C") : pattern[c] === "V" ? getLetterByType("V") : pattern[c] === "E" ? "E" : getRandomLetter();
        if (char === "Q") char = "QU";
        gridData[r][c] = char;
      }
    }
  } else {
    for (let r = 0; r < gridSize; r++)
      for (let c = 0; c < gridSize; c++) {
        let char = getRandomLetter();
        if (char === "Q") char = "QU";
        gridData[r][c] = char;
      }
  }

  renderGrid();
  setTimeout(() => { resizeCanvas(); }, 100);

  isChronoGame = false;
  isRankedEligible = false;
  currentChronoMode = null;

  if (!isFunMode && !isExpertMode && !isCustomGame) {
    const modeName = getCurrentMode();
    if (isTimedModeEnabled && (gridSize === 4 || gridSize === 5)) {
      const duration = CHRONO_DURATIONS[modeName] || CHRONO_DURATIONS["4x4"];
      startTimer(duration);
      isChallengeActive = true;
      isChronoGame = true;
      isRankedEligible = true;
      currentChronoMode = modeName;
      challengeModeName = "chrono-" + modeName;
    }
  }
  updateChronoUI();
}

function replayGrid() {
  if (isEditing) return;

  // 1) On quitte le mode "solutions affichées"
  document.body.classList.remove("solutions-open");
  solutionMode = false;
  gameSolved = false;

  // 2) On remet les boutons dans l'état normal (comme dans initGame)
  if (newGridBtn)        newGridBtn.style.display = "block";
  if (replayBtn)         replayBtn.style.display = "block";
  if (createGridBtn)     createGridBtn.style.display = "block";
  if (funBtn)            funBtn.style.display = "block";
  if (help2x2Btn)        help2x2Btn.style.display = "block";
  if (globalStatsBtn)    globalStatsBtn.style.display = "block";
  if (validateCustomBtn) validateCustomBtn.style.display = "none";
  if (passBtn)           passBtn.style.display = isFunMode ? "block" : "none";

  if (solveBtn) {
    solveBtn.style.display = "block";
    solveBtn.textContent = "Voir solutions";
    solveBtn.disabled = false;
  }

  // 3) Timer / état chrono
  if (isChallengeActive) {
    stopTimer();
    if (feedbackEl) feedbackEl.textContent = "Mode Libre";
  }

  // 4) Reset de la grille mais on garde les mêmes lettres
  foundWords.clear();
  cachedSolutions = null;
  currentScore = 0;
  selectionPath = [];
  if (wordDisplay) wordDisplay.textContent = "";
  if (filterInput) filterInput.value = "";
  if (listTitleEl) listTitleEl.textContent = "Score Actuel";
  if (scoreCompEl) scoreCompEl.textContent = "";
  updateScoreDisplay();
  updateWordList();
  renderGrid();
  setTimeout(resizeCanvas, 50);
  showFeedback("Grille réinitialisée", "valid");

  // 5) Si on est en mode chrono 4x4 / 5x5, on relance
  if (!isFunMode && !isExpertMode && !isCustomGame) {
    const modeName = getCurrentMode();
    if (isTimedModeEnabled && (gridSize === 4 || gridSize === 5)) {
      const duration = CHRONO_DURATIONS[modeName] || CHRONO_DURATIONS["4x4"];
      startTimer(duration);
      isChallengeActive = true;
      isChronoGame = true;
      isRankedEligible = true;
      currentChronoMode = modeName;
      challengeModeName = "chrono-" + modeName;
    } else {
      isChronoGame = false;
      isRankedEligible = false;
      currentChronoMode = null;
    }
  }

  updateChronoUI();
}




window.setMode = function (size) {
  gridSize = size;
  if (size === 4) {
    if (btn4x4) btn4x4.classList.add("active");
    if (btn5x5) btn5x5.classList.remove("active");
  } else {
    if (btn5x5) btn5x5.classList.add("active");
    if (btn4x4) btn4x4.classList.remove("active");
  }
  initGame();
};

// ==========================================
// ============= 5. MODES DE JEU ============
// ==========================================

function startExpertMode() {
  stopTimer();
  resetGameState();

  currentGameId = generateNewGameId();

  isExpertMode = true;
  isFunMode = false;
  isCustomGame = false;

  challengeModeName = "Expert 3x3";
  gridSize = 3;

  if (newGridBtn) newGridBtn.style.display = "none";
  if (replayBtn)  replayBtn.style.display = "none";
  if (createGridBtn) createGridBtn.style.display = "none";
  if (funBtn) funBtn.style.display = "none";
  if (help2x2Btn) help2x2Btn.style.display = "none";
  if (globalStatsBtn) globalStatsBtn.style.display = "none";
  if (solveBtn) solveBtn.style.display = "block";
  if (passBtn) passBtn.style.display = "none";

  if (gridEl) {
    gridEl.classList.add("expert-grid");
    gridEl.classList.remove("fun-grid");
    gridEl.style.gridTemplateColumns = "repeat(3, 1fr)";
  }

  gridData = Array.from({ length: 3 }, () => Array(3).fill(""));

  const randomGrid = EXPERT_GRIDS[Math.floor(Math.random() * EXPERT_GRIDS.length)];
  let i = 0;
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      gridData[r][c] = randomGrid[i];
      i++;
    }

  cachedSolutions = findAllWords();
  renderGrid();
  setTimeout(resizeCanvas, 50);

  const duration = CHRONO_DURATIONS["expert3x3"] || 120;
  startTimer(duration);
  isChallengeActive = true;

  isChronoGame = true;
  isRankedEligible = true;
  currentChronoMode = "expert3x3";

  updateWordList();
  if (feedbackEl) {
    feedbackEl.textContent = "Max de mots !";
    feedbackEl.className = "feedback visible valid";
  }
  updateChronoUI();
}

function startFunMode() {
  stopTimer();
  resetGameState();

  currentGameId = generateNewGameId();

  isFunMode = true;
  isExpertMode = false;
  isCustomGame = false;

  challengeModeName = "Fun 2x2";
  gridSize = 2;
  shuffledFunCombos = [...FUN_COMBOS].sort(() => 0.5 - Math.random());
  currentFunIndex = 0;

  if (newGridBtn) newGridBtn.style.display = "none";
  if (replayBtn)  replayBtn.style.display = "none";
  if (createGridBtn) createGridBtn.style.display = "none";
  if (funBtn) funBtn.style.display = "none";
  if (help2x2Btn) help2x2Btn.style.display = "none";
  if (globalStatsBtn) globalStatsBtn.style.display = "none";
  if (solveBtn) solveBtn.style.display = "none";
  if (passBtn) {
    passBtn.style.display = "block";
    passBtn.textContent = "Voir solutions & passer";
  }

  if (gridEl) {
    gridEl.classList.add("fun-grid");
    gridEl.classList.remove("expert-grid");
  }

  isChronoGame = false;
  isRankedEligible = false;
  currentChronoMode = null;

  loadFunGrid();
  const duration = 180;
  startTimer(duration);
  isChallengeActive = true;
  updateChronoUI();
}

function loadFunGrid() {
  if (currentFunIndex >= shuffledFunCombos.length) currentFunIndex = 0;
  let letters = shuffledFunCombos[currentFunIndex].split("").sort(() => 0.5 - Math.random());
  if (gridEl) gridEl.style.gridTemplateColumns = "repeat(2, 1fr)";
  gridData = Array.from({ length: 2 }, () => Array(2).fill(""));
  let i = 0;
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 2; c++) {
      gridData[r][c] = letters[i];
      i++;
    }
  foundWords.clear();
  gameSolved = false;
  solutionMode = false;
  updateWordList();
  cachedSolutions = findAllWords();
  renderGrid();
  setTimeout(resizeCanvas, 50);
  if (feedbackEl) {
    feedbackEl.textContent = "Trouvez tout !";
    feedbackEl.className = "feedback visible";
  }
}

// ==========================================
// ============= 6. GRAPHIQUES & INPUTS =====
// ==========================================

function renderGrid() {
  if (!gridEl) return;
  gridEl.innerHTML = "";
  gridData.forEach((row, r) => {
    row.forEach((letter, c) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = letter;
      if (letter === "QU") cell.classList.add("qu-mode");
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.addEventListener("mousedown", (e) => startDrag(e, cell));
      cell.addEventListener("mouseenter", (e) => onDragEnter(e, cell));
      cell.addEventListener("touchstart", (e) => {
          e.preventDefault();
          startDrag(e, cell);
        }, { passive: false });
      gridEl.appendChild(cell);
    });
  });
}

function drawPath() {
  // On nettoie juste le canvas
  clearCanvas();
  // On ne dessine plus la ligne blanche qui suit les cases
}

function drawGridLines() {
  if (!ctxBg || !bgCanvas) return;
  // On nettoie juste le fond, on ne dessine plus aucune ligne
  ctxBg.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
}


function resizeCanvas() {
  const wrapper = document.querySelector(".grid-wrapper");
  if (!wrapper || !canvas || !bgCanvas) return;

  canvas.width = wrapper.offsetWidth;
  canvas.height = wrapper.offsetHeight;
  bgCanvas.width = wrapper.offsetWidth;
  bgCanvas.height = wrapper.offsetHeight;

  clearCanvas();
  drawPath();
  drawGridLines();
}

window.addEventListener("resize", resizeCanvas);

function startDrag(e, cell) {
  if (gameSolved || isEditing) return;
  isDragging = true;
  selectionPath = [{ r: parseInt(cell.dataset.r), c: parseInt(cell.dataset.c) }];
  updateVisuals();
}
function onDragEnter(e, cell) {
  if (!isDragging) return;
  addToPath(parseInt(cell.dataset.r), parseInt(cell.dataset.c));
}
document.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const cell = el?.closest(".cell");
    if (cell) addToPath(parseInt(cell.dataset.r), parseInt(cell.dataset.c));
  }, { passive: false }
);
function endDrag() {
  if (!isDragging) return;
  isDragging = false;
  validateWord();
  selectionPath = [];
  updateVisuals();
  clearCanvas();
}
document.addEventListener("mouseup", endDrag);
document.addEventListener("touchend", endDrag);

function addToPath(r, c) {
  if (selectionPath.length > 1) {
    const prev = selectionPath[selectionPath.length - 2];
    if (prev.r === r && prev.c === c) {
      selectionPath.pop();
      updateVisuals();
      return;
    }
  }
  const last = selectionPath[selectionPath.length - 1];
  const isAdj = Math.abs(last.r - r) <= 1 && Math.abs(last.c - c) <= 1;
  const isVisited = selectionPath.some((p) => p.r === r && p.c === c);
  if (isAdj && !isVisited) {
    selectionPath.push({ r, c });
    updateVisuals();
  }
}

function updateVisuals() {
  if (!gridEl) return;
  Array.from(gridEl.children).forEach((el) => el.classList.remove("selected"));
  let word = "";
  selectionPath.forEach((pos) => {
    const idx = pos.r * gridSize + pos.c;
    const cell = gridEl.children[idx];
    if (cell) {
      cell.classList.add("selected");
      word += gridData[pos.r][pos.c];
    }
  });
  if (wordDisplay) wordDisplay.textContent = word;
  drawPath();
}

// ==========================================
// ============= 7. VALIDATION & ALGO =======
// ==========================================

function getLetterByType(type) {
  const targetList = type === "V" ? VOWELS : CONSONANTS;
  let subFreq = FREQUENCIES.filter((f) => targetList.includes(f.l));
  let subTotal = subFreq.reduce((sum, item) => sum + item.w, 0);
  const r = Math.random() * subTotal;
  let current = 0;
  for (const item of subFreq) {
    current += item.w;
    if (r <= current) return item.l;
  }
  return type === "V" ? "E" : "S";
}

function getRandomLetter() {
  const r = Math.random() * totalWeight;
  for (const item of cumulativeWeights) {
    if (r <= item.max) return item.l;
  }
  return "E";
}

function getWordPoints(word) {
  const len = word.length;
  if (len < 4) return 0;
  if (len === 4) return 6;
  if (len === 5) return 8;
  if (len === 6) return 10;
  if (len === 7) return 12;
  return 14;
}

function validateWord() {
  const word = wordDisplay ? wordDisplay.textContent : "";
  if (word.length < 4) {
    if (word.length >= 1) showFeedback("Trop court", "invalid");
    return;
  }

  const isValid = dictionaryLoaded ? DICTIONARY.has(word) : word.length >= 4;

  if (isValid) {
    if (!foundWords.has(word)) {
      foundWords.add(word);
      const pts = getWordPoints(word);
      currentScore += pts;
      showFeedback(word + " +" + pts, "valid");
      updateWordList();
      updateScoreDisplay();
      logWordFind(word);

      // --- LE BLOC DE FLASH VERT A ÉTÉ SUPPRIMÉ ICI ---

      if (isFunMode && cachedSolutions && foundWords.size === cachedSolutions.size) {
        showFeedback("GRILLE TERMINÉE !", "valid");
        setTimeout(() => {
          currentFunIndex++;
          if (passBtn) passBtn.textContent = "Voir solutions & passer";
          loadFunGrid();
        }, 800);
      }
    } else {
      showFeedback("Déjà trouvé", "invalid");
    }
  } else {
    showFeedback("Inconnu", "invalid");
  }
}

function updateWordList() {
  if (!listEl) return;
  listEl.innerHTML = "";
  let sourceWords = [];
  let maxPossibleScore = 0;
  const filterText = filterInput ? filterInput.value.toUpperCase() : "";

  if ((solutionMode || isExpertMode) && cachedSolutions) {
    sourceWords = Array.from(cachedSolutions);
    if (listTitleEl) listTitleEl.textContent = solutionMode ? "Résultats" : "Objectif";
    sourceWords.forEach((w) => (maxPossibleScore += getWordPoints(w)));
    if (scoreCompEl) {
      scoreCompEl.textContent = "Mots : " + foundWords.size + " / " + cachedSolutions.size + "\nPoints : " + currentScore + " / " + maxPossibleScore;
    }
    if (!solutionMode) sourceWords = Array.from(foundWords);
  } else if (isFunMode && cachedSolutions) {
    if (scoreCompEl) scoreCompEl.textContent = "Trouvés : " + foundWords.size + " / " + cachedSolutions.size;
    sourceWords = Array.from(foundWords);
  } else {
    sourceWords = Array.from(foundWords);
    if (listTitleEl) listTitleEl.textContent = "Score Actuel";
  }

  let filteredWords = sourceWords;
  if (filterText) filteredWords = sourceWords.filter((w) => w.includes(filterText));
  if (solutionMode) filteredWords.sort((a, b) => b.length - a.length || a.localeCompare(b));
  else filteredWords.sort((a, b) => a.localeCompare(b));

  filteredWords.forEach((w) => {
    const pts = getWordPoints(w);
    const li = document.createElement("li");
    const spanWord = document.createElement("span");
    spanWord.textContent = w;
    const spanPts = document.createElement("span");
    spanPts.className = "word-points";
    spanPts.textContent = pts;
    if (solutionMode) {
      if (foundWords.has(w)) {
        spanWord.style.fontWeight = "bold";
        spanWord.style.color = "#4cd137";
      } else {
        li.classList.add("missed");
      }
    }
    li.appendChild(spanWord);
    li.appendChild(spanPts);
    listEl.appendChild(li);
  });
}

if (filterInput) {
  filterInput.addEventListener("input", () => updateWordList());
}

function findAllWords() {
  if (!dictionaryLoaded) return new Set();
  const results = new Set();
  const visited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
  const dirs = [[-1, -1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  function dfs(r, c, currentStr) {
    currentStr += gridData[r][c];
    if (!PREFIXES.has(currentStr)) return;
    if (currentStr.length >= 4 && DICTIONARY.has(currentStr)) results.add(currentStr);
    if (currentStr.length > 10) return;
    visited[r][c] = true;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && !visited[nr][nc]) {
        dfs(nr, nc, currentStr);
      }
    }
    visited[r][c] = false;
  }
  for (let r = 0; r < gridSize; r++) for (let c = 0; c < gridSize; c++) dfs(r, c, "");
  return results;
}

// ==========================================
// ============= 8. SUPABASE & STATS MOTS ===
// ==========================================

function getCurrentMode() {
  if (isFunMode) return "fun2x2";
  if (isExpertMode) return "expert3x3";
  if (isCustomGame) return "custom";
  if (gridSize === 4) return "4x4";
  if (gridSize === 5) return "5x5";
  return "unknown";
}

async function logWordFind(word) {
  const mode = getCurrentMode();
  try {
    fetch(`${SUPABASE_URL}/rest/v1/word_finds`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        word: word, length: word.length, board_size: gridSize, mode: mode, player_id: PLAYER_ID,
        game_id: currentGameId, is_challenge: isChallengeActive, time_left: challengeTimeLeft, score_after: currentScore
      })
    });
  } catch (e) { console.error("Log error", e); }
}

// ----- Stats : helper pour onglets -----

function setStatsTab(tab) {
  if (!statsTabGlobal || !statsTabPlayer || !statsMyControls) {
    loadGlobalStats();
    return;
  }
  if (tab === "player") {
    statsTabGlobal.classList.remove("stats-tab-active");
    statsTabPlayer.classList.add("stats-tab-active");
    statsMyControls.style.display = "block";
    loadPlayerStats("all");
  } else {
    statsTabGlobal.classList.add("stats-tab-active");
    statsTabPlayer.classList.remove("stats-tab-active");
    statsMyControls.style.display = "none";
    statsMySummary.textContent = "";
    loadGlobalStats();
  }
}

// ----- Stats globales -----

async function loadGlobalStats() {
  if (!totalWordsVal || !uniqueWordsVal || !statsWordList) return;
  totalWordsVal.textContent = "...";
  uniqueWordsVal.textContent = "...";
  statsWordList.innerHTML = '<li style="text-align:center; padding:10px; color:#aaa;">Chargement...</li>';

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/word_stats_global?select=word,total_finds&order=total_finds.desc&limit=20`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    if (!response.ok) throw new Error("Erreur stats global");
    const data = await response.json();
    statsWordList.innerHTML = "";
    if (data.length === 0) {
      statsWordList.innerHTML = '<li style="text-align:center; padding:10px;">Aucune donnée.</li>';
    } else {
      data.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "leaderboard-item";
        li.innerHTML = `<span class="lb-rank">#${index + 1}</span><span class="lb-name">${item.word}</span><span class="lb-score" style="color:#2c3e50;">${item.total_finds} fois</span>`;
        statsWordList.appendChild(li);
      });
    }
    const countRes = await fetch(`${SUPABASE_URL}/rest/v1/word_finds?select=id`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Range: "0-0", Prefer: "count=exact" }
    });
    const range = countRes.headers.get("Content-Range");
    if (range) totalWordsVal.textContent = range.split("/")[1];
    else totalWordsVal.textContent = "-";

    const uniqueRes = await fetch(`${SUPABASE_URL}/rest/v1/word_stats_global?select=word`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Range: "0-0", Prefer: "count=exact" }
    });
    const rangeUnique = uniqueRes.headers.get("Content-Range");
    if (rangeUnique) uniqueWordsVal.textContent = rangeUnique.split("/")[1];
    else uniqueWordsVal.textContent = "-";
  } catch (e) {
    console.error(e);
    statsWordList.innerHTML = '<li style="text-align:center; color:#e74c3c;">Erreur chargement stats (Vue SQL manquante ?).</li>';
  }
}

// ----- Stats joueur -----

async function loadPlayerStats(modeFilter) {
  if (!statsModeFilters || !statsMySummary || !statsWordList) {
    loadGlobalStats();
    return;
  }
  const buttons = statsModeFilters.querySelectorAll(".mode-filter");
  buttons.forEach((btn) => {
    if (btn.dataset.mode === modeFilter) btn.classList.add("active");
    else btn.classList.remove("active");
  });
  statsWordList.innerHTML = '<li style="text-align:center; padding:10px; color:#aaa;">Chargement...</li>';

  try {
    let url = `${SUPABASE_URL}/rest/v1/word_stats_player?select=player_id,mode,board_size,word,total_finds&player_id=eq.${PLAYER_ID}`;
    if (modeFilter === "expert3x3") url += `&mode=eq.expert3x3`;
    else if (modeFilter === "4x4") url += `&board_size=eq.4`;
    else if (modeFilter === "5x5") url += `&board_size=eq.5`;
    url += `&order=total_finds.desc&limit=50`;

    const response = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    if (!response.ok) throw new Error("Erreur stats joueur");
    const data = await response.json();
    statsWordList.innerHTML = "";

    if (!data.length) {
      statsMySummary.textContent = "Aucune donnée pour ce mode (ou nouveau joueur).";
      statsWordList.innerHTML = '<li style="text-align:center; padding:10px;">Joue quelques parties pour voir tes stats ici 👀</li>';
      return;
    }
    const totalDistinct = data.length;
    const totalFinds = data.reduce((sum, item) => sum + (item.total_finds || 0), 0);
    const best = data[0];
    let modeLabel = "tous modes";
    if (modeFilter === "expert3x3") modeLabel = "mode Expert 3x3";
    else if (modeFilter === "4x4") modeLabel = "mode 4x4";
    else if (modeFilter === "5x5") modeLabel = "mode 5x5";

    statsMySummary.innerHTML = `Tu as trouvé <b>${totalFinds}</b> mots (<b>${totalDistinct}</b> uniques) en ${modeLabel}.<br>Ton mot le plus spammé : <b>${best.word}</b> (${best.total_finds} fois).`;
    data.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "leaderboard-item";
      const smallTag = item.mode === "expert3x3" ? "3x3" : item.board_size ? item.board_size + "x" + item.board_size : item.mode || "";
      li.innerHTML = `<span class="lb-rank">#${index + 1}</span><span class="lb-name">${item.word}</span><span class="lb-score">${item.total_finds} fois</span><span style="margin-left:auto; font-size:0.75rem; color:#95a5a6;">${smallTag}</span>`;
      statsWordList.appendChild(li);
    });
  } catch (e) {
    console.error(e);
    statsWordList.innerHTML = '<li style="text-align:center; color:#e74c3c;">Erreur chargement de tes stats (vue SQL manquante ?).</li>';
    statsMySummary.textContent = "";
  }
}

// ==========================================
// ============= 9. CLASSEMENT 3x3 =========
// ==========================================

// ===== CLASSEMENT EXPERT (actuel) =====
async function loadExpertLeaderboard() {
  if (!leaderboardList) return;
  leaderboardList.innerHTML = '<li style="text-align:center; padding:10px; color:#aaa;">Chargement...</li>';
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${LEADERBOARD_TABLE}?select=pseudo,score,created_at&order=score.desc&limit=30`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    if (!res.ok) throw new Error("Erreur leaderboard");
    const data = await res.json();
    leaderboardList.innerHTML = "";
    if (!data.length) {
      leaderboardList.innerHTML =
        '<li style="text-align:center; padding:10px; color:#aaa;">Aucun score pour l\'instant.</li>';
      return;
    }

    data.forEach((row, index) => {
      const li = document.createElement("li");
      li.className = "leaderboard-item";
      li.innerHTML = `
        <span class="lb-rank">#${index + 1}</span>
        <span class="lb-name">${row.pseudo || "Anonyme"}</span>
        <span class="lb-score">${row.score} pts</span>
      `;
      leaderboardList.appendChild(li);
    });
  } catch (e) {
    console.error(e);
    leaderboardList.innerHTML =
      '<li style="text-align:center; color:#e74c3c;">Erreur chargement classement 3x3.</li>';
  }
}



// ===== NOUVEAU : CLASSEMENT GLOBAL RANKED =====
//  -> Top score 3x3 + top score 4x4 + top score 5x5
//  -> Somme des 3 = classement global
async function loadGlobalRanking() {
  if (!globalRankingList) return;

  globalRankingList.innerHTML =
    '<li style="text-align:center; padding:10px; color:#aaa;">Chargement...</li>';

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/global_ranking?select=pseudo,best_3x3,best_4x4,best_5x5,total_score&order=total_score.desc&limit=30`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    if (!res.ok) throw new Error("Erreur classement global");

    const data = await res.json();
    globalRankingList.innerHTML = "";

    if (!data.length) {
      globalRankingList.innerHTML =
        '<li style="text-align:center; padding:10px; color:#aaa;">Aucun joueur classé pour l\'instant.</li>';
      return;
    }

    data.forEach((row, index) => {
      const li = document.createElement("li");
      li.className = "leaderboard-item";

      const best3 = row.best_3x3 ?? 0;
      const best4 = row.best_4x4 ?? 0;
      const best5 = row.best_5x5 ?? 0;

      li.innerHTML = `
        <span class="lb-rank">#${index + 1}</span>
        <span class="lb-name">${row.pseudo || "Anonyme"}</span>
        <span class="lb-score" style="color:#27ae60;">${row.total_score} pts</span>
        <span style="margin-left:auto; font-size:0.75rem; color:#95a5a6;">
          ${best3}/${best4}/${best5}
        </span>
      `;
      globalRankingList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    globalRankingList.innerHTML =
      '<li style="text-align:center; color:#e74c3c;">Impossible de charger le classement global.</li>';
  }
}



function maybeOfferExpertScore() {
  if (!isRankedEligible) return;
  if (hasOfferedScore) return;
  if (!onlineScoreModal) return;
  if (currentScore <= 0) return;

  hasOfferedScore = true;
  const mode = getCurrentMode();
  let label = "";
  if (isExpertMode) label = "Mode Expert 3x3";
  else if (mode === "4x4") label = "Mode 4x4 (chrono)";
  else if (mode === "5x5") label = "Mode 5x5 (chrono)";
  else label = "Partie chrono";

  modalScoreMsg.textContent = `Score : ${currentScore} pts – ${label}`;
  onlinePseudoInput.value = "";
  onlineScoreModal.style.display = "flex";
}

async function sendExpertScore() {
  if (!onlineScoreModal) return;
  const pseudo = onlinePseudoInput.value.trim() || "Anonyme";
  const mode = getCurrentMode();
  const boardSize = gridSize;
  const createdAt = new Date().toISOString();

  try {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/${SCORES_CHRONO_TABLE}`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ player_id: PLAYER_ID, pseudo, mode, board_size: boardSize, score: currentScore, created_at: createdAt })
      });
    } catch (e) { console.error("Erreur enregistrement scores_chrono", e); }

    if (isExpertMode) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${LEADERBOARD_TABLE}`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ player_id: PLAYER_ID, pseudo, score: currentScore, created_at: createdAt })
      });
      if (!res.ok) throw new Error("Erreur envoi score leaderboard 3x3");
    }
    onlineScoreModal.style.display = "none";
    showFeedback("Score envoyé au classement !", "valid");
    if (isExpertMode) loadExpertLeaderboard();
  } catch (e) {
    console.error(e);
    showFeedback("Erreur lors de l'envoi du score", "invalid");
  }
}

// ==========================================
// ============= 10. AIDE 2x2 ===============
// ==========================================

if (help2x2Btn) {
  help2x2Btn.addEventListener("click", () => {
    if (!helpModal) return;
    helpModal.style.display = "flex";
    generateHelpContent();
  });
}
if (closeHelpBtn)
  closeHelpBtn.addEventListener("click", () => { if (helpModal) helpModal.style.display = "none"; });

function generateHelpContent() {
  if (!dictionaryLoaded) return;
  if (!helpGridList) return;
  if (helpGridList.children.length > 1) return;
  helpGridList.innerHTML = "";
  FUN_COMBOS.forEach((combo) => {
    const words = solveGridForDisplay(combo);
    const div = document.createElement("div");
    div.className = "help-item";
    let gridHTML = '<div class="mini-grid">';
    for (let char of combo) gridHTML += `<div class="mini-cell">${char}</div>`;
    gridHTML += "</div>";
    let wordsHTML = '<div class="help-words">';
    if (words.length > 0) words.forEach((w) => (wordsHTML += `<span class="word-tag">${w}</span>`));
    else wordsHTML += "Pas de mot trouvé.";
    wordsHTML += "</div>";
    div.innerHTML = `<div class="help-item-header">${gridHTML}<div style="font-weight:bold; color:#4a90e2;">${words.length} Mots</div></div>${wordsHTML}`;
    helpGridList.appendChild(div);
  });
}

function solveGridForDisplay(lettersStr) {
  const letters = lettersStr.split("");
  const grid2x2 = [[letters[0], letters[1]], [letters[2], letters[3]]];
  const results = new Set();
  const visited = [[false, false], [false, false]];
  const dirs = [[-1, -1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  function dfs(r, c, currentStr, localVisited) {
    currentStr += grid2x2[r][c];
    if (!PREFIXES.has(currentStr)) return;
    if (currentStr.length >= 4 && DICTIONARY.has(currentStr)) results.add(currentStr);
    localVisited[r][c] = true;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < 2 && nc >= 0 && nc < 2 && !localVisited[nr][nc]) dfs(nr, nc, currentStr, localVisited);
    }
    localVisited[r][c] = false;
  }
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) dfs(r, c, "", visited);
  return Array.from(results).sort((a, b) => b.length - a.length || a.localeCompare(b));
}

// ==========================================
// ============= 11. LISTENERS ==============
// ==========================================

if (topExpertBtn) topExpertBtn.addEventListener("click", startExpertMode);
if (newGridBtn) newGridBtn.addEventListener("click", () => { initGame(); });
if (replayBtn)  replayBtn.addEventListener("click", replayGrid);
if (createGridBtn) createGridBtn.addEventListener("click", startManualCreation);
if (funBtn) funBtn.addEventListener("click", startFunMode);
if (validateCustomBtn) validateCustomBtn.addEventListener("click", validateGrid);

if (passBtn) {
  passBtn.addEventListener("click", () => {
    if (passBtn.textContent.includes("Voir")) {
      if (!cachedSolutions) cachedSolutions = findAllWords();
      solutionMode = true;
      gameSolved = true;
      updateWordList();
      passBtn.textContent = "Grille suivante ⏭️";
    } else {
      currentFunIndex++;
      passBtn.textContent = "Voir solutions & passer";
      loadFunGrid();
    }
  });
}

if (solveBtn) {
  solveBtn.addEventListener("click", () => {
    // si les solutions sont déjà affichées, on ne refait rien
    if (solutionMode) return;

    // sécurité : si le dico n'est pas chargé, on prévient
    if (!dictionaryLoaded) {
      showFeedback("Dico pas encore chargé", "invalid");
      return;
    }

    // Cas spécial : grille personnalisée avec attente 10s
    if (isCustomGame && !gameSolved) {
      if (solveBtn.disabled) return;
      let countdown = 10;
      solveBtn.disabled = true;
      solveBtn.textContent = `Attente ${countdown}s...`;
      let interval = setInterval(() => {
        countdown--;
        solveBtn.textContent = `Attente ${countdown}s...`;
        if (countdown <= 0) {
          clearInterval(interval);
          solveBtn.disabled = false;
          solveBtn.textContent = "Voir solutions";
          finishAndShowSolutions();
        }
      }, 1000);
      return;
    }

    // Cas normal (4x4, 5x5, expert3x3…)
    finishAndShowSolutions();
  });
}function finishAndShowSolutions() {
  // Si on était en chrono, on stoppe
  if (isChallengeActive) {
    stopTimer();
    if (feedbackEl) {
      feedbackEl.textContent = "Partie terminée";
      feedbackEl.className = "feedback visible";
    }
  }

  // Calcul des solutions si ce n'est pas déjà fait
  if (!cachedSolutions || !cachedSolutions.size) {
    cachedSolutions = findAllWords();
  }

  solutionMode = true;
  gameSolved = true;

  // Active le mode spécial "solutions" pour le CSS mobile
  document.body.classList.add("solutions-open");

  // En JS : on cache juste le bouton "Voir solutions"
  if (solveBtn) {
    solveBtn.style.display = "none";
  }

  // On s'assure que "Rejouer" est bien visible
  if (replayBtn) {
    replayBtn.style.display = "inline-block";
  }

  updateWordList();

  // on remonte la liste en haut
  if (listEl) listEl.scrollTop = 0;

  // titre = Résultats
  if (listTitleEl) listTitleEl.textContent = "Résultats";

  maybeOfferExpertScore();
}





function startManualCreation() {
  resetGameState();
  stopTimer();
  if (newGridBtn) newGridBtn.style.display = "none";
  if (replayBtn)  replayBtn.style.display = "none";
  if (createGridBtn) createGridBtn.style.display = "none";
  if (funBtn) funBtn.style.display = "none";
  if (help2x2Btn) help2x2Btn.style.display = "none";
  if (globalStatsBtn) globalStatsBtn.style.display = "none";
  if (solveBtn) solveBtn.style.display = "none";
  if (validateCustomBtn) validateCustomBtn.style.display = "block";
  isEditing = true;
  if (feedbackEl) {
    feedbackEl.textContent = "Remplissez les cases";
    feedbackEl.className = "feedback visible";
  }
  if (!gridEl) return;
  gridEl.innerHTML = "";
  for (let r = 0; r < gridSize; r++)
    for (let c = 0; c < gridSize; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const input = document.createElement("input");
      input.className = "cell-input";
      input.maxLength = 2;
      input.dataset.r = r;
      input.dataset.c = c;
      input.dataset.index = r * gridSize + c;
      input.addEventListener("input", (e) => { e.target.value = e.target.value.toUpperCase(); });
      cell.appendChild(input);
      gridEl.appendChild(cell);
    }
}

function validateGrid() {
  const inputs = document.querySelectorAll(".cell-input");
  gridData = Array.from({ length: gridSize }, () => Array(gridSize).fill(""));
  for (let i = 0; i < inputs.length; i++) {
    let val = inputs[i].value.trim().toUpperCase();
    if (!val) { alert("Remplissez tout !"); return; }
    gridData[parseInt(inputs[i].dataset.r)][parseInt(inputs[i].dataset.c)] = val;
  }
  currentGameId = generateNewGameId();
  isEditing = false;
  isCustomGame = true;
  if (newGridBtn) newGridBtn.style.display = "block";
  if (replayBtn)  replayBtn.style.display = "block";
  if (createGridBtn) createGridBtn.style.display = "block";
  if (funBtn) funBtn.style.display = "block";
  if (help2x2Btn) help2x2Btn.style.display = "block";
  if (globalStatsBtn) globalStatsBtn.style.display = "block";
  if (solveBtn) solveBtn.style.display = "block";
  if (validateCustomBtn) validateCustomBtn.style.display = "none";
  if (feedbackEl) feedbackEl.className = "feedback";
  renderGrid();
  setTimeout(resizeCanvas, 50);
}

if (btnIgnoreScore) {
  btnIgnoreScore.addEventListener("click", () => { onlineScoreModal.style.display = "none"; });
}
if (btnSendScore) {
  btnSendScore.addEventListener("click", () => { sendExpertScore(); });
}

if (globalStatsBtn) {
  globalStatsBtn.addEventListener("click", () => {
    if (statsModal) {
      statsModal.style.display = "flex";
      setStatsTab("global");
    }
  });
}
if (closeStatsBtn) {
  closeStatsBtn.addEventListener("click", () => { statsModal.style.display = "none"; });
}
if (statsTabGlobal && statsTabPlayer) {
  statsTabGlobal.addEventListener("click", () => setStatsTab("global"));
  statsTabPlayer.addEventListener("click", () => setStatsTab("player"));
}
if (statsModeFilters) {
  statsModeFilters.addEventListener("click", (e) => {
    const btn = e.target.closest(".mode-filter");
    if (!btn) return;
    const m = btn.dataset.mode || "all";
    loadPlayerStats(m);
  });
}

if (chronoToggleBtn) {
  chronoToggleBtn.addEventListener("click", () => {
    isTimedModeEnabled = !isTimedModeEnabled;
    updateChronoUI();
    if (gridSize === 4 || gridSize === 5) initGame();
  });
}
function applyGridScale(value) {
  const scale = value / 100; // 80 -> 0.8, 100 -> 1, 120 -> 1.2
  document.documentElement.style.setProperty("--grid-scale", scale);

  // On augmente l'espace au-dessus de la grille quand on zoome
  const wordArea = document.querySelector(".word-display-area");
  if (wordArea) {
    const extra = Math.max(0, (scale - 1) * 60);  // 0 à l’échelle 100, + espace si > 100
    wordArea.style.marginBottom = 12 + extra + "px";
  }

  // on recalcule le canvas pour suivre la nouvelle taille visuelle
  resizeCanvas();
}

if (gridScaleRange) {
  // valeur initiale
  applyGridScale(gridScaleRange.value);
  // mise à jour en direct
  gridScaleRange.addEventListener("input", (e) => {
    applyGridScale(e.target.value);
  });
}

// === NOUVEAU : contrôle de l'écart entre les cases ===
function applyGridGap(value) {
  const px = value + "px";   // 10 -> "10px", 40 -> "40px"
  document.documentElement.style.setProperty("--grid-gap", px);
  resizeCanvas();
}

if (gridGapRange) {
  // valeur initiale
  applyGridGap(gridGapRange.value);
  // mise à jour en direct
  gridGapRange.addEventListener("input", (e) => {
    applyGridGap(e.target.value);
  });
}


window.addEventListener("load", () => {
  loadDictionary();
  loadExpertLeaderboard();
  loadGlobalRanking();      // 👈 pour remplir direct le classement global
  updateChronoUI();         // 👈 pour sync l'état du bouton chrono au démarrage
});
