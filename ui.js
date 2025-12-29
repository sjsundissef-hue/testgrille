// ==========================================
// === GESTION DE L'INTERFACE UTILISATEUR ===
// ==========================================

import { 
  BODY_HOME_CLASS, 
  BODY_RANKED_CLASS, 
  BODY_RANKED_RESULTS_CLASS 
} from './config.js';
import { 
  solveBtn, 
  backToHomeBtn, 
  feedbackEl, 
  scoreDisplayEl,
  rankedToggleBtn,
  rankedModeBadge,
  settingsBtn,
  settingsPanel,
  closeSettingsBtn,
  colorBg,
  colorCaseBg,
  colorCaseShadow,
  colorCaseSelected,
  colorCaseBorderSelected,
  colorText,
  colorAccent,
  useGradient,
  gradientControls,
  gradientColor1,
  gradientColor2,
  gradientAngle,
  resetSettingsBtn,
  exportThemeBtn,
  exportThemeArea,
  exportThemeTextarea,
  graph3x3Btn,
  analysisModal,
  closeAnalysisBtn,
  analysisChart,
  analysisTotalWords,
  analysisTotalPoints,
  analysisAvgSpeed,
  analysisNoAccount,
  analysisChartContainer
} from './dom.js';
import { state } from './state.js';

// Feedback
export function showFeedback(text, type) {
  if (!feedbackEl) return;
  feedbackEl.textContent = text;
  feedbackEl.className = "feedback visible " + type;
  setTimeout(() => {
    if (feedbackEl.textContent === text) feedbackEl.className = "feedback";
  }, 3000);
}

// Score (currentScore passé en paramètre)
export function updateScoreDisplay(currentScore) {
  if (!scoreDisplayEl) return;
  scoreDisplayEl.textContent = currentScore + " pts";
}

// UI Ranked
export function updateRankedUI() {
  const isTimedEnabled = state.isTimedModeEnabled;
  if (rankedToggleBtn) {
    rankedToggleBtn.classList.toggle("ranked-active", isTimedEnabled);
    rankedToggleBtn.classList.toggle("ranked-off", !isTimedEnabled);
    rankedToggleBtn.textContent = isTimedEnabled ? "Mode ranked : ON" : "Mode ranked : OFF";
  }
  if (rankedModeBadge) {
    const isChrono = state.isChronoGame;
    const isExpert = state.isExpertMode;
    const size = state.gridSize;
    const shouldShow = isChrono && (isExpert || (!isExpert && (size === 4 || size === 5)));
    rankedModeBadge.style.display = shouldShow ? "inline-block" : "none";
    if (shouldShow) rankedModeBadge.textContent = "Partie ranked";
  }
}

// États UI
export function setHomeMode() {
  const body = document.body;
  body.classList.remove(BODY_RANKED_CLASS);
  body.classList.remove(BODY_RANKED_RESULTS_CLASS);
  body.classList.add(BODY_HOME_CLASS);
  
  if (solveBtn) {
    solveBtn.textContent = "Voir solutions";
  }
  
  if (backToHomeBtn) {
    backToHomeBtn.style.display = "none";
  }
  
  // Remettre le score-panel à sa place normale si nécessaire
  const mainContainer = document.querySelector(".main-container");
  const scorePanel = document.querySelector(".score-panel");
  const rankedStack = document.querySelector(".ranked-stack");
  if (mainContainer && scorePanel && rankedStack && rankedStack.contains(scorePanel)) {
    mainContainer.appendChild(scorePanel);
  }
}

export function setRankedModeUI(active) {
  const body = document.body;
  if (active) {
    body.classList.add(BODY_RANKED_CLASS);
    body.classList.remove(BODY_RANKED_RESULTS_CLASS);
    body.classList.remove(BODY_HOME_CLASS);
    if (solveBtn) {
      solveBtn.textContent = "Voir Résultats";
    }
  } else {
    setHomeMode();
  }
}

export function setRankedResultsMode() {
  const body = document.body;
  body.classList.remove(BODY_RANKED_CLASS);
  body.classList.add(BODY_RANKED_RESULTS_CLASS);
  body.classList.remove(BODY_HOME_CLASS);
  
  if (backToHomeBtn) {
    backToHomeBtn.style.display = "inline-block";
  }
  
  // Déplacer la grille et le score-panel dans ranked-stack
  const rankedStack = document.querySelector(".ranked-stack");
  const gridWrapper = document.querySelector(".grid-wrapper");
  const scorePanel = document.querySelector(".main-container > .score-panel") || 
                     document.querySelector(".ranked-stack .score-panel") ||
                     document.querySelector(".score-panel");
  
  if (rankedStack) {
    if (gridWrapper && !rankedStack.contains(gridWrapper)) {
      rankedStack.insertBefore(gridWrapper, rankedStack.firstChild);
    }
    if (scorePanel && !rankedStack.contains(scorePanel)) {
      rankedStack.appendChild(scorePanel);
    }
  }
}

