// ===========================
// 1. VARIABLES & ÉLÉMENTS
// ===========================

let gridSize = 4;
let gridData = [];
let foundWords = new Set();
let selectionPath = [];
let isDragging = false; // Est-ce qu'on est en train de jouer ?

// Lettres (Distribution adaptée pour faire des mots facilement)
const LETTERS = "AAAAABCDEEEEEFGHIIIIJKLMNOOOOPQRSTUUUUUVWXYYZ";

// Éléments HTML
const gridWrapper = document.getElementById("gridWrapper");
const gridEl = document.getElementById("grid");
const wordDisplay = document.getElementById("currentWord");
const feedbackEl = document.getElementById("feedbackMsg");
const scoreDisplay = document.getElementById("scoreDisplay");

// Boutons
const btn4x4 = document.getElementById("btn4x4");
const btn5x5 = document.getElementById("btn5x5");
const newGridBtn = document.getElementById("newGridBtn");
const clearWordBtn = document.getElementById("clearWordBtn");

// Curseurs de réglage
const sizeRange = document.getElementById("gridSizeRange");
const gapRange = document.getElementById("gridGapRange");

// ===========================
// 2. RÉGLAGE LIVE (SLIDERS) - CORRIGÉ POUR MOBILE
// ===========================

function applySliderSettings() {
    if (!gridWrapper || !gridEl) return;

    // 1. GESTION DE LA TAILLE
    const sizeVal = sizeRange.value;
    
    // IMPORTANT : On force le wrapper à ignorer les limites CSS du mobile
    gridWrapper.style.maxWidth = "none"; 
    gridWrapper.style.minWidth = "auto";
    gridWrapper.style.width = sizeVal + "px";

    // 2. GESTION DE L'ESPACEMENT
    const gapVal = gapRange.value;
    gridEl.style.gap = gapVal + "px";
}

// On écoute le mouvement des curseurs
if (sizeRange) sizeRange.addEventListener("input", applySliderSettings);
if (gapRange) gapRange.addEventListener("input", applySliderSettings);

// ===========================
// 3. GÉNÉRATION DE LA GRILLE
// ===========================

function generateGrid() {
    // Création des lettres aléatoires
    gridData = Array.from({ length: gridSize }, () =>
        Array.from({ length: gridSize }, () => {
            const idx = Math.floor(Math.random() * LETTERS.length);
            return LETTERS[idx];
        })
    );
}

function renderGrid() {
    gridEl.innerHTML = "";
    gridEl.className = `grid grid-${gridSize}x${gridSize}`;

    gridData.forEach((row, r) => {
        row.forEach((letter, c) => {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.textContent = letter;
            cell.dataset.r = r;
            cell.dataset.c = c;

            // --- ÉVÉNEMENT DÉBUT DU JEU (TOUCH & SOURIS) ---
            
            // Pour le TACTILE (Téléphone)
            cell.addEventListener("touchstart", (e) => {
                // C'est ICI que ça se joue : on bloque le comportement par défaut
                if (e.cancelable) e.preventDefault(); 
                startDrag(cell);
            }, { passive: false });

            // Pour la SOURIS (PC)
            cell.addEventListener("mousedown", (e) => {
                startDrag(cell);
            });
            cell.addEventListener("mouseenter", (e) => {
                if (isDragging) addToPath(r, c);
            });

            gridEl.appendChild(cell);
        });
    });

    // On réapplique les réglages des sliders pour être sûr
    applySliderSettings();
}

// ===========================
// 4. MOTEUR TACTILE (LA CORRECTION MAJEURE)
// ===========================

// Fonction globale pour empêcher le téléphone de scroller quand on joue
document.addEventListener("touchmove", (e) => {
    // Si on n'est pas en train de jouer, on laisse le scroll normal
    if (!isDragging) return;

    // SINON, ON BLOQUE TOUT SCROLL
    if (e.cancelable) e.preventDefault();

    // Et on calcule sur quelle lettre est le doigt
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);

    // Si le doigt est sur une cellule, on l'ajoute
    if (target && target.classList.contains("cell")) {
        const r = parseInt(target.dataset.r);
        const c = parseInt(target.dataset.c);
        addToPath(r, c);
    }
}, { passive: false }); // "passive: false" est OBLIGATOIRE pour que preventDefault fonctionne

