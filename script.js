// ==========================================
// === POINT D'ENTRÉE PRINCIPAL ===
// ==========================================
// Ce fichier importe tous les modules et initialise le jeu

// Import de tous les modules
import './config.js';
import './state.js';
import './dom.js';
import './utils.js';
import './grid.js';
import './chrono.js';
import './ui.js';
import './player.js';
import './leaderboard.js';
import './game.js';

// Initialiser le joueur au chargement (ne bloque pas le reste)
import { initPlayer } from './player.js';

// Initialiser le joueur de manière non-bloquante
window.addEventListener("load", () => {
  // Ne pas bloquer l'initialisation du jeu
  initPlayer().catch(e => {
    console.error("Erreur initialisation joueur", e);
  });
});
