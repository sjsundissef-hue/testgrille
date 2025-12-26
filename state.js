// ==========================================
// === ÉTAT DU JEU ===
// ==========================================

import { DEFAULT_GRID } from './config.js';

// État de la grille
export let gridSize = DEFAULT_GRID;
export let gridData = [];
export let cachedSolutions = null;

// État du jeu
export let currentScore = 0;
export let selectionPath = [];
export let isDragging = false;
export let isEditing = false;
export let foundWords = new Set();
export let gameSolved = false;
export let solutionMode = false;

// Modes de jeu
export let isChronoGame = false;
export let isRankedEligible = false;
export let isExpertMode = false;
export let isCustomGame = false;
export let isFunMode = false;
export let isChallengeActive = false;
export let isTimedModeEnabled = false;

// Identifiants et modes
export let currentGameId = null;
export let challengeModeName = "";
export let currentChronoMode = null;
export let currentFunIndex = 0;
export let shuffledFunCombos = [];

// Timer
export let challengeInterval = null;
export let challengeTimeLeft = 0;

// Score et stats
export let hasOfferedScore = false;

// Dictionnaire
export const DICTIONARY = new Set();
export const PREFIXES = new Set();
export let dictionaryLoaded = false;

// Leaderboard
export let isLeaderboardOpen = false;

