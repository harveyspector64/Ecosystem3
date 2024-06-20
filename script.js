// Performance monitor
const performanceMonitor = {
    frameCount: 0,
    lastTime: performance.now(),
    fps: 0,

    update: function() {
        this.frameCount++;
        const currentTime = performance.now();
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            console.log(`Current FPS: ${this.fps}`);
        }
    }
};

// Main game loop
function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);
    
    // Update game state here
    updateButterflies();
    updateBirds();
    updateWorms();
    
    performanceMonitor.update();
}

// Game state
let playArea, emojiPanel, eventMenu;
let selectedEmoji = null;
let draggedElement = null;
let firstBirdLanded = false;

document.addEventListener('DOMContentLoaded', () => {
    playArea = document.getElementById('play-area');
    emojiPanel = document.getElementById('emoji-panel');
    eventMenu = document.getElementById('event-menu');

    initializeGame();
    requestAnimationFrame(gameLoop);
});

function initializeGame() {
    initializeEmojis();
    setupEventListeners();
}

function initializeEmojis() {
    INITIAL_EMOJIS.forEach(item => {
        const element = document.getElementById(item.id);
        if (item.disabled) {
            element.classList.add('disabled');
            element.setAttribute('draggable', 'false');
        } else {
            element.setAttribute('draggable', 'true');
        }
    });
}

function setupEventListeners() {
    emojiPanel.addEventListener('dragstart', handleDragStart);
    playArea.addEventListener('dragover', (e) => e.preventDefault());
    playArea.addEventListener('drop', handleDrop);
    emojiPanel.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
}

function handleDragStart(e) {
    const draggedElement = e.target;
    if (draggedElement && draggedElement.classList.contains('emoji')) {
        selectedEmoji = draggedElement.textContent;
        e.dataTransfer.setData('text/plain', draggedElement.textContent);
        console.log(`Emoji selected: ${selectedEmoji}`);
    }
}

function handleDrop(e) {
    e.preventDefault();
    const x = e.clientX - playArea.offsetLeft;
    const y = e.clientY - playArea.offsetTop;
    const emoji = e.dataTransfer.getData('text/plain');
    if (emoji) {
        console.log(`Placing emoji: ${emoji} at (${x}, ${y})`);
        addEmojiToPlayArea(emoji, x, y, playArea);
        selectedEmoji = null;
    } else {
        console.log('No emoji selected');
    }
}

function handleTouchStart(e) {
    const touchedElement = e.target;
    if (touchedElement && touchedElement.classList.contains('emoji')) {
        selectedEmoji = touchedElement.textContent;
        draggedElement = touchedElement.cloneNode(true);
        draggedElement.style.position = 'absolute';
        draggedElement.style.pointerEvents = 'none';
        document.body.appendChild(draggedElement);
        console.log(`Emoji touched: ${selectedEmoji}`);
    }
}

function handleTouchMove(e) {
    if (draggedElement) {
        const touch = e.touches[0];
        draggedElement.style.left = `${touch.clientX - 15}px`;
        draggedElement.style.top = `${touch.clientY - 15}px`;
    }
}

function handleTouchEnd(e) {
    if (selectedEmoji && draggedElement) {
        const touch = e.changedTouches[0];
        const x = touch.clientX - playArea.offsetLeft;
        const y = touch.clientY - playArea.offsetTop;
        console.log(`Placing emoji: ${selectedEmoji} at (${x}, ${y})`);
        addEmojiToPlayArea(selectedEmoji, x, y, playArea);
        document.body.removeChild(draggedElement);
        draggedElement = null;
        selectedEmoji = null;
    } else {
        console.log('No emoji selected');
    }
}

function addEmojiToPanel(emoji, id) {
    const emojiElement = document.createElement('div');
    emojiElement.id = id;
    emojiElement.classList.add('emoji');
    emojiElement.textContent = emoji;
    emojiElement.setAttribute('draggable', 'true');

    emojiElement.addEventListener('dragstart', handleDragStart);
    emojiElement.addEventListener('touchstart', handleTouchStart);

    emojiPanel.appendChild(emojiElement);
    console.log(`${id} added to emoji panel`);
}

function addWormToPanelWhenFirstBirdLands() {
    if (!firstBirdLanded) {
        firstBirdLanded = true;
        addEmojiToPanel(EMOJIS.WORM, 'worm');
    }
}

function addWorm(x, y) {
    const wormElement = document.createElement('div');
    wormElement.textContent = EMOJIS.WORM;
    wormElement.classList.add('emoji', 'worm');
    wormElement.style.position = 'absolute';
    wormElement.style.left = `${x}px`;
    wormElement.style.top = `${y}px`;
    playArea.appendChild(wormElement);

    startWormWiggle(wormElement);
}

