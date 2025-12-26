// ==========================================
// === LOGIQUE PRINCIPALE DU JEU ===
// ==========================================

import { 
  CHRONO_DURATIONS, 
  DICT_URL, 
  FUN_COMBOS, 
  BODY_RANKED_RESULTS_CLASS 
} from './config.js';
import {
  gridSize, gridData, cachedSolutions, foundWords, gameSolved, solutionMode,
  isChronoGame, isRankedEligible, isExpertMode, isCustomGame, isFunMode,
  isChallengeActive, currentGameId, challengeModeName, currentChronoMode,
  currentFunIndex, shuffledFunCombos, isTimedModeEnabled, isEditing,
  currentScore, selectionPath, isDragging, dictionaryLoaded, DICTIONARY, PREFIXES,
  hasOfferedScore, challengeInterval, challengeTimeLeft
} from './state.js';
import {
  gridEl, wordDisplay, feedbackEl, listEl, scoreDisplayEl, scoreCompEl,
  listTitleEl, filterInput, newGridBtn, replayBtn, createGridBtn, funBtn,
  help2x2Btn, globalStatsBtn, solveBtn, validateCustomBtn, passBtn,
  backToHomeBtn, btn4x4, btn5x5, rankedToggleBtn, topExpertBtn,
  gridScaleRange, gridGapRange, helpModal, helpGridList, closeHelpBtn,
  statsModal, closeStatsBtn, statsTabGlobal, statsTabPlayer, statsModeFilters,
  statsMySummary, statsWordList, totalWordsVal, uniqueWordsVal, onlineScoreModal,
  modalScoreMsg, onlinePseudoInput, btnIgnoreScore, btnSendScore
} from './dom.js';
import { generateGridData, generateExpertGrid, loadFunGrid as loadFunGridData, renderGrid, resizeCanvas, setDragHandlers, setupDragListeners } from './grid.js';
import { stopTimer, startTimer, setEndChallengeCallback } from './chrono.js';
import { showFeedback, updateScoreDisplay, updateRankedUI, setHomeMode, setRankedModeUI, setRankedResultsMode } from './ui.js';
import { getWordPoints, findAllWords, generateNewGameId } from './utils.js';
import { logWordFind, maybeOfferExpertScore, sendExpertScore, loadExpertLeaderboard, loadGlobalRanking, setStatsTab, loadGlobalStats, loadPlayerStats, PLAYER_ID } from './leaderboard.js';

// Mode actuel
export function getCurrentMode() {
  if (isFunMode) return "fun2x2";
  if (isExpertMode) return "expert3x3";
  if (isCustomGame) return "custom";
  if (gridSize === 4) return "4x4";
  if (gridSize === 5) return "5x5";
  return "unknown";
}

// Reset état du jeu
export function resetGameState() {
  document.body.classList.remove(BODY_RANKED_RESULTS_CLASS);
  document.body.classList.remove("ranked-active");
  document.body.classList.remove("fun-mode-active");
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
  isChronoGame = false;
  isRankedEligible = false;
  currentChronoMode = null;
  updateRankedUI();

  if (wordDisplay) wordDisplay.textContent = "";
  if (feedbackEl) {
    feedbackEl.className = "feedback";
    feedbackEl.textContent = "";
  }
  gameSolved = false;
  if (filterInput) filterInput.value = "";
  if (listTitleEl) listTitleEl.textContent = "Score Actuel";
  if (scoreCompEl) scoreCompEl.textContent = "";
  updateScoreDisplay(currentScore);
  updateWordList();

  if (gridEl) gridEl.style.gridTemplateColumns = "repeat(" + gridSize + ", 1fr)";

  if (solveBtn) {
    solveBtn.textContent = "Voir solutions";
    solveBtn.disabled = false;
  }
}

// Chargement dictionnaire
export function loadDictionary() {
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

// Initialisation du jeu
export function initGame() {
  stopTimer();
  resetGameState();

  currentGameId = generateNewGameId();

  if (newGridBtn) newGridBtn.style.display = "block";
  if (replayBtn) replayBtn.style.display = "block";
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

  gridData = generateGridData(gridSize);

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
      challengeModeName = "ranked-" + modeName;
      setRankedModeUI(true);
    }
  }
  updateRankedUI();
}

