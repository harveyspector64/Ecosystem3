// Global cached elements
window.cachedElements = {};
window.butterflies = [];

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

    // Butterfly class
    class Butterfly {
        constructor(element, homeBush) {
            this.element = element;
            this.homeBush = homeBush;
            this.state = 'flying';
            this.carriesPollen = false;
            this.pollenSource = null;
            this.setPosition(this.getRandomPositionAroundBush(homeBush));
        }

        setPosition(position) {
            this.element.style.left = `${position.x}px`;
            this.element.style.top = `${position.y}px`;
        }

        getPosition() {
            return {
                x: parseFloat(this.element.style.left),
                y: parseFloat(this.element.style.top)
            };
        }

        getRandomPositionAroundBush(bush) {
            const bushPosition = getBushPosition(bush);
            const angle = Math.random() * 2 * Math.PI;
            const radius = Math.random() * 100 + 50; // 50-150px radius
            return {
                x: bushPosition.x + radius * Math.cos(angle),
                y: bushPosition.y + radius * Math.sin(angle)
            };
        }

        move() {
            if (this.state === 'resting') {
                if (Math.random() < 0.1) { // 10% chance to start flying again
                    this.state = 'flying';
                } else {
                    return; // Stay resting
                }
            }

            let targetPosition;
            if (Math.random() < 0.8) { // 80% chance to stay around home bush
                targetPosition = this.getRandomPositionAroundBush(this.homeBush);
            } else { // 20% chance to explore
                const nearbyBush = this.findNearbyBush();
                if (nearbyBush) {
                    targetPosition = this.getRandomPositionAroundBush(nearbyBush);
                    this.visitBush(nearbyBush);
                } else {
                    targetPosition = this.getRandomPositionInPlay();
                }
            }

            const currentPosition = this.getPosition();
            const dx = targetPosition.x - currentPosition.x;
            const dy = targetPosition.y - currentPosition.y;
            const distance = Math.sqrt(dx*dx + dy*dy);

            if (distance < 5) { // Close enough to target, consider resting
                if (Math.random() < 0.3) { // 30% chance to rest
                    this.state = 'resting';
                    this.setPosition(targetPosition);
                }
            } else {
                const speed = 2;
                const newX = currentPosition.x + (dx / distance) * speed;
                const newY = currentPosition.y + (dy / distance) * speed;
                this.setPosition({x: newX, y: newY});
            }

            // Add some randomness to the movement
            this.setPosition({
                x: parseFloat(this.element.style.left) + (Math.random() - 0.5) * 2,
                y: parseFloat(this.element.style.top) + (Math.random() - 0.5) * 2
            });
        }

        findNearbyBush() {
            const bushes = Array.from(document.querySelectorAll('.emoji.bush'));
            const currentPosition = this.getPosition();
            for (let bush of bushes) {
                if (bush !== this.homeBush) {
                    const bushPosition = getBushPosition(bush);
                    const distance = getDistance(currentPosition, bushPosition);
                    if (distance < 200) { // Detection radius
                        return bush;
                    }
                }
            }
            return null;
        }

        visitBush(bush) {
            if (this.carriesPollen && bush !== this.pollenSource) {
                this.pollinate(bush);
            }
            this.carriesPollen = true;
            this.pollenSource = bush;
        }

        pollinate(bush) {
            if (Math.random() < 0.1) { // 10% chance of successful pollination
                createNewFlowerBush(bush);
            }
            this.carriesPollen = false;
            this.pollenSource = null;
        }

        getRandomPositionInPlay() {
            return {
                x: Math.random() * (window.cachedElements.playArea.clientWidth - 20),
                y: Math.random() * (window.cachedElements.playArea.clientHeight - 20)
            };
        }
    }

    // Butterfly pool
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

    function getBushPosition(bush) {
        return {
            x: parseFloat(bush.style.left),
            y: parseFloat(bush.style.top)
        };
    }

    function getDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx*dx + dy*dy);
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
            addButterflies(emojiElement);
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

    function createButterfly(bush) {
        const butterflyElement = butterflyPool.get();
        butterflyElement.style.position = 'absolute';
        const butterfly = new Butterfly(butterflyElement, bush);
        window.cachedElements.playArea.appendChild(butterflyElement);
        return butterfly;
    }

    function addButterflies(bush) {
        const numButterflies = Math.floor(Math.random() * 2) + 1;
        const newButterflies = [];
        for (let i = 0; i < numButterflies; i++) {
            newButterflies.push(createButterfly(bush));
        }
        window.butterflies = window.butterflies.concat(newButterflies);
        addEventLogMessage(`${numButterflies} new butterflies have appeared!`);
    }

    function createNewFlowerBush(nearBush) {
        const bushPosition = getBushPosition(nearBush);
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 100 + 50; // 50-150px away
        const newPosition = {
            x: bushPosition.x + distance * Math.cos(angle),
            y: bushPosition.y + distance * Math.sin(angle)
        };
        addEmojiToPlayArea(EMOJIS.BUSH, newPosition.x, newPosition.y);
        addEventLogMessage("A new flower bush has grown from pollination!");
    }

 function addEventLogMessage(message) {
        const eventMenu = window.cachedElements.eventMenu;
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
        window.butterflies.forEach(butterfly => butterfly.move());
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
