// utils.js

// Random time generator
export function getRandomTime(min, max) {
    return Math.random() * (max - min) + min;
}

// Get random edge position for butterflies
export function getRandomEdgePosition(axis, playArea) {
    if (axis === 'x') {
        return Math.random() > 0.5 ? 0 : playArea.clientWidth - 20;
    } else {
        return Math.random() > 0.5 ? 0 : playArea.clientHeight - 20;
    }
}

// Get bush position
export function getBushPosition(bush) {
    return {
        x: parseFloat(bush.style.left),
        y: parseFloat(bush.style.top)
    };
}

// Calculate distance between two positions
export function getDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx*dx + dy*dy);
}

// Get emoji name
export function getEmojiName(emoji) {
    switch(emoji) {
        case EMOJIS.BUSH: return 'bush';
        case EMOJIS.TREE: return 'tree';
        case EMOJIS.BUTTERFLY: return 'butterfly';
        case EMOJIS.BIRD: return 'bird';
        case EMOJIS.WORM: return 'worm';
        default: return 'creature';
    }
}

// Get nearest tree (for birds)
export function getNearestTree(bird) {
    const trees = document.querySelectorAll('.tree');
    let nearestTree = null;
    let minDistance = Infinity;

    trees.forEach(tree => {
        const treeX = parseFloat(tree.style.left);
        const treeY = parseFloat(tree.style.top);
        const distance = Math.sqrt((treeX - parseFloat(bird.style.left)) ** 2 + (treeY - parseFloat(bird.style.top)) ** 2);

        if (distance < minDistance) {
            minDistance = distance;
            nearestTree = tree;
        }
    });

    return nearestTree;
}
