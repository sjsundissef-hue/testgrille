// ==========================================
// === CLASSEMENT ET STATISTIQUES ===
// ==========================================

import { 
  SUPABASE_URL, 
  SUPABASE_KEY, 
  LEADERBOARD_TABLE, 
  SCORES_CHRONO_TABLE 
} from './config.js';
import { state } from './state.js';
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

// ID joueur - maintenant géré par player.js
import { getPlayerId, isPlayerConnected, getCurrentPlayer } from './player.js';

export function getPLAYER_ID() {
  return getPlayerId();
}

// Pseudo sauvegardé
export function getSavedPseudo() {
  return localStorage.getItem("wb_pseudo") || null;
}

export function savePseudo(pseudo) {
  if (pseudo && pseudo.trim()) {
    localStorage.setItem("wb_pseudo", pseudo.trim());
  }
}

// Meilleur score sauvegardé par mode
export function getBestScore(mode, boardSize) {
  const key = `wb_best_${mode}_${boardSize || ''}`;
  const saved = localStorage.getItem(key);
  return saved ? parseInt(saved, 10) : 0;
}

export function saveBestScore(mode, boardSize, score) {
  const key = `wb_best_${mode}_${boardSize || ''}`;
  localStorage.setItem(key, score.toString());
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
        let itemClass = "";
        let rankIcon = "";
        
        // Top 3 styling
        if (index === 0) {
          itemClass = "leaderboard-top-1";
          rankIcon = "🥇 ";
        } else if (index === 1) {
          itemClass = "leaderboard-top-2";
          rankIcon = "🥈 ";
        } else if (index === 2) {
          itemClass = "leaderboard-top-3";
          rankIcon = "🥉 ";
        }
        
        li.className = itemClass;
        li.innerHTML = `
          <span class="lb-rank">${rankIcon}#${index + 1}</span>
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
        let itemClass = "";
        let rankIcon = "";
        
        // Top 3 styling
        if (index === 0) {
          itemClass = "leaderboard-top-1";
          rankIcon = "🥇 ";
        } else if (index === 1) {
          itemClass = "leaderboard-top-2";
          rankIcon = "🥈 ";
        } else if (index === 2) {
          itemClass = "leaderboard-top-3";
          rankIcon = "🥉 ";
        }
        
        const best3 = row.best_3x3 ?? 0;
        const best4 = row.best_4x4 ?? 0;
        const best5 = row.best_5x5 ?? 0;
        li.className = itemClass;
        li.innerHTML = `
          <span class="lb-rank">${rankIcon}#${index + 1}</span>
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
      let itemClass = "leaderboard-item";
      let rankIcon = "";
      
      // Top 3 styling
      if (index === 0) {
        itemClass += " leaderboard-top-1";
        rankIcon = "🥇 ";
      } else if (index === 1) {
        itemClass += " leaderboard-top-2";
        rankIcon = "🥈 ";
      } else if (index === 2) {
        itemClass += " leaderboard-top-3";
        rankIcon = "🥉 ";
      }
      
      li.className = itemClass;
      li.innerHTML = `
        <span class="lb-rank">${rankIcon}#${index + 1}</span>
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
      let itemClass = "leaderboard-item";
      let rankIcon = "";
      
      // Top 3 styling
      if (index === 0) {
        itemClass += " leaderboard-top-1";
        rankIcon = "🥇 ";
      } else if (index === 1) {
        itemClass += " leaderboard-top-2";
        rankIcon = "🥈 ";
      } else if (index === 2) {
        itemClass += " leaderboard-top-3";
        rankIcon = "🥉 ";
      }

      const best3 = row.best_3x3 ?? 0;
      const best4 = row.best_4x4 ?? 0;
      const best5 = row.best_5x5 ?? 0;

      li.className = itemClass;
      li.innerHTML = `
        <span class="lb-rank">${rankIcon}#${index + 1}</span>
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

// Log des mots trouvés
// IMPORTANT: Les mots 3x3 sont enregistrés UNIQUEMENT pour "Mes Stats 3x3", jamais dans la Collection Globale
export async function logWordFind(word, mode) {
  const playerId = getPLAYER_ID();
  if (!playerId) {
    // Pas de joueur connecté, ne pas enregistrer
    return;
  }
  
  try {
    // Déterminer si c'est du 3x3 (expert3x3 ou mode 3x3)
    const is3x3 = mode === "expert3x3" || mode === "3x3" || (state.isExpertMode && state.gridSize === 3);
    
    // Toujours enregistrer dans word_finds pour les stats joueur (y compris 3x3)
    // Le mode est enregistré tel quel, et la collection globale filtre côté client
    const wordData = {
      word: word, 
      length: word.length, 
      board_size: state.gridSize, 
      mode: mode, // Le mode est enregistré (expert3x3, 4x4, 5x5, etc.)
      player_id: playerId,
      game_id: state.currentGameId, 
      is_challenge: state.isChallengeActive, 
      time_left: state.challengeTimeLeft, 
      score_after: state.currentScore
    };
    
    await fetch(`${SUPABASE_URL}/rest/v1/word_finds`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(wordData)
    });
    
    // Note: La collection globale est filtrée côté client dans loadGlobalStats
    // pour exclure tous les mots avec mode="expert3x3" ou mode="3x3"
  } catch (e) { 
    console.error("Log error", e); 
  }
}

