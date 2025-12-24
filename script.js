// ===========================
// 1. VARIABLES & ÉLÉMENTS
// ===========================

// Mode d'interaction (1 = basique, 2 = optimisé, 3 = pointer + aimant)
// Tu peux changer facilement ici pour tester la fluidité :
let INTERACTION_MODE = 3;

let gridSize = 4;
let gridData = [];
let foundWords = new Set();
let selectionPath = [];
let isDragging = false;

// Pour Pointer Events (mode 3)
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

// Boutons
const btn4x4 = document.getElementById("btn4x4");
const btn5x5 = document.getElementById("btn5x5");
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

    // 1. GESTION DE LA TAILLE
    const sizeVal = sizeRange ? sizeRange.value : 320;

    // On force le wrapper à ignorer les limites CSS du mobile
    gridWrapper.style.maxWidth = "none";
    gridWrapper.style.minWidth = "auto";
    gridWrapper.style.width = sizeVal + "px";

    // 2. GESTION DE L'ESPACEMENT
    const gapVal = gapRange ? gapRange.value : 4;
    gridEl.style.gap = gapVal + "px";

    // Recalcule les dimensions pour le mode 3 (aimant)
    updateGridGeometry();
}

if (sizeRange) sizeRange.addEventListener("input", applySliderSettings);
if (gapRange) gapRange.addEventListener("input", applySliderSettings);


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
    gridEl.className = `grid grid-${gridSize}x${gridSize}`;

    gridData.forEach((row, r) => {
        row.forEach((letter, c) => {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.textContent = letter;
            cell.dataset.r = r;
            cell.dataset.c = c;

            // ===========================
            // ÉVÈNEMENTS SELON LE MODE
            // ===========================

            if (INTERACTION_MODE === 1) {
                // ----- MODE 1 : CLASSIQUE (proche de ton code de base) -----
                cell.addEventListener("touchstart", (e) => {
                    if (e.cancelable) e.preventDefault();
                    startDragFromCell(cell);
                }, { passive: false });

                cell.addEventListener("mousedown", () => {
                    startDragFromCell(cell);
                });

                cell.addEventListener("mouseenter", () => {
                    if (isDragging) {
                        const rr = parseInt(cell.dataset.r);
                        const cc = parseInt(cell.dataset.c);
                        addToPath(rr, cc);
                    }
                });

            } else if (INTERACTION_MODE === 2) {
                // ----- MODE 2 : CLASSIQUE + optimisations légères -----
                cell.addEventListener("touchstart", (e) => {
                    if (e.cancelable) e.preventDefault();
                    startDragFromCell(cell);
                }, { passive: false });

                cell.addEventListener("mousedown", (e) => {
                    e.preventDefault(); // évite la sélection de texte sur PC
                    startDragFromCell(cell);
                });

                // On ne se repose plus trop sur mouseenter ici, on passe plutôt
                // par le document touchmove / mousemove. Ça limite les ratés.
                // Mais on garde pour la souris, ça reste agréable :
                cell.addEventListener("mouseenter", () => {
                    if (isDragging && !isTouchActive) {
                        const rr = parseInt(cell.dataset.r);
                        const cc = parseInt(cell.dataset.c);
                        addToPath(rr, cc);
                    }
                });

            } else {
                // ----- MODE 3 : POINTER EVENTS + AIMANT -----
                // On ne met RIEN ici, tout se fait au niveau de gridEl
                // via pointerdown/pointermove/pointerup.
            }

            gridEl.appendChild(cell);
        });
    });

    // Pour le mode 3, on installe / réinstalle les pointer events
    if (INTERACTION_MODE === 3) {
        setupPointerEventsMode3();
    }

    // On réapplique les réglages des sliders pour être sûr
    applySliderSettings();
}


// ===========================
// 4. INTERACTIONS GLOBALES
// ===========================

let isTouchActive = false; // Pour différencier souris / tactile en mode 2

