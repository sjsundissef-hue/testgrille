// ==========================================
// === RÉFÉRENCES AUX ÉLÉMENTS DOM ===
// ==========================================

// Grille et canvas
export const gridEl = document.getElementById("grid");
export const canvas = document.getElementById("lineCanvas");
export const ctx = canvas ? canvas.getContext("2d") : null;
export const bgCanvas = document.getElementById("bgCanvas");
export const ctxBg = bgCanvas ? bgCanvas.getContext("2d") : null;
export const gridScaleRange = document.getElementById("gridScaleRange");
export const gridGapRange = document.getElementById("gridGapRange");

// Affichage
export const wordDisplay = document.getElementById("currentWord");
export const feedbackEl = document.getElementById("feedbackMsg");
export const listEl = document.getElementById("wordList");
export const scoreDisplayEl = document.getElementById("scoreDisplay");
export const scoreCompEl = document.getElementById("scoreComparison");
export const listTitleEl = document.getElementById("listTitle");
export const filterInput = document.getElementById("filterInput");
export const timerDisplay = document.getElementById("timerDisplay");
export const historyList = document.getElementById("historyList");
export const leaderboardList = document.getElementById("leaderboardList");
export const globalRankingList = document.getElementById("globalRankingList");

// Boutons principaux
export const newGridBtn = document.getElementById("newGridBtn");
export const replayBtn = document.getElementById("replayBtn");
export const createGridBtn = document.getElementById("createGridBtn");
export const funBtn = document.getElementById("funBtn");
export const topExpertBtn = document.getElementById("topExpertBtn");
export const help2x2Btn = document.getElementById("help2x2Btn");
export const globalStatsBtn = document.getElementById("globalStatsBtn") || document.getElementById("statsBtn");
export const validateCustomBtn = document.getElementById("validateCustomBtn");
export const passBtn = document.getElementById("passBtn");
export const solveBtn = document.getElementById("solveBtn");
export const backToHomeBtn = document.getElementById("backToHomeBtn");
export const btn4x4 = document.getElementById("btn4x4");
export const btn5x5 = document.getElementById("btn5x5");
export const rankedToggleBtn = document.getElementById("rankedToggleBtn");
export const rankedModeBadge = document.getElementById("rankedModeBadge");

// Modals
export const onlineScoreModal = document.getElementById("onlineScoreModal");
export const modalScoreMsg = document.getElementById("modalScoreMsg");
export const onlinePseudoInput = document.getElementById("onlinePseudoInput");
export const btnIgnoreScore = document.getElementById("btnIgnoreScore");
export const btnSendScore = document.getElementById("btnSendScore");

export const helpModal = document.getElementById("helpModal");
export const closeHelpBtn = document.getElementById("closeHelpBtn");
export const helpGridList = document.getElementById("helpGridList");

export const statsModal = document.getElementById("statsModal");
export const closeStatsBtn = document.getElementById("closeStatsBtn");
export const totalWordsVal = document.getElementById("totalWordsVal");
export const uniqueWordsVal = document.getElementById("uniqueWordsVal");
export const statsWordList = document.getElementById("statsWordList");

// Stats joueur
export const statsTabGlobal = document.getElementById("statsTabGlobal");
export const statsTabPlayer = document.getElementById("statsTabPlayer");
export const statsMyControls = document.getElementById("statsMyControls");
export const statsModeFilters = document.getElementById("statsModeFilters");
export const statsMySummary = document.getElementById("statsMySummary");

// Paramètres
export const settingsBtn = document.getElementById("settingsBtn");
export const settingsPanel = document.getElementById("settingsPanel");
export const closeSettingsBtn = document.getElementById("closeSettingsBtn");
export const colorBg = document.getElementById("colorBg");
export const colorCaseBg = document.getElementById("colorCaseBg");
export const colorCaseShadow = document.getElementById("colorCaseShadow");
export const colorCaseSelected = document.getElementById("colorCaseSelected");
export const colorCaseBorderSelected = document.getElementById("colorCaseBorderSelected");
export const colorText = document.getElementById("colorText");
export const colorAccent = document.getElementById("colorAccent");
export const useGradient = document.getElementById("useGradient");
export const gradientControls = document.getElementById("gradientControls");
export const gradientColor1 = document.getElementById("gradientColor1");
export const gradientColor2 = document.getElementById("gradientColor2");
export const gradientAngle = document.getElementById("gradientAngle");
export const resetSettingsBtn = document.getElementById("resetSettingsBtn");
export const exportThemeBtn = document.getElementById("exportThemeBtn");
export const exportThemeArea = document.getElementById("exportThemeArea");
export const exportThemeTextarea = document.getElementById("exportThemeTextarea");

