// ==========================================
// === FONCTIONS UTILITAIRES ===
// ==========================================

import { VOWELS, CONSONANTS, FREQUENCIES, cumulativeWeights, totalWeight } from './config.js';
import { state, DICTIONARY, PREFIXES } from './state.js';

// Génération de lettres
export function getLetterByType(type) {
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

export function getRandomLetter() {
  const r = Math.random() * totalWeight;
  for (const item of cumulativeWeights) {
    if (r <= item.max) return item.l;
  }
  return "E";
}

// Points des mots
export function getWordPoints(word) {
  const len = word.length;
  if (len < 4) return 0;
  if (len === 4) return 6;
  if (len === 5) return 8;
  if (len === 6) return 10;
  if (len === 7) return 12;
  return 14;
}

// Algorithme de recherche de tous les mots
export function findAllWords() {
  if (!state.dictionaryLoaded) return new Set();
  const results = new Set();
  const visited = Array.from({ length: state.gridSize }, () => Array(state.gridSize).fill(false));
  const dirs = [[-1, -1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  
  function dfs(r, c, currentStr) {
    currentStr += state.gridData[r][c];
    if (!PREFIXES.has(currentStr)) return;
    if (currentStr.length >= 4 && DICTIONARY.has(currentStr)) results.add(currentStr);
    if (currentStr.length > 10) return;
    visited[r][c] = true;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < state.gridSize && nc >= 0 && nc < state.gridSize && !visited[nr][nc]) {
        dfs(nr, nc, currentStr);
      }
    }
    visited[r][c] = false;
  }
  
  for (let r = 0; r < state.gridSize; r++) {
    for (let c = 0; c < state.gridSize; c++) {
      dfs(r, c, "");
    }
  }
  return results;
}

// Génération d'ID de partie
export function generateNewGameId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "game_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
}

// Détection mobile
export function isMobileDevice() {
  return window.matchMedia("(max-width: 700px)").matches;
}

// Mode actuel (nécessite l'état du jeu - sera importé dans game.js)