function startDragFromCell(cell) {
    isDragging = true;
    const r = parseInt(cell.dataset.r);
    const c = parseInt(cell.dataset.c);
    selectionPath = [{ r, c }];
    updateVisuals();
}

// Ajout générique d'une case dans le chemin
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

// Met à jour l'affichage des cellules sélectionnées + le mot en haut
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

// Fin du tracé (tactile ou souris)
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
// 5. MODE 1 & 2 : TOUCHMOVE / MOUSEMOVE GLOBAL
// ===========================

if (INTERACTION_MODE === 1 || INTERACTION_MODE === 2) {
    document.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
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
        if (!isDragging || isTouchActive) return;
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (target && target.classList.contains("cell")) {
            const r = parseInt(target.dataset.r);
            const c = parseInt(target.dataset.c);
            addToPath(r, c);
        }
    });

    document.addEventListener("touchend", endInteraction);
    document.addEventListener("mouseup", endInteraction);
}


// ===========================
// 6. MODE 3 : POINTER EVENTS + AIMANT
// ===========================

function updateGridGeometry() {
    if (!gridEl) return;
    gridRect = gridEl.getBoundingClientRect();
    cellWidth = gridRect.width / gridSize;
    cellHeight = gridRect.height / gridSize;
}

function setupPointerEventsMode3() {
    // On enlève d'abord d'anciens listeners éventuels
    gridEl.onpointerdown = null;
    gridEl.onpointermove = null;
    gridEl.onpointerup = null;
    gridEl.onpointercancel = null;
    gridEl.onpointerleave = null;

    if (!window.PointerEvent) {
        // Si le navigateur ne supporte pas PointerEvent, on redescend en mode 2
        INTERACTION_MODE = 2;
        return;
    }

    updateGridGeometry();

    gridEl.onpointerdown = (e) => {
        // On ne gère que le doigt ou la souris
        if (e.pointerType !== "touch" && e.pointerType !== "mouse") return;

        if (e.cancelable) e.preventDefault();

        activePointerId = e.pointerId;
        isDragging = true;
        isTouchActive = (e.pointerType === "touch");

        gridEl.setPointerCapture(activePointerId);

        // On calcule la case de départ via l'aimant
        const { r, c } = getCellFromPointer(e.clientX, e.clientY);
        if (r !== null && c !== null) {
            selectionPath = [{ r, c }];
            updateVisuals();
        }
    };

    gridEl.onpointermove = (e) => {
        if (!isDragging || e.pointerId !== activePointerId) return;
        if (e.cancelable) e.preventDefault();

        const { r, c } = getCellFromPointer(e.clientX, e.clientY);
        if (r !== null && c !== null) {
            addToPath(r, c);
        }
    };

    const stop = (e) => {
        if (e.pointerId !== activePointerId) return;
        endInteraction();
        try {
            gridEl.releasePointerCapture(activePointerId);
        } catch (err) {
            // Pas grave si déjà relâché
        }
    };

    gridEl.onpointerup = stop;
    gridEl.onpointercancel = stop;
    gridEl.onpointerleave = stop;
}

// Convertit une position (x,y) en indices (r,c) dans la grille
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

    // Sécurité
    if (c < 0 || c >= gridSize || r < 0 || r >= gridSize) {
        return { r: null, c: null };
    }

    return { r, c };
}


// ===========================
// 7. LOGIQUE DU JEU
// ===========================

function validateWord() {
    const word = wordDisplay ? wordDisplay.textContent : "";

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
    if (!feedbackEl) return;
    feedbackEl.textContent = text;
    feedbackEl.className = "feedback visible " + type;
    setTimeout(() => {
        feedbackEl.className = "feedback";
    }, 1000);
}


// ===========================
// 8. INITIALISATION & BOUTONS
// ===========================

function setGridSize(size) {
    gridSize = size;

    // Visuel des boutons
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

// Fin de drag global (sécurité au cas où)
document.addEventListener("mouseup", endInteraction);
document.addEventListener("touchend", endInteraction);

// Lancement au démarrage
window.addEventListener("load", () => {
    setGridSize(4);
});