function addEmojiToPlayArea(emoji, x, y, playArea) {
    const emojiElement = document.createElement('div');
    emojiElement.textContent = emoji;

    if (emoji === EMOJIS.TREE) {
        emojiElement.classList.add('emoji', 'tree');
    } else if (emoji === EMOJIS.BUTTERFLY) {
        emojiElement.classList.add('emoji', 'butterfly');
    } else if (emoji === EMOJIS.BIRD) {
        emojiElement.classList.add('emoji', 'bird');
    } else if (emoji === EMOJIS.WORM) {
        emojiElement.classList.add('emoji', 'worm');
    } else {
        emojiElement.classList.add('emoji');
    }

    emojiElement.style.position = 'absolute';
    emojiElement.style.left = `${x}px`;
    emojiElement.style.top = `${y}px`;
    playArea.appendChild(emojiElement);

    console.log(`Added ${emoji} to play area at (${x}, ${y})`);

    if (emoji === EMOJIS.BUSH) {
        addButterflies(x, y, playArea);
        unlockTree();
    } else if (emoji === EMOJIS.TREE) {
        addBird(x, y, playArea);
    } else if (emoji === EMOJIS.WORM) {
        startWormWiggle(emojiElement);
    }
}

function unlockTree() {
    const tree = document.getElementById('tree');
    tree.classList.remove('disabled');
    tree.setAttribute('draggable', 'true');
}

function addButterflies(x, y, playArea) {
    const numButterflies = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numButterflies; i++) {
        setTimeout(() => createButterfly(x, y, playArea), getRandomTime(10, 20) * 1000);
    }
}

function createButterfly(targetX, targetY, playArea) {
    const butterflyElement = document.createElement('div');
    butterflyElement.textContent = EMOJIS.BUTTERFLY;
    butterflyElement.classList.add('emoji', 'butterfly');
    butterflyElement.style.position = 'absolute';
    butterflyElement.style.left = getRandomEdgePosition('x', playArea) + 'px';
    butterflyElement.style.top = getRandomEdgePosition('y', playArea) + 'px';
    playArea.appendChild(butterflyElement);

    butterflyElement.hunger = 100;
    moveButterfly(butterflyElement, targetX, targetY, playArea);
}

function updateButterflies() {
    const butterflies = document.querySelectorAll('.butterfly');
    butterflies.forEach(butterfly => {
        const currentX = parseFloat(butterfly.style.left);
        const currentY = parseFloat(butterfly.style.top);

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 2 + 3; // Smaller movement for smoother animation

        const newX = currentX + distance * Math.cos(angle);
        const newY = currentY + distance * Math.sin(angle);

        butterfly.style.left = `${newX}px`;
        butterfly.style.top = `${newY}px`;

        butterfly.hunger -= 0.1; // Decrease hunger more slowly

        if (butterfly.hunger <= 0) {
            butterflyLand(butterfly, parseFloat(butterfly.style.left), parseFloat(butterfly.style.top), playArea);
        }
    });
}

function butterflyLand(butterfly, targetX, targetY, playArea) {
    const bushes = document.querySelectorAll('.emoji');
    let nearestBush = null;
    let minDistance = Infinity;

    bushes.forEach(bush => {
        if (bush.textContent === EMOJIS.BUSH) {
            const bushX = parseFloat(bush.style.left);
            const bushY = parseFloat(bush.style.top);
            const distance = Math.sqrt((bushX - targetX) ** 2 + (bushY - targetY) ** 2);

            if (distance < minDistance) {
                minDistance = distance;
                nearestBush = bush;
            }
        }
    });

    if (nearestBush) {
        butterfly.style.left = nearestBush.style.left;
        butterfly.style.top = nearestBush.style.top;

        setTimeout(() => {
            butterfly.hunger = 100;
        }, getRandomTime(5, 10) * 1000);
    }
}

function getRandomEdgePosition(axis, playArea) {
    if (axis === 'x') {
        return Math.random() > 0.5 ? 0 : playArea.clientWidth - 20;
    } else {
        return Math.random() > 0.5 ? 0 : playArea.clientHeight - 20;
    }
}

function getRandomTime(min, max) {
    return Math.random() * (max - min) + min;
}

function addEventLogMessage(message) {
    eventMenu.innerHTML = `<div class="event-message">${message}</div>`;
    console.log(`BREAKING NEWS: ${message}`);
}

// Placeholder functions for bird and worm updates
function updateBirds() {
    // Implement bird movement and behavior here
}

function updateWorms() {
    // Implement worm wiggling here
}

// Expose addWormToPanel globally
window.addWormToPanel = addWormToPanelWhenFirstBirdLands;