// Rejouer
export function replayGrid() {
  if (isEditing) return;

  document.body.classList.remove(BODY_RANKED_RESULTS_CLASS);
  solutionMode = false;
  gameSolved = false;

  isChronoGame = false;
  isRankedEligible = false;
  currentChronoMode = null;
  isChallengeActive = false;
  
  const mainContainer = document.querySelector(".main-container");
  const gameArea = document.querySelector(".game-area");
  const scorePanel = document.querySelector(".score-panel");
  const gridWrapper = document.querySelector(".grid-wrapper");
  const rankedStack = document.querySelector(".ranked-stack");
  
  if (mainContainer && scorePanel && rankedStack && rankedStack.contains(scorePanel)) {
    mainContainer.appendChild(scorePanel);
  }
  
  if (gameArea && gridWrapper && rankedStack && rankedStack.contains(gridWrapper)) {
    gameArea.insertBefore(gridWrapper, gameArea.querySelector(".action-buttons"));
  }
  
  if (gridWrapper) {
    gridWrapper.style.transform = "";
    gridWrapper.style.marginBottom = "";
    gridWrapper.style.marginTop = "";
  }
  
  setHomeMode();
  updateRankedUI();

  foundWords.clear();
  cachedSolutions = null;
  currentScore = 0;
  selectionPath = [];
  if (wordDisplay) wordDisplay.textContent = "";
  if (filterInput) filterInput.value = "";
  if (listTitleEl) listTitleEl.textContent = "Score Actuel";
  if (scoreCompEl) scoreCompEl.textContent = "";
  updateScoreDisplay(currentScore);
  updateWordList();
  renderGrid();
  setTimeout(resizeCanvas, 50);
  showFeedback("Grille réinitialisée", "valid");
}

// Set Mode
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

// Modes de jeu
export function startExpertMode() {
  stopTimer();
  resetGameState();

  currentGameId = generateNewGameId();

  isExpertMode = true;
  isFunMode = false;
  isCustomGame = false;

  challengeModeName = "Expert 3x3";
  gridSize = 3;

  if (newGridBtn) newGridBtn.style.display = "none";
  if (replayBtn) replayBtn.style.display = "none";
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

  gridData = generateExpertGrid();

  cachedSolutions = findAllWords();
  renderGrid();
  setTimeout(resizeCanvas, 50);

  const duration = CHRONO_DURATIONS["expert3x3"] || 120;
  startTimer(duration);
  isChallengeActive = true;

  isChronoGame = true;
  isRankedEligible = true;
  currentChronoMode = "expert3x3";
  
  setRankedModeUI(true);

  updateWordList();
  if (feedbackEl) {
    feedbackEl.textContent = "Max de mots !";
    feedbackEl.className = "feedback visible valid";
  }
  updateRankedUI();
}

export function startFunMode() {
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
  
  document.body.classList.add("fun-mode-active");

  if (newGridBtn) newGridBtn.style.display = "none";
  if (replayBtn) replayBtn.style.display = "none";
  if (createGridBtn) createGridBtn.style.display = "none";
  if (funBtn) funBtn.style.display = "none";
  if (help2x2Btn) help2x2Btn.style.display = "block";
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
  updateRankedUI();
}