// ==========================================
// === GESTION DES PARAMÈTRES DE THÈME ===
// ==========================================

// Valeurs par défaut
const DEFAULT_THEME = {
  bgColor: "#f4f4eb",
  caseBg: "#ffffff",
  caseShadow: "#c8c8be",
  caseSelected: "#d4f1f4",
  caseBorderSelected: "#4a90e2",
  textColor: "#333333",
  accentColor: "#4a90e2",
  useGradient: false,
  gradientColor1: "#f4f4eb",
  gradientColor2: "#e8e8d8",
  gradientAngle: "45deg"
};

// Appliquer une couleur CSS
function applyCSSVariable(varName, value) {
  document.documentElement.style.setProperty(varName, value);
}

// Appliquer le fond (uni ou dégradé)
function applyBackground() {
  const useGrad = useGradient && useGradient.checked;
  
  if (useGrad) {
    const color1 = gradientColor1 ? gradientColor1.value : DEFAULT_THEME.gradientColor1;
    const color2 = gradientColor2 ? gradientColor2.value : DEFAULT_THEME.gradientColor2;
    const angle = gradientAngle ? gradientAngle.value : DEFAULT_THEME.gradientAngle;
    document.body.style.backgroundImage = `linear-gradient(${angle}, ${color1}, ${color2})`;
    document.body.style.backgroundColor = "";
  } else {
    const bgColor = colorBg ? colorBg.value : DEFAULT_THEME.bgColor;
    document.body.style.backgroundColor = bgColor;
    document.body.style.backgroundImage = "none";
  }
}

// Mettre à jour toutes les couleurs
function updateAllColors() {
  if (colorBg) applyCSSVariable("--bg-color", colorBg.value);
  if (colorCaseBg) applyCSSVariable("--case-bg", colorCaseBg.value);
  if (colorCaseShadow) applyCSSVariable("--case-shadow", colorCaseShadow.value);
  if (colorCaseSelected) applyCSSVariable("--case-selected", colorCaseSelected.value);
  if (colorCaseBorderSelected) applyCSSVariable("--case-border-selected", colorCaseBorderSelected.value);
  if (colorText) applyCSSVariable("--text-color", colorText.value);
  if (colorAccent) applyCSSVariable("--accent-color", colorAccent.value);
  
  applyBackground();
  
  // Sauvegarder dans localStorage
  saveTheme();
}

// Sauvegarder le thème
function saveTheme() {
  const theme = {
    bgColor: colorBg ? colorBg.value : DEFAULT_THEME.bgColor,
    caseBg: colorCaseBg ? colorCaseBg.value : DEFAULT_THEME.caseBg,
    caseShadow: colorCaseShadow ? colorCaseShadow.value : DEFAULT_THEME.caseShadow,
    caseSelected: colorCaseSelected ? colorCaseSelected.value : DEFAULT_THEME.caseSelected,
    caseBorderSelected: colorCaseBorderSelected ? colorCaseBorderSelected.value : DEFAULT_THEME.caseBorderSelected,
    textColor: colorText ? colorText.value : DEFAULT_THEME.textColor,
    accentColor: colorAccent ? colorAccent.value : DEFAULT_THEME.accentColor,
    useGradient: useGradient ? useGradient.checked : false,
    gradientColor1: gradientColor1 ? gradientColor1.value : DEFAULT_THEME.gradientColor1,
    gradientColor2: gradientColor2 ? gradientColor2.value : DEFAULT_THEME.gradientColor2,
    gradientAngle: gradientAngle ? gradientAngle.value : DEFAULT_THEME.gradientAngle
  };
  
  localStorage.setItem("wb_theme", JSON.stringify(theme));
}

// Charger le thème sauvegardé
function loadTheme() {
  const saved = localStorage.getItem("wb_theme");
  if (!saved) {
    applyDefaultTheme();
    return;
  }
  
  try {
    const theme = JSON.parse(saved);
    
    // Appliquer les valeurs
    if (colorBg) colorBg.value = theme.bgColor || DEFAULT_THEME.bgColor;
    if (colorCaseBg) colorCaseBg.value = theme.caseBg || DEFAULT_THEME.caseBg;
    if (colorCaseShadow) colorCaseShadow.value = theme.caseShadow || DEFAULT_THEME.caseShadow;
    if (colorCaseSelected) colorCaseSelected.value = theme.caseSelected || DEFAULT_THEME.caseSelected;
    if (colorCaseBorderSelected) colorCaseBorderSelected.value = theme.caseBorderSelected || DEFAULT_THEME.caseBorderSelected;
    if (colorText) colorText.value = theme.textColor || DEFAULT_THEME.textColor;
    if (colorAccent) colorAccent.value = theme.accentColor || DEFAULT_THEME.accentColor;
    
    if (useGradient) {
      useGradient.checked = theme.useGradient || false;
      if (gradientControls) {
        gradientControls.style.display = useGradient.checked ? "block" : "none";
      }
    }
    
    if (gradientColor1) gradientColor1.value = theme.gradientColor1 || DEFAULT_THEME.gradientColor1;
    if (gradientColor2) gradientColor2.value = theme.gradientColor2 || DEFAULT_THEME.gradientColor2;
    if (gradientAngle) gradientAngle.value = theme.gradientAngle || DEFAULT_THEME.gradientAngle;
    
    // Appliquer les couleurs
    updateAllColors();
  } catch (e) {
    console.error("Erreur chargement thème", e);
    applyDefaultTheme();
  }
}

