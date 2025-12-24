// ===========================
// 1. VARIABLES & ÉLÉMENTS
// ===========================

// Mode d'interaction actuel (1, 2, 3 ou 4)
let INTERACTION_MODE = 3; // par défaut : le plus fluide (ton ancien mode 3)

let gridSize = 4;
let gridData = [];
let foundWords = new Set();
let selectionPath = [];
let isDragging = false;
let isTouchActive = false;

// Pour les modes 3 & 4 (Pointer Events + "aimant")
let activePointerId = null;
let gridRect = null;
let cellWidth = 0;
let cellHeight = 0;

// Lettres (Distribution adaptée pour faire des mots facilement)
const LETTERS = "AAAAABCDEEEEEFGHIIIIJKLMNOOOOPQRSTUUUUUVWXYYZ";

// Éléments HTML
const gridWrapper = document.getElementById("gridWrapper");
const gridEl = document.getElementById("grid");
const wordDisplay = document.getElementById("currentWord");
const feedbackEl = document.getElementById("feedbackMsg");
const scoreDisplay = document.getElementById("scoreDisplay");

// Boutons de taille de grille
const btn4x4 = document.getElementById("btn4x4");
const btn5x5 = document.getElementById("btn5x5");

// Boutons mode d'interaction
const mode1Btn = document.getElementById("mode1Btn");
const mode2Btn = document.getElementById("mode2Btn");
const mode3Btn = document.getElementById("mode3Btn");
// 🔹 Nouveau bouton optionnel pour le mode 4
const mode4Btn = document.getElementById("mode4Btn");

// Boutons divers
const newGridBtn = document.getElementById("newGridBtn");
const clearWordBtn = document.getElementById("clearWordBtn");

// Curseurs de réglage
const sizeRange = document.getElementById("gridSizeRange");
const gapRange = document.getElementById("gridGapRange");


// ===========================
// 2. RÉGLAGE LIVE (SLIDERS)
// ===========================

function applySliderSettings() {
    if (!gridWrapper || !gridEl) return;

    const sizeVal = sizeRange ? sizeRange.value : 320;
    const gapVal = gapRange ? gapRange.value : 4;

    gridWrapper.style.maxWidth = "none";
    gridWrapper.style.minWidth = "auto";
    gridWrapper.style.width = sizeVal + "px";

    gridEl.style.gap = gapVal + "px";

    updateGridGeometry();
}

if (sizeRange) sizeRange.addEventListener("input", applySliderSettings);
if (gapRange)  gapRange.addEventListener("input", applySliderSettings);


// ===========================
// 3. GÉNÉRATION & AFFICHAGE GRILLE
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
    gridEl.className = `grid grid-${gridSize}x${gridSize}`;

    gridData.forEach((row, r) => {
        row.forEach((letter, c) => {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.textContent = letter;
            cell.dataset.r = r;
            cell.dataset.c = c;

            // --- ÉVÈNEMENTS SELON LE MODE (mais on check INTERACTION_MODE dans les handlers) ---

            // Tactile classique (Modes 1 & 2)
            cell.addEventListener("touchstart", (e) => {
                if (INTERACTION_MODE === 3 || INTERACTION_MODE === 4) return; // en modes 3 & 4, on passe par pointer events
                if (e.cancelable) e.preventDefault();
                startDragFromCell(cell, "touch");
            }, { passive: false });

            // Souris classique (Modes 1 & 2)
            cell.addEventListener("mousedown", (e) => {
                if (INTERACTION_MODE === 3 || INTERACTION_MODE === 4) return;
                e.preventDefault();
                startDragFromCell(cell, "mouse");
            });

            // Déplacement souris sur les cases (utile sur PC)
            cell.addEventListener("mouseenter", () => {
                if (!isDragging) return;
                if (INTERACTION_MODE !== 1 && INTERACTION_MODE !== 2) return;
                if (isTouchActive) return; // si tactile actif, on ignore la souris

                const rr = parseInt(cell.dataset.r);
                const cc = parseInt(cell.dataset.c);
                addToPath(rr, cc);
            });

            gridEl.appendChild(cell);
        });
    });

    // Pointer Events (Modes 3 & 4)
    setupPointerEventsMode3();

    applySliderSettings();
}


// ===========================
// 4. INTERACTION DE BASE
// ===========================

function startDragFromCell(cell, source = "mouse") {
    isDragging = true;
    isTouchActive = (source === "touch");

    const r = parseInt(cell.dataset.r);
    const c = parseInt(cell.dataset.c);

    selectionPath = [{ r, c }];
    updateVisuals();
}

function addToPath(r, c) {
    if (selectionPath.length > 1) {
        const prev = selectionPath[selectionPath.length - 2];
        if (prev.r === r && prev.c === c) {
            selectionPath.pop();
            updateVisuals();
            return;
        }
    }

    const last = selectionPath[selectionPath.length - 1];

    const isAdj = Math.abs(last.r - r) <= 1 && Math.abs(last.c - c) <= 1;
    const isVisited = selectionPath.some(p => p.r === r && p.c === c);

    if (isAdj && !isVisited) {
        selectionPath.push({ r, c });
        updateVisuals();
    }
}

