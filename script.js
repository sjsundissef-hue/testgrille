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

// Initialiser le joueur au chargement
import { initPlayer } from './player.js';

window.addEventListener("load", async () => {
  await initPlayer();
});