// Appliquer le thème par défaut
function applyDefaultTheme() {
  if (colorBg) colorBg.value = DEFAULT_THEME.bgColor;
  if (colorCaseBg) colorCaseBg.value = DEFAULT_THEME.caseBg;
  if (colorCaseShadow) colorCaseShadow.value = DEFAULT_THEME.caseShadow;
  if (colorCaseSelected) colorCaseSelected.value = DEFAULT_THEME.caseSelected;
  if (colorCaseBorderSelected) colorCaseBorderSelected.value = DEFAULT_THEME.caseBorderSelected;
  if (colorText) colorText.value = DEFAULT_THEME.textColor;
  if (colorAccent) colorAccent.value = DEFAULT_THEME.accentColor;
  
  if (useGradient) {
    useGradient.checked = false;
    if (gradientControls) gradientControls.style.display = "none";
  }
  
  if (gradientColor1) gradientColor1.value = DEFAULT_THEME.gradientColor1;
  if (gradientColor2) gradientColor2.value = DEFAULT_THEME.gradientColor2;
  if (gradientAngle) gradientAngle.value = DEFAULT_THEME.gradientAngle;
  
  updateAllColors();
}

// Exporter le thème
function exportTheme() {
  const theme = {
    bgColor: colorBg ? colorBg.value : DEFAULT_THEME.bgColor,
    caseBg: colorCaseBg ? colorCaseBg.value : DEFAULT_THEME.caseBg,
    caseShadow: colorCaseShadow ? colorCaseShadow.value : DEFAULT_THEME.caseShadow,
    caseSelected: colorCaseSelected ? colorCaseSelected.value : DEFAULT_THEME.caseSelected,
    caseBorderSelected: colorCaseBorderSelected ? colorCaseBorderSelected.value : DEFAULT_THEME.caseBorderSelected,
    textColor: colorText ? colorText.value : DEFAULT_THEME.textColor,
    accentColor: colorAccent ? colorAccent.value : DEFAULT_THEME.accentColor,
    useGradient: useGradient ? useGradient.checked : false,
    gradientColor1: gradientColor1 ? gradientColor1.value : DEFAULT_THEME.gradientColor1,
    gradientColor2: gradientColor2 ? gradientColor2.value : DEFAULT_THEME.gradientColor2,
    gradientAngle: gradientAngle ? gradientAngle.value : DEFAULT_THEME.gradientAngle
  };
  
  const json = JSON.stringify(theme, null, 2);
  if (exportThemeTextarea) {
    exportThemeTextarea.value = json;
  }
  if (exportThemeArea) {
    exportThemeArea.style.display = "block";
    exportThemeTextarea.select();
  }
}

// Ouvrir/Fermer le panneau
export function openSettingsPanel() {
  if (settingsPanel) {
    settingsPanel.classList.add("active");
  }
}

export function closeSettingsPanel() {
  if (settingsPanel) {
    settingsPanel.classList.remove("active");
  }
  if (exportThemeArea) {
    exportThemeArea.style.display = "none";
  }
}

