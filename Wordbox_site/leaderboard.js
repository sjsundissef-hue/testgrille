// ==========================================
// === CLASSEMENT ET STATISTIQUES ===
// ==========================================

import { 
  SUPABASE_URL, 
  SUPABASE_KEY, 
  LEADERBOARD_TABLE, 
  SCORES_CHRONO_TABLE 
} from './config.js';
import { 
  currentGameId, 
  currentScore, 
  gridSize, 
  isChallengeActive, 
  challengeTimeLeft,
  isRankedEligible,
  hasOfferedScore,
  isExpertMode
} from './state.js';
import { 
  leaderboardList, 
  globalRankingList, 
  onlineScoreModal, 
  modalScoreMsg, 
  onlinePseudoInput,
  statsTabGlobal,
  statsTabPlayer,
  statsMyControls,
  statsModeFilters,
  statsMySummary,
  statsWordList,
  totalWordsVal,
  uniqueWordsVal
} from './dom.js';
import { showFeedback } from './ui.js';
// getCurrentMode sera importé depuis state.js via une fonction exportée

// ID joueur (doit être initialisé)
export let PLAYER_ID = localStorage.getItem("wb_player_id");
if (!PLAYER_ID) {
  if (window.crypto && window.crypto.randomUUID) {
    PLAYER_ID = window.crypto.randomUUID();
  } else {
    PLAYER_ID = "wb_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
  }
  localStorage.setItem("wb_player_id", PLAYER_ID);
}

// Modal leaderboard
export function openLeaderboardModal() {
  const modal = document.getElementById("leaderboardModal");
  if (modal) {
    modal.classList.add("active");
    loadLeaderboardIntoModal();
  }
}

export function closeLeaderboardModal() {
  const modal = document.getElementById("leaderboardModal");
  if (modal) {
    modal.classList.remove("active");
  }
}

function loadLeaderboardIntoModal() {
  const modalList = document.getElementById("leaderboardModalList");
  if (!modalList) return;
  
  modalList.innerHTML = '<li style="text-align:center; padding:20px; color:#aaa;">Chargement...</li>';
  
  fetch(`${SUPABASE_URL}/rest/v1/${LEADERBOARD_TABLE}?select=pseudo,score,created_at&order=score.desc&limit=30`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => {
      modalList.innerHTML = "";
      if (!data.length) {
        modalList.innerHTML = '<li style="text-align:center; padding:20px; color:#aaa;">Aucun score pour l\'instant.</li>';
        return;
      }
      data.forEach((row, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span class="lb-rank">#${index + 1}</span>
          <span class="lb-name">${row.pseudo || "Anonyme"}</span>
          <span class="lb-score">${row.score} pts</span>
        `;
        modalList.appendChild(li);
      });
    })
    .catch(() => {
      modalList.innerHTML = '<li style="text-align:center; color:#e74c3c;">Erreur chargement.</li>';
    });
  
  const globalModalList = document.getElementById("globalRankingModalList");
  if (!globalModalList) return;
  
  globalModalList.innerHTML = '<li style="text-align:center; padding:20px; color:#aaa;">Chargement...</li>';
  
  fetch(`${SUPABASE_URL}/rest/v1/global_ranking?select=pseudo,best_3x3,best_4x4,best_5x5,total_score&order=total_score.desc&limit=30`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => {
      globalModalList.innerHTML = "";
      if (!data.length) {
        globalModalList.innerHTML = '<li style="text-align:center; padding:20px; color:#aaa;">Aucun joueur classé.</li>';
        return;
      }
      data.forEach((row, index) => {
        const li = document.createElement("li");
        const best3 = row.best_3x3 ?? 0;
        const best4 = row.best_4x4 ?? 0;
        const best5 = row.best_5x5 ?? 0;
        li.innerHTML = `
          <span class="lb-rank">#${index + 1}</span>
          <span class="lb-name">${row.pseudo || "Anonyme"}</span>
          <span class="lb-score">${row.total_score} pts</span>
          <span style="margin-left:auto; font-size:0.85rem; color:#95a5a6;">${best3}/${best4}/${best5}</span>
        `;
        globalModalList.appendChild(li);
      });
    })
    .catch(() => {
      globalModalList.innerHTML = '<li style="text-align:center; color:#e74c3c;">Erreur chargement.</li>';
    });
}

// Listeners modal (à initialiser dans game.js)
document.addEventListener("DOMContentLoaded", function() {
  const leaderboardBtn = document.getElementById("leaderboardToggleBtn");
  if (leaderboardBtn) {
    leaderboardBtn.addEventListener("click", openLeaderboardModal);
  }
  
  const closeBtn = document.getElementById("closeLeaderboardModal");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeLeaderboardModal);
  }
  
  const modal = document.getElementById("leaderboardModal");
  if (modal) {
    modal.addEventListener("click", function(e) {
      if (e.target === modal) {
        closeLeaderboardModal();
      }
    });
  }
});

// Classement Expert
export async function loadExpertLeaderboard() {
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
      leaderboardList.innerHTML = '<li style="text-align:center; padding:10px; color:#aaa;">Aucun score pour l\'instant.</li>';
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
    leaderboardList.innerHTML = '<li style="text-align:center; color:#e74c3c;">Erreur chargement classement 3x3.</li>';
  }
}

// Classement Global
export async function loadGlobalRanking() {
  if (!globalRankingList) return;

  globalRankingList.innerHTML = '<li style="text-align:center; padding:10px; color:#aaa;">Chargement...</li>';

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
      globalRankingList.innerHTML = '<li style="text-align:center; padding:10px; color:#aaa;">Aucun joueur classé pour l\'instant.</li>';
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
    globalRankingList.innerHTML = '<li style="text-align:center; color:#e74c3c;">Impossible de charger le classement global.</li>';
  }
}

// Log des mots trouvés (getCurrentMode sera passé en paramètre ou importé)
export async function logWordFind(word, mode) {
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
  } catch (e) { 
    console.error("Log error", e); 
  }
}

// Stats
export function setStatsTab(tab) {
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

export async function loadGlobalStats() {
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

export async function loadPlayerStats(modeFilter) {
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

// Score Expert
export function maybeOfferExpertScore(getCurrentModeFn) {
  if (!isRankedEligible) return;
  if (hasOfferedScore) return;
  if (!onlineScoreModal) return;
  if (currentScore <= 0) return;

  hasOfferedScore = true;
  const mode = getCurrentModeFn();
  let label = "";
  if (isExpertMode) label = "Mode Expert 3x3";
  else if (mode === "4x4") label = "Mode 4x4 (chrono)";
  else if (mode === "5x5") label = "Mode 5x5 (chrono)";
  else label = "Partie chrono";

  modalScoreMsg.textContent = `Score : ${currentScore} pts – ${label}`;
  onlinePseudoInput.value = "";
  onlineScoreModal.style.display = "flex";
}

export async function sendExpertScore(getCurrentModeFn) {
  if (!onlineScoreModal) return;
  const pseudo = onlinePseudoInput.value.trim() || "Anonyme";
  const mode = getCurrentModeFn();
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

