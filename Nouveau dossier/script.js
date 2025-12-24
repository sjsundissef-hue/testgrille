// ===========================
// Config de base
// ===========================

let gridSize = 4;              // 4 ou 5
let currentLayout = "A";       // "A", "B", "C"
let gridData = [];             // lettres
let selectionPath = [];        // [{r,c}, ...]
let isDragging = false;
let foundWords = new Set();
let score = 0;

// DOM
const gridWrapper = document.getElementById("gridWrapper");
const gridEl = document.getElementById("grid");
const wordDisplay = document.getElementById("currentWord");
const feedbackEl = document.getElementById("feedbackMsg");
const scoreDisplay = document.getElementById("scoreDisplay");
const wordListEl = document.getElementById("wordList");
const gridSizeLabel = document.getElementById("gridSizeLabel");
const layoutLabel = document.getElementById("layoutLabel");

const btn4x4 = document.getElementById("btn4x4");
const btn5x5 = document.getElementById("btn5x5");
const layoutButtons = document.querySelectorAll(".layout-btn");

const newGridBtn = document.getElementById("newGridBtn");
const clearWordBtn = document.getElementById("clearWordBtn");

// ===========================
// Génération de grille simple
// ===========================

const LETTERS = "AABCDEEFGHIIJKLMNOOPQRSTUUVWXYYZ"; // un peu plus de voyelles

function generateGrid() {
  gridData = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => {
      const idx = Math.floor(Math.random() * LETTERS.length);
      return LETTERS[idx];
    })
  );
}

// ===========================
// Mise à jour UI
// ===========================

function renderGrid() {
  gridEl.innerHTML = "";

  gridEl.classList.remove("grid-4x4", "grid-5x5");
  gridEl.classList.add(gridSize === 4 ? "grid-4x4" : "grid-5x5");

  gridData.forEach((row, r) => {
    row.forEach((letter, c) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = letter;
      cell.dataset.r = r;
      cell.dataset.c = c;

      // Pointer events : gère souris + tactile
      cell.addEventListener("pointerdown", onPointerDownCell);
      cell.addEventListener("pointerenter", onPointerEnterCell);

      gridEl.appendChild(cell);
    });
  });

  updateWordDisplay();
}

function updateWordDisplay() {
  let word = "";
  selectionPath.forEach((pos) => {
    word += gridData[pos.r][pos.c];
  });
  if (wordDisplay) wordDisplay.textContent = word;
}

function updateScoreDisplay() {
  if (scoreDisplay) scoreDisplay.textContent = score.toString();
}

function showFeedback(msg, type) {
  if (!feedbackEl) return;
  feedbackEl.textContent = msg;
  feedbackEl.className = "feedback visible " + (type || "");
  setTimeout(() => {
    if (feedbackEl.textContent === msg) {
      feedbackEl.className = "feedback";
    }
  }, 800);
}

function updateWordList() {
  wordListEl.innerHTML = "";
  const all = Array.from(foundWords).sort((a, b) =>
    a.localeCompare(b)
  );
  all.forEach((w) => {
    const li = document.createElement("li");
    const spanWord = document.createElement("span");
    spanWord.className = "word-text";
    spanWord.textContent = w;

    const spanScore = document.createElement("span");
    spanScore.className = "word-score";
    spanScore.textContent = getWordPoints(w) + " pts";

    li.appendChild(spanWord);
    li.appendChild(spanScore);
    wordListEl.appendChild(li);
  });
}

// Score simple : plus le mot est long, plus il vaut
function getWordPoints(word) {
  const len = word.length;
  if (len < 3) return 0;
  if (len === 3) return 3;
  if (len === 4) return 5;
  if (len === 5) return 7;
  if (len === 6) return 9;
  return 11;
}

// ===========================
// Gestion pointer (tactile + souris)
// ===========================

function onPointerDownCell(e) {
  e.preventDefault();
  const cell = e.currentTarget;
  startDragFromCell(cell);
  // Capturer les events jusqu'au pointerup
  cell.setPointerCapture(e.pointerId);
}