function updateVisuals() {
    const cells = Array.from(gridEl.children);
    cells.forEach(el => el.classList.remove("selected"));

    let word = "";

    selectionPath.forEach(pos => {
        const idx = pos.r * gridSize + pos.c;
        const cell = cells[idx];
        if (cell) {
            cell.classList.add("selected");
            word += gridData[pos.r][pos.c];
        }
    });

    if (wordDisplay) wordDisplay.textContent = word;
}

function endInteraction() {
    if (!isDragging) return;
    isDragging = false;
    isTouchActive = false;
    activePointerId = null;
    validateWord();
    selectionPath = [];
    updateVisuals();
}


// ===========================
// 5. GESTION MOUVEMENTS GLOBALS (Modes 1 & 2)
// ===========================

document.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    if (INTERACTION_MODE !== 1 && INTERACTION_MODE !== 2) return;

    if (e.cancelable) e.preventDefault();
    isTouchActive = true;

    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);

    if (target && target.classList.contains("cell")) {
        const r = parseInt(target.dataset.r);
        const c = parseInt(target.dataset.c);
        addToPath(r, c);
    }
}, { passive: false });

document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    if (INTERACTION_MODE !== 1 && INTERACTION_MODE !== 2) return;
    if (isTouchActive) return;

    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (target && target.classList.contains("cell")) {
        const r = parseInt(target.dataset.r);
        const c = parseInt(target.dataset.c);
        addToPath(r, c);
    }
});

document.addEventListener("touchend", endInteraction);
document.addEventListener("mouseup", endInteraction);


// ===========================
// 6. MODES 3 & 4 : POINTER EVENTS + "AIMANT"
// ===========================

function updateGridGeometry() {
    if (!gridEl) return;
    gridRect = gridEl.getBoundingClientRect();
    cellWidth = gridRect.width / gridSize;
    cellHeight = gridRect.height / gridSize;
}

function setupPointerEventsMode3() {
    // On nettoie les anciens handlers
    gridEl.onpointerdown = null;
    gridEl.onpointermove = null;
    gridEl.onpointerup = null;
    gridEl.onpointercancel = null;
    gridEl.onpointerleave = null;

    if (!window.PointerEvent) return; // certains vieux navigateurs

    updateGridGeometry();

    gridEl.onpointerdown = (e) => {
        // 🔹 Pointer events utilisés pour les modes 3 & 4
        if (INTERACTION_MODE !== 3 && INTERACTION_MODE !== 4) return;

        if (e.pointerType !== "touch" && e.pointerType !== "mouse") return;
        if (e.cancelable) e.preventDefault();

        activePointerId = e.pointerId;
        isDragging = true;
        isTouchActive = (e.pointerType === "touch");

        gridEl.setPointerCapture(activePointerId);

        // Mode 3 : aimant "classique" (floor)
        // Mode 4 : on prend la cellule dont le centre est le plus proche du doigt
        const rc = (INTERACTION_MODE === 4)
            ? getCellFromPointerNearest(e.clientX, e.clientY)
            : getCellFromPointer(e.clientX, e.clientY);

        const { r, c } = rc;
        if (r !== null && c !== null) {
            selectionPath = [{ r, c }];
            updateVisuals();
        }
    };

    gridEl.onpointermove = (e) => {
        if (INTERACTION_MODE !== 3 && INTERACTION_MODE !== 4) return;
        if (!isDragging || e.pointerId !== activePointerId) return;

        if (e.cancelable) e.preventDefault();

        const rc = (INTERACTION_MODE === 4)
            ? getCellFromPointerNearest(e.clientX, e.clientY)
            : getCellFromPointer(e.clientX, e.clientY);

        const { r, c } = rc;
        if (r !== null && c !== null) {
            addToPath(r, c);
        }
    };

    const stop = (e) => {
        if (INTERACTION_MODE !== 3 && INTERACTION_MODE !== 4) return;
        if (e.pointerId !== activePointerId) return;
        endInteraction();
        try {
            gridEl.releasePointerCapture(activePointerId);
        } catch (_) {}
    };

    gridEl.onpointerup = stop;
    gridEl.onpointercancel = stop;
    gridEl.onpointerleave = stop;
}

// Mode 3 : version "classique" (ta version actuelle)
function getCellFromPointer(clientX, clientY) {
    if (!gridRect || cellWidth === 0 || cellHeight === 0) {
        updateGridGeometry();
        if (!gridRect) return { r: null, c: null };
    }

    const x = clientX - gridRect.left;
    const y = clientY - gridRect.top;

    if (x < 0 || y < 0 || x > gridRect.width || y > gridRect.height) {
        return { r: null, c: null };
    }

    let c = Math.floor(x / cellWidth);
    let r = Math.floor(y / cellHeight);

    if (c < 0 || c >= gridSize || r < 0 || r >= gridSize) {
        return { r: null, c: null };
    }

    return { r, c };
}

