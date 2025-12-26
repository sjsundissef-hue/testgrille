// ==========================================
// === GESTION DES PROFILS JOUEURS ===
// ==========================================

import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

// Table Supabase
const PLAYERS_TABLE = "players";

// État du joueur
let currentPlayer = null; // { id, player_id, pseudo, pin_code }

// Initialisation au chargement
export async function initPlayer() {
  try {
    const storedPlayerId = localStorage.getItem("wb_player_id");
    
    if (storedPlayerId) {
      // Chercher le joueur dans Supabase
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/${PLAYERS_TABLE}?player_id=eq.${storedPlayerId}&limit=1`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            // Joueur trouvé → connecté
            currentPlayer = data[0];
            // Mettre à jour l'UI (la fonction gère elle-même l'attente du DOM)
            updatePlayerUI();
            return true;
          } else {
            // player_id existe en localStorage mais pas dans Supabase → compte invalide, déconnecter
            console.log("Joueur non trouvé dans Supabase, déconnexion...");
            localStorage.removeItem("wb_player_id");
            currentPlayer = null;
            updatePlayerUI();
            return false;
          }
        }
      } catch (e) {
        console.error("Erreur vérification joueur", e);
      }
    }
    
    // Pas de joueur connecté
    currentPlayer = null;
    // Mettre à jour l'UI (la fonction gère elle-même l'attente du DOM)
    updatePlayerUI();
    return false;
  } catch (e) {
    console.error("Erreur initPlayer", e);
    currentPlayer = null;
    return false;
  }
}

// Créer un profil joueur
export async function createPlayer(pseudo) {
  if (!pseudo || !pseudo.trim()) {
    throw new Error("Le pseudo est requis");
  }
  
  // Générer player_id
  let playerId;
  if (window.crypto && window.crypto.randomUUID) {
    playerId = window.crypto.randomUUID();
  } else {
    playerId = "wb_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
  }
  
  // Générer pin_code (4 chiffres entre 0000 et 9999)
  const pinCode = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${PLAYERS_TABLE}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        player_id: playerId,
        pseudo: pseudo.trim(),
        pin_code: pinCode
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur création profil");
    }
    
    const data = await response.json();
    const newPlayer = Array.isArray(data) ? data[0] : data;
    
    // Stocker et connecter
    localStorage.setItem("wb_player_id", newPlayer.player_id);
    currentPlayer = newPlayer;
    // Mettre à jour l'UI (la fonction gère elle-même l'attente du DOM)
    updatePlayerUI();
    
    return {
      success: true,
      player: newPlayer,
      message: `✔️ Profil créé\nPseudo : ${newPlayer.pseudo}\nCode : ${newPlayer.pin_code}\nGarde bien ce code, il te permet de te reconnecter`
    };
  } catch (e) {
    console.error("Erreur création profil", e);
    throw new Error("Erreur lors de la création du profil");
  }
}

// Recréer un profil à partir d'un player_id stocké
async function createPlayerFromStoredId(playerId) {
  try {
    // Générer un pseudo par défaut et un code
    const defaultPseudo = "Joueur_" + playerId.slice(0, 8);
    const pinCode = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${PLAYERS_TABLE}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        player_id: playerId,
        pseudo: defaultPseudo,
        pin_code: pinCode
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      currentPlayer = Array.isArray(data) ? data[0] : data;
      updatePlayerUI();
      return true;
    }
  } catch (e) {
    console.error("Erreur recréation profil", e);
  }
  return false;
}

// Se connecter à un profil existant
export async function connectPlayer(pseudo, pinCode) {
  if (!pseudo || !pseudo.trim()) {
    throw new Error("Le pseudo est requis");
  }
  
  if (!pinCode || pinCode.length !== 4) {
    throw new Error("Le code doit contenir 4 chiffres");
  }
  
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${PLAYERS_TABLE}?pseudo=eq.${encodeURIComponent(pseudo.trim())}&pin_code=eq.${pinCode}&limit=1`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    
    if (!response.ok) {
      throw new Error("Erreur de connexion");
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      throw new Error("❌ Pseudo ou code incorrect");
    }
    
    // Joueur trouvé → connecter
    const player = data[0];
    localStorage.setItem("wb_player_id", player.player_id);
    currentPlayer = player;
    updatePlayerUI();
    
    return {
      success: true,
      player: player
    };
  } catch (e) {
    console.error("Erreur connexion", e);
    throw e;
  }
}

// Se déconnecter
export function disconnectPlayer() {
  localStorage.removeItem("wb_player_id");
  currentPlayer = null;
  updatePlayerUI();
}

// Obtenir le joueur actuel
export function getCurrentPlayer() {
  return currentPlayer;
}

// Vérifier si un joueur est connecté
export function isPlayerConnected() {
  return currentPlayer !== null;
}

// Obtenir le player_id pour les scores
export function getPlayerId() {
  return currentPlayer ? currentPlayer.player_id : null;
}

// Mettre à jour l'interface joueur
function updatePlayerUI() {
  // Vérifier que le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", updatePlayerUI);
    return;
  }
  
  const playerStatusEl = document.getElementById("playerStatus");
  const playerInfoEl = document.getElementById("playerInfo");
  const playerActionsEl = document.getElementById("playerActions");
  
  if (!playerStatusEl || !playerInfoEl || !playerActionsEl) {
    // Retry après un court délai si les éléments ne sont pas encore disponibles
    setTimeout(updatePlayerUI, 100);
    return;
  }
  
  if (currentPlayer) {
    // Joueur connecté
    playerStatusEl.textContent = "🟢 Connecté";
    playerStatusEl.className = "player-status connected";
    playerInfoEl.innerHTML = `
      <div class="player-details">
        <div><strong>Pseudo :</strong> ${currentPlayer.pseudo}</div>
        <div><strong>Code :</strong> ${currentPlayer.pin_code}</div>
      </div>
    `;
    playerInfoEl.style.display = "block";
    playerActionsEl.innerHTML = '<button id="disconnectBtn" class="btn-disconnect">Se déconnecter</button>';
    
    // Event listener pour déconnexion
    const disconnectBtn = document.getElementById("disconnectBtn");
    if (disconnectBtn) {
      disconnectBtn.addEventListener("click", disconnectPlayer);
    }
  } else {
    // Joueur non connecté
    playerStatusEl.textContent = "🔴 Non connecté";
    playerStatusEl.className = "player-status disconnected";
    playerInfoEl.innerHTML = `
      <div class="player-warning">
        <strong>❗ Tu n'es pas connecté à un profil joueur</strong><br>
        Tes scores Ranked ne seront pas enregistrés.
      </div>
    `;
    playerInfoEl.style.display = "block";
    playerActionsEl.innerHTML = `
      <button id="createOrConnectBtn" class="btn-create-connect">Créer un compte / Se connecter</button>
    `;
    
    // Event listener pour le bouton unique
    const createOrConnectBtn = document.getElementById("createOrConnectBtn");
    if (createOrConnectBtn) {
      createOrConnectBtn.addEventListener("click", () => {
        // Ouvrir le modal de création par défaut
        // L'utilisateur pourra basculer vers la connexion depuis le modal
        openCreateProfileModal();
      });
    }
  }
}