// Stats
export function setStatsTab(tab) {
  if (!statsTabGlobal || !statsTabPlayer || !statsMyControls) {
    // Vérifier si le joueur est connecté avant de charger
    if (!isPlayerConnected()) {
      if (statsWordList) {
        statsWordList.innerHTML = '<li style="text-align:center; padding:20px; color:#e74c3c; font-weight:600;">Créez un compte ou connectez-vous pour accéder à vos statistiques.</li>';
      }
      if (totalWordsVal) totalWordsVal.textContent = "-";
      if (uniqueWordsVal) uniqueWordsVal.textContent = "-";
      return;
    }
    loadGlobalStats();
    return;
  }
  if (tab === "player") {
    // Vérifier si le joueur est connecté avant de charger
    if (!isPlayerConnected()) {
      if (statsMySummary) {
        statsMySummary.innerHTML = '<div style="text-align:center; padding:20px; color:#e74c3c; font-weight:600;">Créez un compte ou connectez-vous pour accéder à vos statistiques.</div>';
      }
      if (statsWordList) statsWordList.innerHTML = "";
      return;
    }
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
    // Récupérer TOUS les mots trouvés
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/word_finds?select=word,mode,board_size&order=word.asc`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    if (!response.ok) throw new Error("Erreur stats global");
    const allData = await response.json();
    
    // Filtrer pour exclure TOUS les modes 3x3 (expert3x3, 3x3, et board_size=3 avec mode expert)
    // La Collection Globale ne contient QUE les modes 4x4 et 5x5
    const filteredData = allData.filter(item => {
      // Exclure explicitement :
      // - mode === "expert3x3"
      // - mode === "3x3"
      // - board_size === 3 (tous les 3x3, peu importe le mode)
      return item.mode !== "expert3x3" && 
             item.mode !== "3x3" && 
             item.board_size !== 3;
    });
    
    // Agrégation côté client (uniquement 4x4 et 5x5)
    const wordCounts = {};
    filteredData.forEach(item => {
      if (!wordCounts[item.word]) {
        wordCounts[item.word] = 0;
      }
      wordCounts[item.word]++;
    });
    
    // Convertir en tableau et trier
    const sortedWords = Object.entries(wordCounts)
      .map(([word, count]) => ({ word, total_finds: count }))
      .sort((a, b) => b.total_finds - a.total_finds)
      .slice(0, 20);
    
    statsWordList.innerHTML = "";
    if (sortedWords.length === 0) {
      statsWordList.innerHTML = '<li style="text-align:center; padding:10px;">Aucune donnée (Collection Globale = 4x4 + 5x5 uniquement).</li>';
    } else {
      sortedWords.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "leaderboard-item";
        li.innerHTML = `<span class="lb-rank">#${index + 1}</span><span class="lb-name">${item.word}</span><span class="lb-score" style="color:#2c3e50;">${item.total_finds} fois</span>`;
        statsWordList.appendChild(li);
      });
    }
    
    // Compter le total (uniquement 4x4 et 5x5)
    if (totalWordsVal) {
      totalWordsVal.textContent = filteredData.length.toString();
    }
    
    // Compter les mots uniques (uniquement 4x4 et 5x5)
    const uniqueWords = new Set(filteredData.map(item => item.word));
    if (uniqueWordsVal) {
      uniqueWordsVal.textContent = uniqueWords.size.toString();
    }
  } catch (e) {
    console.error(e);
    statsWordList.innerHTML = '<li style="text-align:center; color:#e74c3c;">Erreur chargement stats.</li>';
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
    const playerId = getPLAYER_ID();
    if (!playerId) return;
    let url = `${SUPABASE_URL}/rest/v1/word_stats_player?select=player_id,mode,board_size,word,total_finds&player_id=eq.${playerId}`;
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

// Score Expert - Enregistrement automatique amélioré
// NOUVELLE LOGIQUE : Vérifie la connexion joueur + enregistre seulement les records

export async function maybeOfferExpertScore(getCurrentModeFn) {
  if (!state.isRankedEligible) return;
  if (state.hasOfferedScore) return;
  if (state.currentScore <= 0) return;

  state.hasOfferedScore = true;
  const mode = getCurrentModeFn();
  const boardSize = state.gridSize;
  const currentScore = state.currentScore;
  
  // Vérifier si un joueur est connecté
  if (!isPlayerConnected()) {
    showFeedback("❗ Score non enregistré : tu n'as pas de profil joueur", "invalid");
    return;
  }
  
  // Vérifier si c'est un nouveau record
  const bestScore = getBestScore(mode, boardSize);
  const isNewRecord = currentScore > bestScore;
  
  const player = getCurrentPlayer();
  const pseudo = player ? player.pseudo : "Anonyme";
  
  if (isNewRecord) {
    // Nouveau record → enregistrer
    const success = await sendExpertScoreAutomatically(getCurrentModeFn, pseudo);
    if (success) {
      saveBestScore(mode, boardSize, currentScore);
      showFeedback(`✔️ Bravo, nouveau record enregistré ! ${currentScore} pts`, "valid");
    } else {
      showFeedback("❌ Erreur lors de l'enregistrement du score", "invalid");
    }
  } else {
    // Pas de record → ne pas enregistrer
    showFeedback(`Partie terminée – score non enregistré car inférieur à ton record (${bestScore} pts).`, "invalid");
  }
}

// Fonction pour enregistrer automatiquement (sans modal)
async function sendExpertScoreAutomatically(getCurrentModeFn, pseudo) {
  const playerId = getPLAYER_ID();
  if (!playerId) {
    console.error("Aucun player_id disponible");
    return false;
  }
  
  const mode = getCurrentModeFn();
  const boardSize = state.gridSize;
  const score = state.currentScore;
  const createdAt = new Date().toISOString();

  try {
    // Toujours enregistrer dans scores_chrono
    await fetch(`${SUPABASE_URL}/rest/v1/${SCORES_CHRONO_TABLE}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ player_id: playerId, pseudo, mode, board_size: boardSize, score: score, created_at: createdAt })
    });

    // Si mode Expert, enregistrer aussi dans le leaderboard 3x3
    // LOGIQUE : On ne garde que le MEILLEUR score (record) pour chaque joueur
    if (state.isExpertMode) {
      // 1. Vérifier si le joueur a déjà un score enregistré
      let existingScore = 0;
      try {
        const existingRes = await fetch(
          `${SUPABASE_URL}/rest/v1/${LEADERBOARD_TABLE}?select=score&player_id=eq.${playerId}&limit=1`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        );
        
        if (existingRes.ok) {
          const existingData = await existingRes.json();
          existingScore = existingData.length > 0 ? (existingData[0].score || 0) : 0;
        }
      } catch (e) {
        console.error("Erreur vérification score existant", e);
      }
      
      // 2. Si le nouveau score est meilleur OU si aucun score n'existe, on enregistre
      if (score > existingScore || existingScore === 0) {
        if (existingScore > 0) {
          // Mettre à jour le score existant avec PATCH
          const updateRes = await fetch(
            `${SUPABASE_URL}/rest/v1/${LEADERBOARD_TABLE}?player_id=eq.${playerId}`,
            {
              method: "PATCH",
              headers: { 
                apikey: SUPABASE_KEY, 
                Authorization: `Bearer ${SUPABASE_KEY}`, 
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
              },
              body: JSON.stringify({ 
                pseudo, 
                score: score, 
                created_at: createdAt 
              })
            }
          );
          if (!updateRes.ok) {
            console.error("Erreur PATCH, tentative POST", updateRes);
            // Si PATCH échoue, essayer POST (création)
            const createRes = await fetch(`${SUPABASE_URL}/rest/v1/${LEADERBOARD_TABLE}`, {
              method: "POST",
              headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
              body: JSON.stringify({ player_id: playerId, pseudo, score: score, created_at: createdAt })
            });
            if (!createRes.ok) throw new Error("Erreur création score leaderboard 3x3");
          }
        } else {
          // 3. Si aucun score n'existe, on crée le premier
          const createRes = await fetch(`${SUPABASE_URL}/rest/v1/${LEADERBOARD_TABLE}`, {
            method: "POST",
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
            body: JSON.stringify({ player_id: playerId, pseudo, score: score, created_at: createdAt })
          });
          if (!createRes.ok) throw new Error("Erreur création score leaderboard 3x3");
        }
      }
      // Si le score n'est pas meilleur, on ne fait rien (on garde l'ancien)
    }
    
    // Sauvegarder le pseudo pour la prochaine fois
    savePseudo(pseudo);
    
    // Mettre à jour le meilleur score
    saveBestScore(mode, boardSize, score);
    
    return true;
  } catch (e) {
    console.error("Erreur enregistrement automatique", e);
    return false;
  }
}

export async function sendExpertScore(getCurrentModeFn) {
  if (!onlineScoreModal) return;
  const pseudo = onlinePseudoInput.value.trim() || "Anonyme";
  
  // Sauvegarder le pseudo IMMÉDIATEMENT pour les prochaines fois
  if (pseudo && pseudo !== "Anonyme") {
    savePseudo(pseudo);
  }
  
  // Enregistrer le score avec le nouveau pseudo
  const success = await sendExpertScoreAutomatically(getCurrentModeFn, pseudo);
  
  if (success) {
    const mode = getCurrentModeFn();
    const boardSize = state.gridSize;
    const score = state.currentScore;
    
    // Mettre à jour le meilleur score
    const bestScore = getBestScore(mode, boardSize);
    if (score > bestScore) {
      saveBestScore(mode, boardSize, score);
    }
    
    onlineScoreModal.style.display = "none";
    showFeedback("Pseudo sauvegardé ! Les prochains scores seront enregistrés automatiquement.", "valid");
    if (state.isExpertMode) loadExpertLeaderboard();
  } else {
    showFeedback("Erreur lors de l'envoi du score", "invalid");
  }
}

