// Global cached elements
window.cachedElements = {};

// Wrap the entire game in an Immediately Invoked Function Expression (IIFE)
(function() {
    // Performance monitor
    const performanceMonitor = {
        frameCount: 0,
        lastTime: performance.now(),
        fps: 0,
        lastLogTime: 0,

        update: function(currentTime) {
            this.frameCount++;
            if (currentTime - this.lastTime >= 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.lastTime = currentTime;
                
                // Log FPS every 5 seconds
                if (currentTime - this.lastLogTime >= 5000) {
                    console.log(`%cCurrent FPS: ${this.fps}`, 'color: green; font-weight: bold;');
                    this.lastLogTime = currentTime;
                }
            }
        }
    };

    // Initialize cached elements
    window.cachedElements = {
        playArea: null,
        emojiPanel: null,
        eventMenu: null,
        tree: null
    };

    // Game state
    let selectedEmoji = null;
    let draggedElement = null;
    let firstBirdLanded = false;

    // Utility functions
    function getRandomTime(min, max) {
        return Math.random() * (max - min) + min;
    }

    function getRandomEdgePosition(axis) {
        if (axis === 'x') {
            return Math.random() > 0.5 ? 0 : window.cachedElements.playArea.clientWidth - 20;
        } else {
            return Math.random() > 0.5 ? 0 : window.cachedElements.playArea.clientHeight - 20;
        }
    }

    function getEmojiName(emoji) {
        switch(emoji) {
            case EMOJIS.BUSH: return 'bush';
            case EMOJIS.TREE: return 'tree';
            case EMOJIS.BUTTERFLY: return 'butterfly';
            case EMOJIS.BIRD: return 'bird';
            case EMOJIS.WORM: return 'worm';
            default: return 'creature';
        }
    }

    // Butterfly object pool
    const butterflyPool = {
        pool: [],
        maxSize: 50,

        get: function() {
            if (this.pool.length > 0) {
                return this.pool.pop();
            } else {
                const butterfly = document.createElement('div');
                butterfly.classList.add('emoji', 'butterfly');
                butterfly.textContent = EMOJIS.BUTTERFLY;
                return butterfly;
            }
        },

        release: function(butterfly) {
            if (this.pool.length < this.maxSize) {
                butterfly.remove();
                this.pool.push(butterfly);
            } else {
                butterfly.remove();
            }
        }
    };

    // Event handling functions
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
        const x = e.clientX - window.cachedElements.playArea.offsetLeft;
        const y = e.clientY - window.cachedElements.playArea.offsetTop;
        const emoji = e.dataTransfer.getData('text/plain');
        if (emoji) {
            console.log(`Placing emoji: ${emoji} at (${x}, ${y})`);
            addEmojiToPlayArea(emoji, x, y);
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
            const x = touch.clientX - window.cachedElements.playArea.offsetLeft;
            const y = touch.clientY - window.cachedElements.playArea.offsetTop;
            console.log(`Placing emoji: ${selectedEmoji} at (${x}, ${y})`);
            addEmojiToPlayArea(selectedEmoji, x, y);
            document.body.removeChild(draggedElement);
            draggedElement = null;
            selectedEmoji = null;
        } else {
            console.log('No emoji selected');
        }
    }

    // Game logic functions
    function addEmojiToPanel(emoji, id) {
        const emojiElement = document.createElement('div');
        emojiElement.id = id;
        emojiElement.classList.add('emoji');
        emojiElement.textContent = emoji;
        emojiElement.setAttribute('draggable', 'true');

        emojiElement.addEventListener('dragstart', handleDragStart);
        emojiElement.addEventListener('touchstart', handleTouchStart);

        window.cachedElements.emojiPanel.appendChild(emojiElement);
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
        window.cachedElements.playArea.appendChild(wormElement);

        startWormWiggle(wormElement);
    }

    function addEmojiToPlayArea(emoji, x, y) {
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
        window.cachedElements.playArea.appendChild(emojiElement);

        console.log(`Added ${emoji} to play area at (${x}, ${y})`);

        if (emoji === EMOJIS.BUSH) {
            addButterflies(x, y);
            unlockTree();
        } else if (emoji === EMOJIS.TREE) {
            addBird(x, y);
        } else if (emoji === EMOJIS.WORM) {
            startWormWiggle(emojiElement);
        }

        addEventLogMessage(`A ${getEmojiName(emoji)} has been added to the ecosystem!`);
    }

    function unlockTree() {
        window.cachedElements.tree.classList.remove('disabled');
        window.cachedElements.tree.setAttribute('draggable', 'true');
    }

    function addButterflies(x, y) {
        const numButterflies = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numButterflies; i++) {
            setTimeout(() => createButterfly(x, y), getRandomTime(10, 20) * 1000);
        }
    }

