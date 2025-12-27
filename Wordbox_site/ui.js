// ==========================================
// === GESTION DE L'INTERFACE UTILISATEUR ===
// ==========================================

import { 
  BODY_HOME_CLASS, 
  BODY_RANKED_CLASS, 
  BODY_RANKED_RESULTS_CLASS 
} from './config.js';
import { 
  solveBtn, 
  backToHomeBtn, 
  feedbackEl, 
  scoreDisplayEl,
  rankedToggleBtn,
  rankedModeBadge
} from './dom.js';
import { state } from './state.js';

// Feedback
export function showFeedback(text, type) {
  if (!feedbackEl) return;
  feedbackEl.textContent = text;
  feedbackEl.className = "feedback visible " + type;
  setTimeout(() => {
    if (feedbackEl.textContent === text) feedbackEl.className = "feedback";
  }, 3000);
}

// Score (currentScore passé en paramètre)
export function updateScoreDisplay(currentScore) {
  if (!scoreDisplayEl) return;
  scoreDisplayEl.textContent = currentScore + " pts";
}

// UI Ranked
export function updateRankedUI() {
  const isTimedEnabled = state.isTimedModeEnabled;
  if (rankedToggleBtn) {
    rankedToggleBtn.classList.toggle("ranked-active", isTimedEnabled);
    rankedToggleBtn.classList.toggle("ranked-off", !isTimedEnabled);
    rankedToggleBtn.textContent = isTimedEnabled ? "Mode ranked : ON" : "Mode ranked : OFF";
  }
  if (rankedModeBadge) {
    const isChrono = state.isChronoGame;
    const isExpert = state.isExpertMode;
    const size = state.gridSize;
    const shouldShow = isChrono && (isExpert || (!isExpert && (size === 4 || size === 5)));
    rankedModeBadge.style.display = shouldShow ? "inline-block" : "none";
    if (shouldShow) rankedModeBadge.textContent = "Partie ranked";
  }
}

// États UI
export function setHomeMode() {
  const body = document.body;
  body.classList.remove(BODY_RANKED_CLASS);
  body.classList.remove(BODY_RANKED_RESULTS_CLASS);
  body.classList.add(BODY_HOME_CLASS);
  
  if (solveBtn) {
    solveBtn.textContent = "Voir solutions";
  }
  
  if (backToHomeBtn) {
    backToHomeBtn.style.display = "none";
  }
  
  // Remettre le score-panel à sa place normale si nécessaire
  const mainContainer = document.querySelector(".main-container");
  const scorePanel = document.querySelector(".score-panel");
  const rankedStack = document.querySelector(".ranked-stack");
  if (mainContainer && scorePanel && rankedStack && rankedStack.contains(scorePanel)) {
    mainContainer.appendChild(scorePanel);
  }
}

export function setRankedModeUI(active) {
  const body = document.body;
  if (active) {
    body.classList.add(BODY_RANKED_CLASS);
    body.classList.remove(BODY_RANKED_RESULTS_CLASS);
    body.classList.remove(BODY_HOME_CLASS);
    if (solveBtn) {
      solveBtn.textContent = "Voir Résultats";
    }
  } else {
    setHomeMode();
  }
}

export function setRankedResultsMode() {
  const body = document.body;
  body.classList.remove(BODY_RANKED_CLASS);
  body.classList.add(BODY_RANKED_RESULTS_CLASS);
  body.classList.remove(BODY_HOME_CLASS);
  
  if (backToHomeBtn) {
    backToHomeBtn.style.display = "inline-block";
  }
  
  // Déplacer la grille et le score-panel dans ranked-stack
  const rankedStack = document.querySelector(".ranked-stack");
  const gridWrapper = document.querySelector(".grid-wrapper");
  const scorePanel = document.querySelector(".main-container > .score-panel") || 
                     document.querySelector(".ranked-stack .score-panel") ||
                     document.querySelector(".score-panel");
  
  if (rankedStack) {
    if (gridWrapper && !rankedStack.contains(gridWrapper)) {
      rankedStack.insertBefore(gridWrapper, rankedStack.firstChild);
    }
    if (scorePanel && !rankedStack.contains(scorePanel)) {
      rankedStack.appendChild(scorePanel);
    }
  }
}

