// Petit outil juste pour tester les tailles des grilles 4x4 / 5x5

let currentSize = 4;
let currentLayout = "a";

const gridEl = document.getElementById("grid");
const infoText = document.getElementById("infoText");

const sizeButtons = document.querySelectorAll(".size-btn");
const layoutButtons = document.querySelectorAll(".layout-btn");

// Génère des lettres aléatoires juste pour remplir la grille
const LETTERS = "EERARISTONLUMPDGCQBFHVY";

function generateLetters(size) {
  const total = size * size;
  const arr = [];
  for (let i = 0; i < total; i++) {
    const ch = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    arr.push(ch);
  }
  return arr;
}

function renderGrid() {
  if (!gridEl) return;

  // Nettoyage classes
  gridEl.classList.remove("grid-4x4", "grid-5x5", "layout-a", "layout-b", "layout-c");

  // Ajout classes selon config
  if (currentSize === 4) gridEl.classList.add("grid-4x4");
  if (currentSize === 5) gridEl.classList.add("grid-5x5");
  gridEl.classList.add("layout-" + currentLayout);

  // Grille CSS
  gridEl.style.gridTemplateColumns = `repeat(${currentSize}, 1fr)`;

  // Remplir avec des lettres
  const letters = generateLetters(currentSize);
  gridEl.innerHTML = "";
  letters.forEach((ch) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = ch;
    gridEl.appendChild(cell);
  });

  // Texte info
  if (infoText) {
    infoText.textContent = `Mode : ${currentSize}x${currentSize} – Version ${currentLayout.toUpperCase()}`;
  }
}

// Gestion boutons taille
sizeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const size = parseInt(btn.dataset.size, 10);
    if (size === currentSize) return;

    currentSize = size;

    sizeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Quand on change de taille, on reste sur la même version (A/B/C)
    renderGrid();
  });
});

// Gestion boutons layout
layoutButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const layout = btn.dataset.layout;
    if (layout === currentLayout) return;

    currentLayout = layout;

    layoutButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    renderGrid();
  });
});

// Premier rendu
window.addEventListener("load", renderGrid);