export function loadFunGrid() {
  if (currentFunIndex >= shuffledFunCombos.length) currentFunIndex = 0;
  const data = loadFunGridData(currentFunIndex, shuffledFunCombos);
  if (gridEl) gridEl.style.gridTemplateColumns = "repeat(2, 1fr)";
  gridData = data;
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

// Drag & Drop
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

function endDrag() {
  if (!isDragging) return;
  isDragging = false;
  validateWord();
  selectionPath = [];
  updateVisuals();
  clearCanvas();
}

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

function clearCanvas() {
  // Importé depuis grid.js mais utilisé ici aussi
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawPath() {
  clearCanvas();
}

// Validation
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
      updateScoreDisplay(currentScore);
      logWordFind(word, getCurrentMode());

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

// Liste des mots
export function updateWordList() {
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

// Solutions
export function finishAndShowSolutions() {
  if (isChallengeActive) {
    stopTimer();
    if (feedbackEl) {
      feedbackEl.textContent = "Partie terminée";
      feedbackEl.className = "feedback visible";
    }
  }

  if (!cachedSolutions || !cachedSolutions.size) {
    cachedSolutions = findAllWords();
  }
  
  console.log("Solutions calculées:", cachedSolutions ? cachedSolutions.size : 0, "mots");

  solutionMode = true;
  gameSolved = true;

  setRankedResultsMode();
  
  if (backToHomeBtn) {
    backToHomeBtn.style.display = "inline-block";
  }

  const scorePanel = document.querySelector(".score-panel");
  if (scorePanel) {
    scorePanel.style.display = "flex";
  }
  
  updateWordList();

  if (listEl) {
    listEl.scrollTop = 0;
    console.log("Nombre d'éléments dans la liste:", listEl.children.length);
  }

  if (listTitleEl) listTitleEl.textContent = "Résultats";

  maybeOfferExpertScore(getCurrentMode);
}

// Création manuelle
export function startManualCreation() {
  resetGameState();
  stopTimer();
  if (newGridBtn) newGridBtn.style.display = "none";
  if (replayBtn) replayBtn.style.display = "none";
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

export function validateGrid() {
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
  if (replayBtn) replayBtn.style.display = "block";
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

// Aide 2x2
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

// Configuration drag handlers
setDragHandlers({
  startDrag,
  onDragEnter,
  endDrag,
  addToPath,
  isDragging: () => isDragging
});
setupDragListeners();

// Configuration chrono callback
setEndChallengeCallback(() => maybeOfferExpertScore(getCurrentMode));

// Listeners
if (topExpertBtn) topExpertBtn.addEventListener("click", startExpertMode);
if (newGridBtn) newGridBtn.addEventListener("click", () => { initGame(); });
if (replayBtn) replayBtn.addEventListener("click", replayGrid);
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
    if (solutionMode) return;

    if (!dictionaryLoaded) {
      showFeedback("Dico pas encore chargé", "invalid");
      return;
    }

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

    finishAndShowSolutions();
  });
}

if (btnIgnoreScore) {
  btnIgnoreScore.addEventListener("click", () => { onlineScoreModal.style.display = "none"; });
}
if (btnSendScore) {
  btnSendScore.addEventListener("click", () => { sendExpertScore(getCurrentMode); });
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

if (rankedToggleBtn) {
  rankedToggleBtn.addEventListener("click", () => {
    isTimedModeEnabled = !isTimedModeEnabled;
    updateRankedUI();
    if (gridSize === 4 || gridSize === 5) initGame();
  });
}

// Sliders
function applyGridScale(value) {
  const scale = value / 100;
  document.documentElement.style.setProperty("--grid-scale", scale);

  const wordArea = document.querySelector(".word-display-area");
  if (wordArea) {
    const extra = Math.max(0, (scale - 1) * 60);
    wordArea.style.marginBottom = 12 + extra + "px";
  }

  resizeCanvas();
}

if (gridScaleRange) {
  applyGridScale(gridScaleRange.value);
  gridScaleRange.addEventListener("input", (e) => {
    applyGridScale(e.target.value);
  });
}

function applyGridGap(value) {
  const px = value + "px";
  document.documentElement.style.setProperty("--grid-gap", px);
  resizeCanvas();
}

if (gridGapRange) {
  applyGridGap(gridGapRange.value);
  gridGapRange.addEventListener("input", (e) => {
    applyGridGap(e.target.value);
  });
}

// Retour à l'accueil
if (backToHomeBtn) {
  backToHomeBtn.addEventListener("click", () => {
    if (isChallengeActive) {
      stopTimer();
    }
    
    isChronoGame = false;
    isRankedEligible = false;
    currentChronoMode = null;
    isChallengeActive = false;
    isTimedModeEnabled = false;
    
    const mainContainer = document.querySelector(".main-container");
    const gameArea = document.querySelector(".game-area");
    const scorePanel = document.querySelector(".score-panel");
    const gridWrapper = document.querySelector(".grid-wrapper");
    const rankedStack = document.querySelector(".ranked-stack");
    
    if (mainContainer && scorePanel && rankedStack && rankedStack.contains(scorePanel)) {
      mainContainer.appendChild(scorePanel);
    }
    
    if (gameArea && gridWrapper && rankedStack && rankedStack.contains(gridWrapper)) {
      gameArea.insertBefore(gridWrapper, gameArea.querySelector(".action-buttons"));
    }
    
    if (gridWrapper) {
      gridWrapper.style.transform = "";
      gridWrapper.style.marginBottom = "";
      gridWrapper.style.marginTop = "";
    }
    
    setHomeMode();
    updateRankedUI();
    
    resetGameState();
    
    initGame();
  });
}

// Aide
if (help2x2Btn) {
  help2x2Btn.addEventListener("click", () => {
    if (!helpModal) return;
    helpModal.style.display = "flex";
    generateHelpContent();
  });
}
if (closeHelpBtn) {
  closeHelpBtn.addEventListener("click", () => { if (helpModal) helpModal.style.display = "none"; });
}

// Initialisation
window.addEventListener("load", () => {
  setHomeMode();
  loadDictionary();
  loadExpertLeaderboard();
  loadGlobalRanking();
  updateRankedUI();
});

