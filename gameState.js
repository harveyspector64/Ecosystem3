export const gameState = {
    selectedEmoji: null,
    draggedElement: null,
    firstBirdLanded: false,
    bushesPlanted: 0,
    treesPlanted: 0,
    butterflies: []
};

export function setSelectedEmoji(emoji) {
    gameState.selectedEmoji = emoji;
}

export function setDraggedElement(element) {
    gameState.draggedElement = element;
}

export function setFirstBirdLanded() {
    gameState.firstBirdLanded = true;
}

export function incrementBushesPlanted() {
    gameState.bushesPlanted++;
}

export function incrementTreesPlanted() {
    gameState.treesPlanted++;
}

export function addButterfly(butterfly) {
    gameState.butterflies.push(butterfly);
}

export function removeButterfly(butterfly) {
    const index = gameState.butterflies.indexOf(butterfly);
    if (index > -1) {
        gameState.butterflies.splice(index, 1);
    }
}

// Expose gameState to the window object for global access
window.gameState = gameState;