function moveButterfly(butterfly) {
    const states = {
        EXPLORING: 'exploring',
        HOVERING: 'hovering',
        ATTRACTED: 'attracted',
        RESTING: 'resting'
    };

    let currentState = states.EXPLORING;
    let direction = Math.random() * Math.PI * 2;
    let stateTimer = 0;
    let attractedTo = null;

    function updateState() {
        stateTimer--;
        if (stateTimer <= 0) {
            switch (currentState) {
                case states.EXPLORING:
                    currentState = Math.random() < 0.3 ? states.HOVERING : states.EXPLORING;
                    stateTimer = currentState === states.HOVERING ? getRandomTime(3, 7) * 10 : getRandomTime(10, 20) * 10;
                    break;
                case states.HOVERING:
                    currentState = states.EXPLORING;
                    stateTimer = getRandomTime(10, 20) * 10;
                    break;
                case states.ATTRACTED:
                    if (!attractedTo) {
                        currentState = states.EXPLORING;
                        stateTimer = getRandomTime(10, 20) * 10;
                    }
                    break;
                case states.RESTING:
                    currentState = Math.random() < 0.7 ? states.EXPLORING : states.HOVERING;
                    stateTimer = getRandomTime(5, 15) * 10;
                    break;
            }
        }
    }

    function move() {
        const currentX = parseFloat(butterfly.style.left);
        const currentY = parseFloat(butterfly.style.top);
        let newX, newY, speed;

        switch (currentState) {
            case states.EXPLORING:
                speed = 2;
                direction += (Math.random() - 0.5) * 0.5; // Slight direction change
                newX = currentX + Math.cos(direction) * speed;
                newY = currentY + Math.sin(direction) * speed;
                break;
            case states.HOVERING:
                speed = 0.5;
                newX = currentX + (Math.random() - 0.5) * speed;
                newY = currentY + (Math.random() - 0.5) * speed;
                break;
            case states.ATTRACTED:
                speed = 1;
                const attractedX = parseFloat(attractedTo.style.left);
                const attractedY = parseFloat(attractedTo.style.top);
                const dx = attractedX - currentX;
                const dy = attractedY - currentY;
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < 5) {
                    currentState = states.RESTING;
                    stateTimer = getRandomTime(10, 30) * 10;
                    newX = attractedX;
                    newY = attractedY;
                } else {
                    newX = currentX + (dx / distance) * speed;
                    newY = currentY + (dy / distance) * speed;
                }
                break;
            case states.RESTING:
                newX = currentX;
                newY = currentY;
                break;
        }

        // Boundary check
        const maxX = window.cachedElements.playArea.clientWidth - 20;
        const maxY = window.cachedElements.playArea.clientHeight - 20;
        if (newX <= 0 || newX >= maxX || newY <= 0 || newY >= maxY) {
            direction = Math.atan2(maxY/2 - currentY, maxX/2 - currentX);
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
        }

        butterfly.style.left = `${newX}px`;
        butterfly.style.top = `${newY}px`;

        // Check for nearby flower bushes
        if (currentState !== states.RESTING && Math.random() < 0.1) {
            const nearbyBush = findNearbyBush(newX, newY);
            if (nearbyBush) {
                currentState = states.ATTRACTED;
                attractedTo = nearbyBush;
                stateTimer = getRandomTime(5, 10) * 10;
            }
        }
    }

    function findNearbyBush(x, y) {
        const bushes = document.querySelectorAll('.emoji.bush');
        for (let bush of bushes) {
            const bushX = parseFloat(bush.style.left);
            const bushY = parseFloat(bush.style.top);
            const distance = Math.sqrt((x - bushX)**2 + (y - bushY)**2);
            if (distance < 100) { // Detection radius
                return bush;
            }
        }
        return null;
    }

    function animate() {
        updateState();
        move();
        requestAnimationFrame(animate);
    }

    animate();
}

function createButterfly(targetX, targetY) {
    const butterflyElement = butterflyPool.get();
    butterflyElement.style.position = 'absolute';
    butterflyElement.style.left = getRandomEdgePosition('x') + 'px';
    butterflyElement.style.top = getRandomEdgePosition('y') + 'px';
    window.cachedElements.playArea.appendChild(butterflyElement);

    moveButterfly(butterflyElement);

    addEventLogMessage('A new butterfly has appeared!');
}

    function addEventLogMessage(message) {
        const eventMenu = document.getElementById('event-menu');
        if (!eventMenu) {
            console.error('Event menu not found');
            return;
        }

        const eventMessageElement = document.createElement('div');
        eventMessageElement.className = 'event-message';
        eventMessageElement.textContent = message;
        
        eventMenu.appendChild(eventMessageElement);
        
        // Keep only the last 5 messages
        while (eventMenu.children.length > 6) { // +1 for the header
            eventMenu.removeChild(eventMenu.children[1]); // Remove the oldest message, not the header
        }
        
        console.log(`BREAKING NEWS: ${message}`);
    }

    // Update functions
    function updateButterflies() {
        // This function is now empty as individual butterflies are animated in moveButterfly
    }

    function updateBirds() {
        // Implement bird movement and behavior here
    }

    function updateWorms() {
        // Implement worm wiggling here
    }

    // Main game loop
    function gameLoop(currentTime) {
        requestAnimationFrame(gameLoop);
        
        updateButterflies();
        updateBirds();
        updateWorms();
        
        performanceMonitor.update(currentTime);
    }

    // Initialization
    function initializeGame() {
        window.cachedElements.playArea = document.getElementById('play-area');
        window.cachedElements.emojiPanel = document.getElementById('emoji-panel');
        window.cachedElements.eventMenu = document.getElementById('event-menu');
        window.cachedElements.tree = document.getElementById('tree');

        initializeEmojis();
        setupEventListeners();
        requestAnimationFrame(gameLoop);
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
        window.cachedElements.emojiPanel.addEventListener('dragstart', handleDragStart);
        window.cachedElements.playArea.addEventListener('dragover', (e) => e.preventDefault());
        window.cachedElements.playArea.addEventListener('drop', handleDrop);
        window.cachedElements.emojiPanel.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
    }

    // Expose necessary functions to the global scope
    window.addWormToPanel = addWormToPanelWhenFirstBirdLands;
    window.addBird = addBird;
    window.startWormWiggle = startWormWiggle;
    window.addEventLogMessage = addEventLogMessage;

    // Initialize the game when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', initializeGame);
})();