// Modals
function openCreateProfileModal() {
  const modal = document.getElementById("createProfileModal");
  if (!modal) return;
  
  const pseudoInput = document.getElementById("createPseudoInput");
  if (pseudoInput) pseudoInput.value = "";
  
  modal.style.display = "flex";
}

function closeCreateProfileModal() {
  const modal = document.getElementById("createProfileModal");
  if (modal) modal.style.display = "none";
}

function openConnectProfileModal() {
  const modal = document.getElementById("connectProfileModal");
  if (!modal) return;
  
  const pseudoInput = document.getElementById("connectPseudoInput");
  const codeInput = document.getElementById("connectCodeInput");
  if (pseudoInput) pseudoInput.value = "";
  if (codeInput) codeInput.value = "";
  
  modal.style.display = "flex";
}

function closeConnectProfileModal() {
  const modal = document.getElementById("connectProfileModal");
  if (modal) modal.style.display = "none";
}

// Event listeners pour les modals
function setupPlayerEventListeners() {
  const createModal = document.getElementById("createProfileModal");
  const connectModal = document.getElementById("connectProfileModal");
  
  // Boutons de fermeture
  const closeCreateBtn = document.getElementById("closeCreateProfileModal");
  const closeConnectBtn = document.getElementById("closeConnectProfileModal");
  
  if (closeCreateBtn) {
    closeCreateBtn.addEventListener("click", closeCreateProfileModal);
  }
  if (closeConnectBtn) {
    closeConnectBtn.addEventListener("click", closeConnectProfileModal);
  }
  
  // Fermer en cliquant en dehors
  if (createModal) {
    createModal.addEventListener("click", (e) => {
      if (e.target === createModal) closeCreateProfileModal();
    });
  }
  if (connectModal) {
    connectModal.addEventListener("click", (e) => {
      if (e.target === connectModal) closeConnectProfileModal();
    });
  }
  
  // Soumission création
  const createForm = document.getElementById("createProfileForm");
  if (createForm) {
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const pseudoInput = document.getElementById("createPseudoInput");
      const messageEl = document.getElementById("createProfileMessage");
      
      if (!pseudoInput) return;
      
      const pseudo = pseudoInput.value.trim();
      if (!pseudo) {
        if (messageEl) messageEl.textContent = "❌ Le pseudo est requis";
        return;
      }
      
      try {
        const result = await createPlayer(pseudo);
        if (result.success) {
          if (messageEl) messageEl.textContent = result.message;
          setTimeout(() => {
            closeCreateProfileModal();
            if (messageEl) messageEl.textContent = "";
          }, 3000);
        }
      } catch (error) {
        if (messageEl) messageEl.textContent = error.message || "Erreur lors de la création";
      }
    });
  }
  
  // Soumission connexion
  const connectForm = document.getElementById("connectProfileForm");
  if (connectForm) {
    connectForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const pseudoInput = document.getElementById("connectPseudoInput");
      const codeInput = document.getElementById("connectCodeInput");
      const messageEl = document.getElementById("connectProfileMessage");
      
      if (!pseudoInput || !codeInput) return;
      
      const pseudo = pseudoInput.value.trim();
      const code = codeInput.value.trim();
      
      if (!pseudo) {
        if (messageEl) messageEl.textContent = "❌ Le pseudo est requis";
        return;
      }
      if (!code || code.length !== 4) {
        if (messageEl) messageEl.textContent = "❌ Le code doit contenir 4 chiffres";
        return;
      }
      
      try {
        const result = await connectPlayer(pseudo, code);
        if (result.success) {
          if (messageEl) messageEl.textContent = "✔️ Connexion réussie !";
          setTimeout(() => {
            closeConnectProfileModal();
            if (messageEl) messageEl.textContent = "";
          }, 1500);
        }
      } catch (error) {
        if (messageEl) messageEl.textContent = error.message || "❌ Erreur de connexion";
      }
    });
  }
}

// Initialiser les event listeners quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", setupPlayerEventListeners);
} else {
  // DOM déjà chargé
  setupPlayerEventListeners();
}

// Exporter les fonctions de modals pour utilisation externe
export { openCreateProfileModal, openConnectProfileModal };