// Initialiser les paramètres
export function initSettings() {
  // Charger le thème sauvegardé au démarrage
  loadTheme();
  
  // Event listeners
  if (settingsBtn) {
    settingsBtn.addEventListener("click", openSettingsPanel);
  }
  
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener("click", closeSettingsPanel);
  }
  
  // Fermer en cliquant en dehors
  if (settingsPanel) {
    settingsPanel.addEventListener("click", (e) => {
      if (e.target === settingsPanel) {
        closeSettingsPanel();
      }
    });
  }
  
  // Listeners pour les color pickers
  const colorInputs = [colorBg, colorCaseBg, colorCaseShadow, colorCaseSelected, 
                       colorCaseBorderSelected, colorText, colorAccent];
  colorInputs.forEach(input => {
    if (input) {
      input.addEventListener("input", updateAllColors);
    }
  });
  
  // Listener pour le dégradé
  if (useGradient) {
    useGradient.addEventListener("change", () => {
      if (gradientControls) {
        gradientControls.style.display = useGradient.checked ? "block" : "none";
      }
      applyBackground();
      saveTheme();
    });
  }
  
  // Listeners pour les contrôles du dégradé
  if (gradientColor1) {
    gradientColor1.addEventListener("input", () => {
      applyBackground();
      saveTheme();
    });
  }
  
  if (gradientColor2) {
    gradientColor2.addEventListener("input", () => {
      applyBackground();
      saveTheme();
    });
  }
  
  if (gradientAngle) {
    gradientAngle.addEventListener("change", () => {
      applyBackground();
      saveTheme();
    });
  }
  
  // Bouton Réinitialiser
  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener("click", () => {
      applyDefaultTheme();
      if (exportThemeArea) {
        exportThemeArea.style.display = "none";
      }
    });
  }
  
  // Bouton Exporter
  if (exportThemeBtn) {
    exportThemeBtn.addEventListener("click", exportTheme);
  }
  
  // Listener pour le bouton "Voir le graphique"
  if (graph3x3Btn) {
    graph3x3Btn.addEventListener("click", () => {
      const dataStr = graph3x3Btn.dataset.analysisData;
      if (dataStr) {
        try {
          const data = JSON.parse(dataStr);
          show3x3Analysis(data);
        } catch (e) {
          console.error("Erreur parsing données analyse", e);
        }
      }
    });
  }
  
  // Listener pour fermer le modal d'analyse
  if (closeAnalysisBtn) {
    closeAnalysisBtn.addEventListener("click", closeAnalysisModal);
  }
  
  // Fermer en cliquant en dehors
  if (analysisModal) {
    analysisModal.addEventListener("click", (e) => {
      if (e.target === analysisModal) {
        closeAnalysisModal();
      }
    });
  }
}

// ==========================================
// === ANALYSE 3X3 ===
// ==========================================

let analysisChartInstance = null;

export function show3x3Analysis(data) {
  // Vérifier si le joueur est connecté
  import('./player.js').then(module => {
    const isConnected = module.isPlayerConnected ? module.isPlayerConnected() : false;
    
    if (!isConnected) {
      // Afficher le message pour créer un compte
      if (analysisNoAccount) {
        analysisNoAccount.style.display = "block";
      }
      if (analysisChartContainer) {
        analysisChartContainer.style.display = "none";
      }
      if (analysisModal) {
        analysisModal.classList.add("active");
      }
      return;
    }
    
    // Cacher le message et afficher le graphique
    if (analysisNoAccount) {
      analysisNoAccount.style.display = "none";
    }
    if (analysisChartContainer) {
      analysisChartContainer.style.display = "block";
    }
    
    // Mettre à jour les statistiques
    if (analysisTotalWords) {
      analysisTotalWords.textContent = data.totalWords || 0;
    }
    if (analysisTotalPoints) {
      analysisTotalPoints.textContent = data.totalPoints || 0;
    }
    if (analysisAvgSpeed) {
      const speed = (data.avgWordsPerMin || 0).toFixed(1);
      analysisAvgSpeed.textContent = `${speed} mots/min`;
    }
    
    // Construire les labels pour les tranches
    const labels = [];
    for (let i = 0; i < 40; i++) {
      const start = i * 3;
      const end = Math.min(start + 3, 120);
      labels.push(`${start}-${end}s`);
    }
    
    // Détruire le graphique précédent s'il existe
    if (analysisChartInstance) {
      analysisChartInstance.destroy();
    }
    
    // Créer le nouveau graphique
    if (analysisChart && typeof Chart !== 'undefined') {
      const ctx = analysisChart.getContext('2d');
      analysisChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Points par tranche de 3s',
            data: data.pointsBySlice || [],
            backgroundColor: 'rgba(74, 144, 226, 0.6)',
            borderColor: 'rgba(74, 144, 226, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const index = context.dataIndex;
                  const points = data.pointsBySlice[index] || 0;
                  const words = data.wordsBySlice[index] || 0;
                  const localSpeed = words > 0 ? (words / 3 * 60).toFixed(1) : 0;
                  return [
                    `Tranche: ${labels[index]}`,
                    `Points: ${points}`,
                    `Mots: ${words}`,
                    `Vitesse locale: ${localSpeed} mots/min`
                  ];
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Points'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Temps (secondes)'
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                maxTicksLimit: 20
              }
            }
          }
        }
      });
    }
    
    // Afficher le modal
    if (analysisModal) {
      analysisModal.classList.add("active");
    }
  }).catch(e => {
    console.error("Erreur import player.js", e);
  });
}

function closeAnalysisModal() {
  if (analysisModal) {
    analysisModal.classList.remove("active");
  }
}

