// Code à ajouter à la fin de ui.js

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