function onPointerEnterCell(e) {
  if (!isDragging) return;
  const cell = e.currentTarget;
  addCellToPath(cell);
}

function startDragFromCell(cell) {
  isDragging = true;
  selectionPath = [];
  addCellToPath(cell);
}

function addCellToPath(cell) {
  const r = parseInt(cell.dataset.r, 10);
  const c = parseInt(cell.dataset.c, 10);

  if (selectionPath.length > 0) {
    const last = selectionPath[selectionPath.length - 1];

    // Gestion du "retour en arrière" : si on revient sur l'avant-dernier, on annule la dernière lettre
    if (selectionPath.length > 1) {
      const prev = selectionPath[selectionPath.length - 2];
      if (prev.r === r && prev.c === c) {
        selectionPath.pop();
        refreshSelectedCells();
        return;
      }
    }

    const isAdjacent =
      Math.abs(last.r - r) <= 1 && Math.abs(last.c - c) <= 1;

    const alreadyUsed = selectionPath.some(
      (p) => p.r === r && p.c === c
    );

    if (!isAdjacent || alreadyUsed) {
      return; // ignore si pas adjacent ou déjà pris
    }
  }

  selectionPath.push({ r, c });
  refreshSelectedCells();
}

function refreshSelectedCells() {
  // reset visuel
  const cells = gridEl.querySelectorAll(".cell");
  cells.forEach((c) => c.classList.remove("selected"));

  // applique .selected sur le chemin
  selectionPath.forEach((pos) => {
    const index = pos.r * gridSize + pos.c;
    const cell = cells[index];
    if (cell) cell.classList.add("selected");
  });

  updateWordDisplay();
}

// pointerup global : fin du mot
document.addEventListener("pointerup", () => {
  if (!isDragging) return;
  isDragging = false;
  validateWord();
  selectionPath = [];
  refreshSelectedCells();
});

// ===========================
// Validation des mots
// ===========================

function validateWord() {
  const word = wordDisplay ? wordDisplay.textContent : "";
  if (!word || word.length < 3) {
    if (word.length > 0) showFeedback("Trop court", "invalid");
    return;
  }

  // Ici : tous les mots 3+ lettres sont acceptés
  if (foundWords.has(word)) {
    showFeedback("Déjà trouvé", "invalid");
    return;
  }

  foundWords.add(word);
  const pts = getWordPoints(word);
  score += pts;
  updateScoreDisplay();
  updateWordList();
  showFeedback(`+${pts} pts`, "valid");
}

// ===========================
// Changement de mode / layout
// ===========================

function setGridSize(size) {
  gridSize = size;
  if (gridSizeLabel) gridSizeLabel.textContent = gridSize + "x" + gridSize;

  btn4x4.classList.toggle("active", size === 4);
  btn5x5.classList.toggle("active", size === 5);

  resetGame();
}

function setLayout(layout) {
  currentLayout = layout;
  if (layoutLabel) layoutLabel.textContent = layout;

  layoutButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.layout === layout);
  });

  gridWrapper.classList.remove("layout-A", "layout-B", "layout-C");
  gridWrapper.classList.add("layout-" + layout);

  // On regénère la grille pour voir l'effet direct
  resetGame();
}

function resetGame() {
  foundWords.clear();
  score = 0;
  selectionPath = [];
  updateScoreDisplay();
  updateWordList();
  if (wordDisplay) wordDisplay.textContent = "";
  if (feedbackEl) {
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
  }
  generateGrid();
  renderGrid();
}

// ===========================
// Boutons
// ===========================

btn4x4.addEventListener("click", () => setGridSize(4));
btn5x5.addEventListener("click", () => setGridSize(5));

layoutButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const layout = btn.dataset.layout;
    setLayout(layout);
  });
});

newGridBtn.addEventListener("click", () => {
  resetGame();
  showFeedback("Nouvelle grille", "valid");
});

clearWordBtn.addEventListener("click", () => {
  selectionPath = [];
  refreshSelectedCells();
  showFeedback("Mot effacé", "");
});

// ===========================
// Init
// ===========================

window.addEventListener("load", () => {
  setGridSize(4);
  setLayout("A");
});