// Fin du jeu (quand on lève le doigt ou la souris)
function endInteraction() {
    if (!isDragging) return;
    isDragging = false;
    validateWord();     // On vérifie le mot
    selectionPath = []; // On vide la mémoire
    updateVisuals();    // On nettoie l'affichage
}

document.addEventListener("touchend", endInteraction);
document.addEventListener("mouseup", endInteraction);

// ===========================
// 5. LOGIQUE DU JEU
// ===========================

function startDrag(cell) {
    isDragging = true;
    selectionPath = [{
        r: parseInt(cell.dataset.r),
        c: parseInt(cell.dataset.c)
    }];
    updateVisuals();
}

function addToPath(r, c) {
    // Gestion du retour en arrière (si on recule d'une case)
    if (selectionPath.length > 1) {
        const prev = selectionPath[selectionPath.length - 2];
        if (prev.r === r && prev.c === c) {
            selectionPath.pop();
            updateVisuals();
            return;
        }
    }

    const last = selectionPath[selectionPath.length - 1];

    // Vérifier si la case est voisine (diagonale incluse)
    const isAdj = Math.abs(last.r - r) <= 1 && Math.abs(last.c - c) <= 1;
    // Vérifier si pas déjà prise
    const isVisited = selectionPath.some(p => p.r === r && p.c === c);

    if (isAdj && !isVisited) {
        selectionPath.push({ r, c });
        updateVisuals();
    }
}

function updateVisuals() {
    // 1. On nettoie tout
    const cells = Array.from(gridEl.children);
    cells.forEach(el => el.classList.remove("selected"));

    let word = "";

    // 2. On colorie le chemin
    selectionPath.forEach(pos => {
        const idx = pos.r * gridSize + pos.c;
        const cell = cells[idx];
        if (cell) {
            cell.classList.add("selected");
            word += gridData[pos.r][pos.c];
        }
    });

    // 3. Affiche le mot en haut
    if(wordDisplay) wordDisplay.textContent = word;
}

function validateWord() {
    const word = wordDisplay.textContent;

    // Règles simples
    if (!word || word.length < 3) {
        if (word.length > 0) showFeedback("Trop court", "invalid");
        return;
    }

    if (foundWords.has(word)) {
        showFeedback("Déjà trouvé", "invalid");
        return;
    }

    // Points
    let pts = 1; 
    if (word.length === 4) pts = 2;
    if (word.length >= 5) pts = word.length;

    foundWords.add(word);

    const currentScore = parseInt(scoreDisplay.textContent) || 0;
    scoreDisplay.textContent = currentScore + pts;

    showFeedback(`+${pts} pts`, "valid");
}

function showFeedback(text, type) {
    if(!feedbackEl) return;
    feedbackEl.textContent = text;
    feedbackEl.className = "feedback visible " + type;
    setTimeout(() => {
        feedbackEl.className = "feedback";
    }, 1000);
}

// ===========================
// 6. INITIALISATION & BOUTONS
// ===========================

function setGridSize(size) {
    gridSize = size;
    
    // Visuel des boutons
    if (size === 4) {
        btn4x4.classList.add("active");
        btn5x5.classList.remove("active");
    } else {
        btn5x5.classList.add("active");
        btn4x4.classList.remove("active");
    }

    resetGame();
}

function resetGame() {
    foundWords.clear();
    selectionPath = [];
    scoreDisplay.textContent = "0";
    wordDisplay.textContent = "";
    generateGrid();
    renderGrid();
}

// Écouteurs Boutons
if(btn4x4) btn4x4.addEventListener("click", () => setGridSize(4));
if(btn5x5) btn5x5.addEventListener("click", () => setGridSize(5));

if(newGridBtn) newGridBtn.addEventListener("click", () => {
    resetGame();
    showFeedback("Nouvelle grille", "valid");
});

if(clearWordBtn) clearWordBtn.addEventListener("click", () => {
    selectionPath = [];
    updateVisuals();
});

// Lancement au démarrage
window.addEventListener("load", () => {
    setGridSize(4);
});