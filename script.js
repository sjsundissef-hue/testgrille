// ===========================
// 1. VARIABLES DE BASE
// ===========================

let gridSize = 4;            // 4 ou 5
let gridData = [];           // tableau de lettres
let foundWords = new Set();  // mots déjà trouvés
let selectionPath = [];      // [{r,c}, ...]
let isDragging = false;

// Lettres (un peu plus de voyelles pour que ce soit agréable)
const LETTERS = "AABCDEEFGHIIJKLMNOOPQRSTUUVWXYYZ";

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

let currentLayout = "A";

// ===========================
// 2. GÉNÉRATION DE GRILLE
// ===========================

function generateGrid() {
  gridData = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => {
      const idx = Math.floor(Math.random() * LETTERS.length);
      return LETTERS[idx];
    })
  );
}

// ===========================
// 3. AFFICHAGE GRILLE
// ===========================

function renderGrid() {
  if (!gridEl) return;
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

      // EXACTEMENT comme dans ton code principal :
      cell.addEventListener("mousedown", (e) => startDrag(e, cell));
      cell.addEventListener("mouseenter", (e) => onDragEnter(e, cell));

      cell.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault();
          startDrag(e, cell);
        },
        { passive: false }
      );

      gridEl.appendChild(cell);
    });
  });
  updateWordDisplay();
}

// ===========================
// 4. GESTION DU DRAG (COMME 3x3)
// ===========================

function startDrag(e, cell) {
  if (!cell) return;
  isDragging = true;
  selectionPath = [
    {
      r: parseInt(cell.dataset.r, 10),
      c: parseInt(cell.dataset.c, 10),
    },
  ];
  updateVisuals();
}

function onDragEnter(e, cell) {
  if (!isDragging || !cell) return;
  addToPath(
    parseInt(cell.dataset.r, 10),
    parseInt(cell.dataset.c, 10)
  );
}

// Touchmove global => on cherche la case sous le doigt
document.addEventListener(
  "touchmove",
  (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const el = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    );
    const cell = el && el.closest(".cell");
    if (cell) {
      addToPath(
        parseInt(cell.dataset.r, 10),
        parseInt(cell.dataset.c, 10)
      );
    }
  },
  { passive: false }
);

function endDrag() {
  if (!isDragging) return;
  isDragging = false;
  validateWord();
  selectionPath = [];
  updateVisuals();
}

// Fin du drag : souris + tactile
document.addEventListener("mouseup", endDrag);
document.addEventListener("touchend", endDrag);

function addToPath(r, c) {
  if (selectionPath.length > 1) {
    const prev = selectionPath[selectionPath.length - 2];
    if (prev.r === r && prev.c === c) {
      // on recule d'une lettre
      selectionPath.pop();
      updateVisuals();
      return;
    }
  }

  const last = selectionPath[selectionPath.length - 1];
  const isAdj =
    Math.abs(last.r - r) <= 1 && Math.abs(last.c - c) <= 1;
  const isVisited = selectionPath.some((p) => p.r === r && p.c === c);

  if (isAdj && !isVisited) {
    selectionPath.push({ r, c });
    updateVisuals();
  }
}

function updateVisuals() {
  if (!gridEl) return;
  const cells = Array.from(gridEl.children);
  cells.forEach((el) => el.classList.remove("selected"));

  let word = "";
  selectionPath.forEach((pos) => {
    const idx = pos.r * gridSize + pos.c;
    const cell = cells[idx];
    if (cell) {
      cell.classList.add("selected");
      word += gridData[pos.r][pos.c];
    }
  });

  if (wordDisplay) wordDisplay.textContent = word;
}

// ===========================
// 5. SCORE & MOTS
// ===========================

function getWordPoints(word) {
  const len = word.length;
  if (len < 3) return 0;
  if (len === 3) return 3;
  if (len === 4) return 5;
  if (len === 5) return 7;
  if (len === 6) return 9;
  return 11;
}

function validateWord() {
  const word = wordDisplay ? wordDisplay.textContent : "";
  if (!word || word.length < 3) {
    if (word.length > 0) showFeedback("Trop court", "invalid");
    return;
  }

  // Pas de dico ici : tout mot de 3+ lettres est accepté
  if (foundWords.has(word)) {
    showFeedback("Déjà trouvé", "invalid");
    return;
  }

  foundWords.add(word);
  const pts = getWordPoints(word);
  const oldScore = parseInt(scoreDisplay.textContent || "0", 10) || 0;
  const newScore = oldScore + pts;
  if (scoreDisplay) scoreDisplay.textContent = newScore.toString();

  updateWordList();
  showFeedback(`+${pts} pts`, "valid");
}

function updateWordList() {
  if (!wordListEl) return;
  wordListEl.innerHTML = "";

  const words = Array.from(foundWords).sort((a, b) =>
    a.localeCompare(b)
  );

  let total = 0;
  words.forEach((w) => {
    const pts = getWordPoints(w);
    total += pts;

    const li = document.createElement("li");

    const spanWord = document.createElement("span");
    spanWord.className = "word-text";
    spanWord.textContent = w;

    const spanScore = document.createElement("span");
    spanScore.className = "word-score";
    spanScore.textContent = pts + " pts";

    li.appendChild(spanWord);
    li.appendChild(spanScore);
    wordListEl.appendChild(li);
  });

  if (scoreDisplay) scoreDisplay.textContent = total.toString();
}

function showFeedback(text, type) {
  if (!feedbackEl) return;
  feedbackEl.textContent = text;
  feedbackEl.className = "feedback visible" + (type ? " " + type : "");
  setTimeout(() => {
    if (feedbackEl.textContent === text) {
      feedbackEl.className = "feedback";
    }
  }, 800);
}

function updateWordDisplay() {
  let word = "";
  selectionPath.forEach((pos) => {
    word += gridData[pos.r][pos.c];
  });
  if (wordDisplay) wordDisplay.textContent = word;
}

// ===========================
// 6. CHANGEMENT TAILLE & LAYOUT
// ===========================

function setGridSize(size) {
  gridSize = size;
  if (gridSizeLabel) gridSizeLabel.textContent = gridSize + "x" + gridSize;

  if (btn4x4) btn4x4.classList.toggle("active", size === 4);
  if (btn5x5) btn5x5.classList.toggle("active", size === 5);

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

  resetGame();
}

function resetGame() {
  foundWords.clear();
  selectionPath = [];
  if (scoreDisplay) scoreDisplay.textContent = "0";
  if (wordDisplay) wordDisplay.textContent = "";
  if (feedbackEl) {
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
  }
  updateWordList();
  generateGrid();
  renderGrid();
}

// ===========================
// 7. BOUTONS
// ===========================

if (btn4x4) btn4x4.addEventListener("click", () => setGridSize(4));
if (btn5x5) btn5x5.addEventListener("click", () => setGridSize(5));

layoutButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const layout = btn.dataset.layout || "A";
    setLayout(layout);
  });
});

if (newGridBtn) {
  newGridBtn.addEventListener("click", () => {
    resetGame();
    showFeedback("Nouvelle grille", "valid");
  });
}

if (clearWordBtn) {
  clearWordBtn.addEventListener("click", () => {
    selectionPath = [];
    updateVisuals();
    showFeedback("Mot effacé", "");
  });
}

// ===========================
// 8. INIT
// ===========================

window.addEventListener("load", () => {
  // layout A par défaut (le plus proche de ton 3x3)
  setLayout("A");
  setGridSize(4);
});
