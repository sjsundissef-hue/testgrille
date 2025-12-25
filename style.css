:root {
  --bg-color: #f4f4eb;
  --case-bg: #ffffff;
  --case-shadow: #c8c8be;
  --case-selected: #d4f1f4;
  --case-border-selected: #4a90e2;
  --text-color: #333333;
  --valid-color: #4cd137;
  --invalid-color: #e84118;

  /* nouveau : zoom de la grille */
  --grid-scale: 1;

  /* nouveau : écart entre les cases */
  --grid-gap: 20px;
}



* { box-sizing: border-box; }

body {
  margin: 0; padding: 10px; display: flex; flex-direction: column; align-items: center;
  min-height: 100vh; background-color: var(--bg-color);
  font-family: 'Segoe UI', sans-serif; user-select: none;
  touch-action: pan-y; -webkit-overflow-scrolling: touch;
}

h1 { margin: 5px 0 10px 0; color: #444; text-transform: uppercase; letter-spacing: 4px; font-size: 2.2rem; }

/* BOUTON TOP EXPERT */
.top-highlight { margin-bottom: 15px; width: 100%; display: flex; justify-content: center; }
.big-highlight-btn {
    background: linear-gradient(45deg, #8e44ad, #9b59b6);
    color: white; border: none; border-radius: 30px;
    padding: 15px 40px; font-size: 1.3rem; font-weight: 900;
    box-shadow: 0 6px 0 #6c3483, 0 10px 20px rgba(142, 68, 173, 0.4);
    cursor: pointer; text-transform: uppercase; letter-spacing: 2px;
    transition: transform 0.1s; width: 90%; max-width: 400px;
}
.big-highlight-btn:active { transform: translateY(4px); box-shadow: 0 2px 0 #6c3483; }

.controls { display: flex; gap: 15px; margin-bottom: 15px; }
.mode-btn { padding: 10px 20px; font-size: 1rem; background-color: #e0e0e0; color: #555; border: none; border-radius: 25px; cursor: pointer; font-weight: bold; }
.mode-btn.active { background-color: #4a90e2; color: white; box-shadow: 0 3px 0 #357abd; }

.main-container { display: flex; gap: 50px; align-items: flex-start; flex-wrap: wrap; justify-content: center; width: 100%; padding-bottom: 50px; }
.game-area { display: flex; flex-direction: column; align-items: center; gap: 20px; width: 100%; max-width: 600px; }

.grid-wrapper {
  position: relative;
  padding: 30px;
  background: #dcdcd0;
  border-radius: 40px;
  box-shadow: inset 0 3px 6px rgba(0,0,0,0.1);
  touch-action: none;

  width: fit-content;
  height: fit-content;

  transform: scale(var(--grid-scale));
  transform-origin: center;
}


#bgCanvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
#lineCanvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }

/* === CORRECTION GRILLE (Taille & Structure) === */
.grid { 
  display: grid; 
  /* Force 4x4 par défaut pour éviter l'empilement vertical au chargement */
  gap: var(--grid-gap); 
  position: relative; 
  z-index: 2; 
}


.cell {
  width: 120px; height: 120px; background-color: var(--case-bg); border-radius: 25px;
  display: flex; align-items: center; justify-content: center;
  font-size: 4rem; font-weight: 800; color: var(--text-color);
  box-shadow: 0 10px 0 var(--case-shadow); cursor: pointer;
  transition: transform 0.1s, background-color 0.1s; position: relative; z-index: 2;
}

.grid.fun-grid .cell { width: 160px; height: 160px; font-size: 5rem; }
.grid.expert-grid .cell { width: 135px; height: 135px; font-size: 4.5rem; }
.cell.qu-mode { font-size: 2.8rem; letter-spacing: -2px; }

.cell.selected { background-color: var(--case-selected); box-shadow: 0 10px 0 #a8d8e0, inset 0 0 0 5px var(--case-border-selected); transform: translateY(5px); }
.cell.flash-success { animation: flashGreen 0.4s ease-out; }
@keyframes flashGreen {
  0% { background-color: #4cd137; color: white; box-shadow: 0 6px 0 #3cb02a; }
  100% { background-color: var(--case-bg); color: var(--text-color); }
}

.cell-input { width: 100%; height: 100%; background: transparent; border: none; text-align: center; font-size: 3.5rem; font-weight: 800; color: #4a90e2; outline: none; text-transform: uppercase; font-family: inherit; padding: 0; margin: 0; }

.word-display-area { height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 5px; }
.current-word { font-size: 2.4rem; font-weight: 800; color: #333; min-height: 50px; letter-spacing: 2px; }
.feedback { font-size: 1.2rem; font-weight: bold; height: 25px; opacity: 0; transition: opacity 0.3s; }
.feedback.visible { opacity: 1; }
.feedback.valid { color: var(--valid-color); }
.feedback.invalid { color: var(--invalid-color); }

.timer-display { font-size: 2rem; font-weight: 900; color: #333; margin-bottom: 10px; background: #fff; padding: 5px 20px; border-radius: 15px; box-shadow: 0 4px 0 rgba(0,0,0,0.1); display: none; }
.timer-display.low-time { color: #e84118; animation: pulse 1s infinite; }
@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }

.action-buttons { display: flex; gap: 15px; margin-top: 20px; flex-wrap: wrap; justify-content: center; width: 100%; max-width: 750px; }
button { padding: 14px 28px; font-size: 1.1rem; font-weight: bold; color: white; background-color: #4a90e2; border: none; border-radius: 30px; cursor: pointer; box-shadow: 0 5px 0 #357abd; transition: transform 0.1s; }
button:active { transform: translateY(3px); box-shadow: 0 2px 0 #357abd; }

button.secondary { background-color: #95a5a6; box-shadow: 0 5px 0 #7f8c8d; }
button.stats-btn { background-color: #34495e; box-shadow: 0 5px 0 #2c3e50; width: 100%; } 
button.fun { background: linear-gradient(45deg, #e1b12c, #f1c40f); box-shadow: 0 5px 0 #b7950b; color: #333; }
button.validate { background-color: #4cd137; box-shadow: 0 5px 0 #44bd32; display: none; }
button.pass { background-color: #34495e; box-shadow: 0 5px 0 #2c3e50; display: none; }
.help-btn { background-color: #f1c40f; color: #333; box-shadow: 0 5px 0 #d4ac0d; }

.score-panel { background: white; padding: 25px; border-radius: 25px; width: 340px; height: 750px; box-shadow: 0 8px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; }
.score-header { margin-bottom: 10px; border-bottom: 2px solid #eee; padding-bottom: 10px; display: flex; flex-direction: column; gap: 5px; }
.score-title { font-weight: bold; font-size: 1.2rem; color: #333; }
.score-total { font-size: 1.8rem; color: #4a90e2; font-weight: 800; text-align: right; }
.score-comparison { font-size: 0.9rem; color: #888; text-align: right; white-space: pre-wrap; line-height: 1.4; } 
.filter-container { margin-bottom: 10px; }
.filter-input { width: 100%; padding: 12px 15px; border: 2px solid #eee; border-radius: 20px; font-size: 1.1rem; outline: none; transition: border-color 0.2s; color: #555; background-color: #fafafa; }
.filter-input:focus { border-color: #4a90e2; background-color: #fff; }
.word-list { flex: 1; overflow-y: auto; list-style: none; padding: 0; margin: 0; font-size: 1.1rem; color: #555; margin-bottom: 15px; border-bottom: 2px solid #eee; -webkit-overflow-scrolling: touch; }
.word-list li { padding: 8px 5px; border-bottom: 1px solid #f5f5f5; display: flex; justify-content: space-between; align-items: center; }
.word-list li.missed { color: #e84118; }
.word-points { background: #f0f0f0; color: #666; font-size: 0.8em; font-weight: bold; padding: 4px 10px; border-radius: 12px; }

.history-section { height: 100px; overflow-y: auto; border-top: 1px solid #eee; padding-top: 10px; margin-bottom: 10px; }
.history-title { font-size: 0.9rem; font-weight: bold; color: #888; margin-bottom: 5px; text-transform: uppercase; }
.history-list { list-style: none; padding: 0; margin: 0; font-size: 0.9rem; }
.leaderboard-section { flex: 1; min-height: 150px; overflow-y: auto; border-top: 2px solid #eee; padding-top: 10px; }
.leaderboard-title { font-size: 0.95rem; font-weight: 800; color: #4a90e2; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
.leaderboard-list { list-style: none; padding: 0; margin: 0; }
.leaderboard-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #f9f9f9; font-size: 0.9rem; }
.lb-rank { font-weight: bold; color: #888; width: 25px; }
.lb-name { font-weight: bold; color: #333; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lb-score { font-weight: 900; color: #e67e22; margin-left: 10px; }

/* MODALS */
.modal-overlay { display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); align-items: center; justify-content: center; backdrop-filter: blur(2px); }
.modal-content { background-color: #fff; padding: 30px; border-radius: 25px; width: 90%; max-width: 350px; text-align: center; box-shadow: 0 15px 40px rgba(0,0,0,0.4); animation: popIn 0.3s ease-out; }
.modal-large { max-width: 500px; height: 80vh; display: flex; flex-direction: column; padding: 20px; text-align: left; }
@keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.modal-content h3 { color: #4a90e2; margin-top: 0; font-size: 1.6rem; margin-bottom: 10px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px; }
.close-btn { background: none; border: none; font-size: 2rem; color: #888; cursor: pointer; box-shadow: none; padding: 0; width: auto; }

/* HELP & STATS */
.help-content { overflow-y: auto; flex: 1; }
.help-grid-list { display: flex; flex-direction: column; gap: 20px; }
.help-item { background: #f9f9f9; padding: 10px; border-radius: 15px; border: 1px solid #eee; }
.help-item-header { display: flex; gap: 15px; align-items: center; margin-bottom: 5px; }
.mini-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; width: 50px; height: 50px; background: #ddd; padding: 2px; border-radius: 5px; }
.mini-cell { background: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem; border-radius: 3px; }
.help-words { font-size: 0.9rem; color: #333; line-height: 1.4; }
.word-tag { display: inline-block; background: #e0e0e0; padding: 2px 6px; border-radius: 4px; margin: 2px; font-weight: bold; color: #555; }

/* STATS SPECIFIC */
.stats-summary { display: flex; gap: 15px; margin-bottom: 20px; justify-content: center; }
.stat-card { background: #f0f4f8; padding: 15px; border-radius: 20px; flex: 1; text-align: center; border: 1px solid #e1e8ed; }
.stat-val { display: block; font-size: 2rem; font-weight: 900; color: #4a90e2; }
.stat-label { font-size: 0.8rem; color: #7f8c8d; text-transform: uppercase; font-weight: bold; }
.stats-tabs { display: flex; background: #f0f2f5; padding: 5px; border-radius: 14px; margin-bottom: 15px; }
.stats-tab { flex: 1; text-align: center; padding: 10px; border-radius: 10px; font-weight: bold; color: #64748b; background: transparent; border:none; cursor: pointer; }
.stats-tab-active { background: white; color: #4a90e2; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }

.stats-filter-group { display: flex; justify-content: center; gap: 5px; margin-bottom: 10px; }
.mode-filter { background: transparent; border: 1px solid #cbd5e1; color: #64748b; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; font-weight: 600; }
.mode-filter.active { background: #4a90e2; color: white; border-color: #4a90e2; }
.stats-my-summary { text-align: center; font-size: 0.9rem; color: #7f8c8d; margin-bottom: 15px; }

/* POPUP SCORE */
.modal-sub { color: #666; margin-bottom: 25px; font-size: 1rem; }
#modalScoreMsg { font-weight: bold; font-size: 1.1rem; color: #333; margin-bottom: 5px; }
#onlinePseudoInput { width: 100%; padding: 14px; font-size: 1.1rem; border: 2px solid #ddd; border-radius: 15px; margin-bottom: 25px; text-align: center; outline: none; }
#onlinePseudoInput:focus { border-color: #4a90e2; }
.modal-actions { display: flex; gap: 15px; justify-content: center; }
.btn-cancel { background-color: #95a5a6; color: white; border: none; border-radius: 20px; padding: 12px 20px; font-weight: bold; cursor: pointer; }
.btn-confirm { background-color: #4cd137; color: white; border: none; border-radius: 20px; padding: 12px 25px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 0 #44bd32; }
.btn-confirm:active { transform: translateY(2px); box-shadow: 0 2px 0 #44bd32; }

/* === MOBILE OPTIMIZED (Taille parfaite) === */
@media (max-width: 768px) { 
  body { padding: 5px; overflow-x: hidden; }
  .score-panel { width: 100%; height: auto; max-height: 500px; padding: 15px; margin-top: 20px; }
  .grid-wrapper { padding: 18px; border-radius: 24px; width: 85vw; display: flex; justify-content: center; }

  .grid { 
    gap: var(--grid-gap); 
    width: 100%; 
    justify-content: center; 
  }

  .cell { width: auto; height: auto; aspect-ratio: 1/1; font-size: 2.2rem; border-radius: 16px; box-shadow: 0 6px 0 var(--case-shadow); }
  .cell.qu-mode { font-size: 1.6rem; letter-spacing: -1px; }
  .cell-input { font-size: 2rem; }
  .grid.fun-grid { width: min(82vw, 350px); gap: 30px; }
  .grid.fun-grid .cell { font-size: 3.6rem; }
  .grid.expert-grid { width: 345px !important; max-width: 345px !important; gap: 34px !important; margin: 0 auto; }
  .grid.expert-grid .cell { width: 97px !important; height: 97px !important; font-size: 3.2rem; border-radius: 18px; }
  .action-buttons { gap: 8px; width: 98%; }
  button { padding: 10px 15px; font-size: 0.9rem; width: 48%; margin: 0; border-radius: 20px; }
}


/* BOUTON MODE CHRONO */
#chronoToggleBtn {
  font-size: 0.95rem;
  background-color: #ffeaa7;
  color: #333;
  box-shadow: 0 3px 0 #e1b12c;
}

#chronoToggleBtn.chrono-active {
  background-color: #00b894;
  box-shadow: 0 3px 0 #019874;
  color: #fff;
}

/* BADGE PARTIE CHRONO */
.chrono-badge {
  margin-bottom: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #00b894;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}
/* === RÉGLAGE TAILLE GRILLE / LETTRES === */
.settings-panel {
  max-width: 600px;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 10px;
  margin-bottom: 8px;
}

.setting-item {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  color: #555;
}

.setting-item label {
  margin-bottom: 4px;
  opacity: 0.8;
}

/* Slider */
#gridScaleRange {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 999px;
  background: #e0e0e0;
  outline: none;
}

#gridScaleRange::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4a90e2;
  box-shadow: 0 2px 4px rgba(0,0,0,0.25);
  cursor: pointer;
}

#gridScaleRange::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4a90e2;
  box-shadow: 0 2px 4px rgba(0,0,0,0.25);
  cursor: pointer;
}
#gridGapRange {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 999px;
  background: #e0e0e0;
  outline: none;
}

#gridGapRange::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4a90e2;
  box-shadow: 0 2px 4px rgba(0,0,0,0.25);
  cursor: pointer;
}

#gridGapRange::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4a90e2;
  box-shadow: 0 2px 4px rgba(0,0,0,0.25);
  cursor: pointer;
}