// 🔹 Mode 4 : on choisit la cellule dont le CENTRE est le plus proche du doigt
// → beaucoup plus propre pour les diagonales
function getCellFromPointerNearest(clientX, clientY) {
    if (!gridRect || cellWidth === 0 || cellHeight === 0) {
        updateGridGeometry();
        if (!gridRect) return { r: null, c: null };
    }

    const x = clientX - gridRect.left;
    const y = clientY - gridRect.top;

    // Si le doigt est hors de la zone de grille → ne rien ajouter
    if (x < 0 || y < 0 || x > gridRect.width || y > gridRect.height) {
        return { r: null, c: null };
    }

    let bestR = null;
    let bestC = null;
    let bestDist2 = Infinity;

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const centerX = (c + 0.5) * cellWidth;
            const centerY = (r + 0.5) * cellHeight;
            const dx = x - centerX;
            const dy = y - centerY;
            const dist2 = dx * dx + dy * dy;

            if (dist2 < bestDist2) {
                bestDist2 = dist2;
                bestR = r;
                bestC = c;
            }
        }
    }

    return { r: bestR, c: bestC };
}


// ===========================
// 7. LOGIQUE DU JEU
// ===========================

function validateWord() {
    const word = wordDisplay ? wordDisplay.textContent : "";

    if (!word || word.length < 3) {
        if (word.length > 0) showFeedback("Trop court", "invalid");
        return;
    }

    if (foundWords.has(word)) {
        showFeedback("Déjà trouvé", "invalid");
        return;
    }

    let pts = 1;
    if (word.length === 4) pts = 2;
    if (word.length >= 5) pts = word.length;

    foundWords.add(word);

    const currentScore = parseInt(scoreDisplay.textContent) || 0;
    scoreDisplay.textContent = currentScore + pts;

    showFeedback(`+${pts} pts`, "valid");
}

function showFeedback(text, type) {
    if (!feedbackEl) return;
    feedbackEl.textContent = text;
    feedbackEl.className = "feedback visible " + type;
    setTimeout(() => {
        feedbackEl.className = "feedback";
    }, 1000);
}


// ===========================
// 8. CHANGEMENT DE MODE (BOUTONS)
// ===========================

function updateModeButtons() {
    if (!mode1Btn || !mode2Btn || !mode3Btn) return;

    mode1Btn.classList.toggle("active", INTERACTION_MODE === 1);
    mode2Btn.classList.toggle("active", INTERACTION_MODE === 2);
    mode3Btn.classList.toggle("active", INTERACTION_MODE === 3);

    if (mode4Btn) {
        mode4Btn.classList.toggle("active", INTERACTION_MODE === 4);
    }
}

function setInteractionMode(mode) {
    if (![1, 2, 3, 4].includes(mode)) return;
    INTERACTION_MODE = mode;
    endInteraction();       // on coupe tout drag en cours
    selectionPath = [];
    updateVisuals();
    updateModeButtons();
    setupPointerEventsMode3(); // réinitialise les pointer events si besoin
}

if (mode1Btn) mode1Btn.addEventListener("click", () => setInteractionMode(1));
if (mode2Btn) mode2Btn.addEventListener("click", () => setInteractionMode(2));
if (mode3Btn) mode3Btn.addEventListener("click", () => setInteractionMode(3));
if (mode4Btn) mode4Btn.addEventListener("click", () => setInteractionMode(4)); // 🔹 nouveau


// ===========================
// 9. INITIALISATION & BOUTONS GRILLE
// ===========================

function setGridSize(size) {
    gridSize = size;

    if (btn4x4 && btn5x5) {
        if (size === 4) {
            btn4x4.classList.add("active");
            btn5x5.classList.remove("active");
        } else {
            btn5x5.classList.add("active");
            btn4x4.classList.remove("active");
        }
    }

    resetGame();
}

function resetGame() {
    foundWords.clear();
    selectionPath = [];
    if (scoreDisplay) scoreDisplay.textContent = "0";
    if (wordDisplay) wordDisplay.textContent = "";
    generateGrid();
    renderGrid();
}

if (btn4x4) btn4x4.addEventListener("click", () => setGridSize(4));
if (btn5x5) btn5x5.addEventListener("click", () => setGridSize(5));

if (newGridBtn) newGridBtn.addEventListener("click", () => {
    resetGame();
    showFeedback("Nouvelle grille", "valid");
});

if (clearWordBtn) clearWordBtn.addEventListener("click", () => {
    selectionPath = [];
    updateVisuals();
});

// Sécurité globale
document.addEventListener("mouseup", endInteraction);
document.addEventListener("touchend", endInteraction);

// Lancement au chargement
window.addEventListener("load", () => {
    setGridSize(4);
    setInteractionMode(3); // on démarre en mode 3 (comme avant)
});
