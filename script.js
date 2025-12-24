// ===========================
// 1. VARIABLES & ÉLÉMENTS
// ===========================

let gridSize = 4;            
let gridData = [];           
let foundWords = new Set();  
let selectionPath = [];      
let isDragging = false;

// Lettres (Beaucoup de voyelles pour faciliter les mots)
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

// NOUVEAU : Les curseurs de réglage
const sizeRange = document.getElementById("gridSizeRange");
const gapRange = document.getElementById("gridGapRange");

// ===========================
// 2. LOGIQUE DES CURSEURS (RÉGLAGE LIVE)
// ===========================

function applySliderSettings() {
    if (!gridWrapper || !gridEl) return;
    
    // Appliquer la taille globale
    const sizeVal = sizeRange.value;
    gridWrapper.style.width = sizeVal + "px";
    
    // Appliquer l'espacement (gap)
    const gapVal = gapRange.value;
    gridEl.style.gap = gapVal + "px";
}

// Écouteurs pour modifier en direct
sizeRange.addEventListener("input", applySliderSettings);
gapRange.addEventListener("input", applySliderSettings);

// ===========================
// 3. GÉNÉRATION DE LA GRILLE
// ===========================

function generateGrid() {
    gridData = Array.from({ length: gridSize }, () =>
        Array.from({ length: gridSize }, () => {
            const idx = Math.floor(Math.random() * LETTERS.length);
            return LETTERS[idx];
        })
    );
}

function renderGrid() {
    gridEl.innerHTML = "";
    
    // Change la classe CSS pour la grille (4x4 ou 5x5)
    gridEl.className = `grid grid-${gridSize}x${gridSize}`;

    gridData.forEach((row, r) => {
        row.forEach((letter, c) => {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.textContent = letter;
            cell.dataset.r = r;
            cell.dataset.c = c;

            // --- INTERACTION SOURIS (PC) ---
            cell.addEventListener("mousedown", (e) => {
                startDrag(cell);
            });
            cell.addEventListener("mouseenter", (e) => {
                if (isDragging) addToPath(r, c);
            });

            // --- INTERACTION TACTILE (DÉBUT) ---
            cell.addEventListener("touchstart", (e) => {
                // Empêche le comportement par défaut (zoom, sélection)
                e.preventDefault(); 
                startDrag(cell);
            }, { passive: false });

            gridEl.appendChild(cell);
        });
    });
    
    // Appliquer les réglages des curseurs tout de suite
    applySliderSettings();
}

// ===========================
// 4. MOTEUR TACTILE FLUIDE
// ===========================

// Cette fonction suit le doigt partout sur l'écran
document.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    
    // 1. BLOQUER LE SCROLL (Vital !)
    if (e.cancelable) e.preventDefault();
    
    // 2. TROUVER L'ÉLÉMENT SOUS LE DOIGT
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // 3. SI C'EST UNE CASE, ON L'AJOUTE
    if (target && target.classList.contains("cell")) {
        const r = parseInt(target.dataset.r);
        const c = parseInt(target.dataset.c);
        addToPath(r, c);
    }
}, { passive: false }); // "passive: false" est OBLIGATOIRE pour preventDefault

// Fin du geste (souris ou tactile)
const endInteraction = () => {
    if (!isDragging) return;
    isDragging = false;
    validateWord();
    selectionPath = []; // Reset interne
    updateVisuals();    // Reset visuel
};

document.addEventListener("mouseup", endInteraction);
document.addEventListener("touchend", endInteraction);

// ===========================
// 5. LOGIQUE DE JEU (CHEMIN & VALIDATION)
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
    // Vérifier si on revient en arrière (pour annuler la dernière lettre)
    if (selectionPath.length > 1) {
        const prev = selectionPath[selectionPath.length - 2];
        if (prev.r === r && prev.c === c) {
            selectionPath.pop();
            updateVisuals();
            return;
        }
    }

    const last = selectionPath[selectionPath.length - 1];
    
    // Vérifier si la case est voisine (diagonales comprises)
    const isAdj = Math.abs(last.r - r) <= 1 && Math.abs(last.c - c) <= 1;
    
    // Vérifier si on est déjà passé par là
    const isVisited = selectionPath.some(p => p.r === r && p.c === c);

    if (isAdj && !isVisited) {
        selectionPath.push({ r, c });
        updateVisuals();
    }
}

function updateVisuals() {
    // Retirer la sélection visuelle de toutes les cases
    const cells = Array.from(gridEl.children);
    cells.forEach(el => el.classList.remove("selected"));

    let word = "";
    
    // Ajouter la sélection aux cases du chemin actuel
    selectionPath.forEach(pos => {
        const idx = pos.r * gridSize + pos.c;
        const cell = cells[idx];
        if (cell) {
            cell.classList.add("selected");
            word += gridData[pos.r][pos.c];
        }
    });

    wordDisplay.textContent = word;
}

function validateWord() {
    const word = wordDisplay.textContent;
    
    if (!word || word.length < 3) {
        if(word.length > 0) showFeedback("Trop court", "invalid");
        return;
    }

    if (foundWords.has(word)) {
        showFeedback("Déjà trouvé", "invalid");
        return;
    }

    // Calcul des points (simple)
    let pts = 1;
    if (word.length === 4) pts = 2;
    if (word.length >= 5) pts = word.length;

    foundWords.add(word);
    
    // Mise à jour score
    const currentScore = parseInt(scoreDisplay.textContent) || 0;
    scoreDisplay.textContent = currentScore + pts;
    
    showFeedback(`+${pts} pts`, "valid");
}

function showFeedback(text, type) {
    feedbackEl.textContent = text;
    feedbackEl.className = "feedback visible " + type;
    setTimeout(() => {
        feedbackEl.className = "feedback";
    }, 1000);
}

// ===========================
// 6. BOUTONS & INIT
// ===========================

function setGridSize(size) {
    gridSize = size;
    // Boutons actifs
    if(size === 4) { btn4x4.classList.add("active"); btn5x5.classList.remove("active"); }
    else { btn5x5.classList.add("active"); btn4x4.classList.remove("active"); }
    
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

btn4x4.addEventListener("click", () => setGridSize(4));
btn5x5.addEventListener("click", () => setGridSize(5));

newGridBtn.addEventListener("click", () => {
    resetGame();
    showFeedback("Nouvelle grille", "valid");
});

clearWordBtn.addEventListener("click", () => {
    selectionPath = [];
    updateVisuals();
});

// Démarrage
window.addEventListener("load", () => {
    setGridSize(4);
});