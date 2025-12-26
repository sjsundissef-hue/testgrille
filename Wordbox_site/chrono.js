// ==========================================
// === GESTION DU TIMER ET MODE RANKED ===
// ==========================================

import { timerDisplay, solveBtn } from './dom.js';
import { challengeInterval, challengeTimeLeft, isChallengeActive, gameSolved } from './state.js';
import { showFeedback } from './ui.js';
// maybeOfferExpertScore sera passé en paramètre pour éviter dépendance circulaire

// Timer
export function stopTimer() {
  if (challengeInterval) clearInterval(challengeInterval);
  if (timerDisplay) {
    timerDisplay.style.display = "none";
    timerDisplay.classList.remove("low-time");
  }
  isChallengeActive = false;
}

export function updateTimerDisplay() {
  let min = Math.floor(challengeTimeLeft / 60);
  let sec = challengeTimeLeft % 60;
  if (timerDisplay) {
    timerDisplay.textContent = (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
    if (challengeTimeLeft <= 10) timerDisplay.classList.add("low-time");
    else timerDisplay.classList.remove("low-time");
  }
}

export function startTimer(seconds) {
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

let _maybeOfferExpertScore = null;

export function setEndChallengeCallback(callback) {
  _maybeOfferExpertScore = callback;
}

function endChallenge() {
  stopTimer();
  gameSolved = true;
  if (solveBtn) solveBtn.disabled = false;
  showFeedback("Temps écoulé", "invalid");
  if (_maybeOfferExpertScore) _maybeOfferExpertScore();
}

