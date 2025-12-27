// ==========================================
// === LOGIQUE DE GRILLE ===
// ==========================================

import { gridEl, canvas, ctx, bgCanvas, ctxBg } from './dom.js';
import { state } from './state.js';
import { getLetterByType, getRandomLetter } from './utils.js';
import { EXPERT_GRIDS } from './config.js';

// Rendu de la grille
export function renderGrid() {
  if (!gridEl) return;
  gridEl.innerHTML = "";
  state.gridData.forEach((row, r) => {
    row.forEach((letter, c) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = letter;
      if (letter === "QU") cell.classList.add("qu-mode");
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.addEventListener("mousedown", (e) => startDrag(e, cell));
      cell.addEventListener("mouseenter", (e) => onDragEnter(e, cell));
      cell.addEventListener("touchstart", (e) => {
        e.preventDefault();
        startDrag(e, cell);
      }, { passive: false });
      gridEl.appendChild(cell);
    });
  });
}

// Canvas
export function clearCanvas() {
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function drawPath() {
  clearCanvas();
}

export function drawGridLines() {
  if (!ctxBg || !bgCanvas) return;
  ctxBg.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
}

export function resizeCanvas() {
  const wrapper = document.querySelector(".grid-wrapper");
  if (!wrapper || !canvas || !bgCanvas) return;

  canvas.width = wrapper.offsetWidth;
  canvas.height = wrapper.offsetHeight;
  bgCanvas.width = wrapper.offsetWidth;
  bgCanvas.height = wrapper.offsetHeight;

  clearCanvas();
  drawPath();
  drawGridLines();
}

window.addEventListener("resize", resizeCanvas);

// Drag & Drop handlers (seront configurés depuis game.js)
let _startDrag, _onDragEnter, _endDrag, _addToPath, _isDragging;

export function setDragHandlers(handlers) {
  _startDrag = handlers.startDrag;
  _onDragEnter = handlers.onDragEnter;
  _endDrag = handlers.endDrag;
  _addToPath = handlers.addToPath;
  _isDragging = handlers.isDragging;
}

export function startDrag(e, cell) {
  if (_startDrag) _startDrag(e, cell);
}

export function onDragEnter(e, cell) {
  if (_onDragEnter) _onDragEnter(e, cell);
}

export function setupDragListeners() {
  document.addEventListener("mouseup", () => {
    if (_endDrag) _endDrag();
  });
  document.addEventListener("touchend", () => {
    if (_endDrag) _endDrag();
  });

  document.addEventListener("touchmove", (e) => {
    if (!_isDragging || !_isDragging()) return;
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const cell = el?.closest(".cell");
    if (cell && _addToPath) {
      _addToPath(parseInt(cell.dataset.r), parseInt(cell.dataset.c));
    }
  }, { passive: false });
}

// Génération de grille
export function generateGridData(size) {
  const data = Array.from({ length: size }, () => Array(size).fill(""));
  
  if (size === 4) {
    for (let r = 0; r < size; r++) {
      const patternType = Math.floor(Math.random() * 5);
      let pattern = patternType === 0 ? ["C", "V", "C", "V"] : 
                    patternType === 1 ? ["V", "C", "V", "C"] : 
                    patternType === 2 ? ["C", "V", "C", "C"] : 
                    patternType === 3 ? ["C", "V", "C", "E"] : 
                    ["?", "?", "?", "?"];
      for (let c = 0; c < size; c++) {
        let char = pattern[c] === "C" ? getLetterByType("C") : 
                   pattern[c] === "V" ? getLetterByType("V") : 
                   pattern[c] === "E" ? "E" : 
                   getRandomLetter();
        if (char === "Q") char = "QU";
        data[r][c] = char;
      }
    }
  } else {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        let char = getRandomLetter();
        if (char === "Q") char = "QU";
        data[r][c] = char;
      }
    }
  }
  
  return data;
}

// Grille Expert
export function generateExpertGrid() {
  const randomGrid = EXPERT_GRIDS[Math.floor(Math.random() * EXPERT_GRIDS.length)];
  const data = Array.from({ length: 3 }, () => Array(3).fill(""));
  let i = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      data[r][c] = randomGrid[i];
      i++;
    }
  }
  return data;
}

// Grille Fun (nécessite currentFunIndex et shuffledFunCombos depuis state.js)
export function loadFunGrid(currentFunIndex, shuffledFunCombos) {
  let index = currentFunIndex;
  if (index >= shuffledFunCombos.length) {
    index = 0;
  }
  const letters = shuffledFunCombos[index].split("").sort(() => 0.5 - Math.random());
  const data = Array.from({ length: 2 }, () => Array(2).fill(""));
  let i = 0;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      data[r][c] = letters[i];
      i++;
    }
  }
  return data;
}

