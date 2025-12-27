// ==========================================
// === ÉTAT DU JEU ===
// ==========================================

import { DEFAULT_GRID } from './config.js';

// État de la grille
let _gridSize = DEFAULT_GRID;
let _gridData = [];
let _cachedSolutions = null;

// État du jeu
let _currentScore = 0;
let _selectionPath = [];
let _isDragging = false;
let _isEditing = false;
let _foundWords = new Set();
let _gameSolved = false;
let _solutionMode = false;

// Modes de jeu
let _isChronoGame = false;
let _isRankedEligible = false;
let _isExpertMode = false;
let _isCustomGame = false;
let _isFunMode = false;
let _isChallengeActive = false;
let _isTimedModeEnabled = false;

// Identifiants et modes
let _currentGameId = null;
let _challengeModeName = "";
let _currentChronoMode = null;
let _currentFunIndex = 0;
let _shuffledFunCombos = [];

// Timer
let _challengeInterval = null;
let _challengeTimeLeft = 0;

// Score et stats
let _hasOfferedScore = false;

// Dictionnaire
export const DICTIONARY = new Set();
export const PREFIXES = new Set();
let _dictionaryLoaded = false;

// Leaderboard
let _isLeaderboardOpen = false;

// Getters et Setters
export const state = {
  // Grille
  get gridSize() { return _gridSize; },
  set gridSize(v) { _gridSize = v; },
  get gridData() { return _gridData; },
  set gridData(v) { _gridData = v; },
  get cachedSolutions() { return _cachedSolutions; },
  set cachedSolutions(v) { _cachedSolutions = v; },
  
  // Jeu
  get currentScore() { return _currentScore; },
  set currentScore(v) { _currentScore = v; },
  get selectionPath() { return _selectionPath; },
  set selectionPath(v) { _selectionPath = v; },
  get isDragging() { return _isDragging; },
  set isDragging(v) { _isDragging = v; },
  get isEditing() { return _isEditing; },
  set isEditing(v) { _isEditing = v; },
  get foundWords() { return _foundWords; },
  set foundWords(v) { /* foundWords est un Set, utiliser clear() et add() */ },
  get gameSolved() { return _gameSolved; },
  set gameSolved(v) { _gameSolved = v; },
  get solutionMode() { return _solutionMode; },
  set solutionMode(v) { _solutionMode = v; },
  
  // Modes
  get isChronoGame() { return _isChronoGame; },
  set isChronoGame(v) { _isChronoGame = v; },
  get isRankedEligible() { return _isRankedEligible; },
  set isRankedEligible(v) { _isRankedEligible = v; },
  get isExpertMode() { return _isExpertMode; },
  set isExpertMode(v) { _isExpertMode = v; },
  get isCustomGame() { return _isCustomGame; },
  set isCustomGame(v) { _isCustomGame = v; },
  get isFunMode() { return _isFunMode; },
  set isFunMode(v) { _isFunMode = v; },
  get isChallengeActive() { return _isChallengeActive; },
  set isChallengeActive(v) { _isChallengeActive = v; },
  get isTimedModeEnabled() { return _isTimedModeEnabled; },
  set isTimedModeEnabled(v) { _isTimedModeEnabled = v; },
  
  // Identifiants
  get currentGameId() { return _currentGameId; },
  set currentGameId(v) { _currentGameId = v; },
  get challengeModeName() { return _challengeModeName; },
  set challengeModeName(v) { _challengeModeName = v; },
  get currentChronoMode() { return _currentChronoMode; },
  set currentChronoMode(v) { _currentChronoMode = v; },
  get currentFunIndex() { return _currentFunIndex; },
  set currentFunIndex(v) { _currentFunIndex = v; },
  get shuffledFunCombos() { return _shuffledFunCombos; },
  set shuffledFunCombos(v) { _shuffledFunCombos = v; },
  
  // Timer
  get challengeInterval() { return _challengeInterval; },
  set challengeInterval(v) { _challengeInterval = v; },
  get challengeTimeLeft() { return _challengeTimeLeft; },
  set challengeTimeLeft(v) { _challengeTimeLeft = v; },
  
  // Stats
  get hasOfferedScore() { return _hasOfferedScore; },
  set hasOfferedScore(v) { _hasOfferedScore = v; },
  
  // Dictionnaire
  get dictionaryLoaded() { return _dictionaryLoaded; },
  set dictionaryLoaded(v) { _dictionaryLoaded = v; },
  
  // Leaderboard
  get isLeaderboardOpen() { return _isLeaderboardOpen; },
  set isLeaderboardOpen(v) { _isLeaderboardOpen = v; }
};

// Export direct pour foundWords (Set mutable, peut être modifié directement)
export { _foundWords as foundWords };
