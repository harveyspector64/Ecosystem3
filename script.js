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

    // Cached DOM elements
    const cachedElements = {};

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

    // Game state
    let selectedEmoji = null;
    let draggedElement = null;
    let firstBirdLanded = false;

    // Main game loop
    function gameLoop(currentTime) {
        requestAnimationFrame(gameLoop);
        
        updateButterflies();
        updateBirds();
        updateWorms();
        
        performanceMonitor.update(currentTime);
    }

    function initializeGame() {
        cachedElements.playArea = document.getElementById('play-area');
        cachedElements.emojiPanel = document.getElementById('emoji-panel');
        cachedElements.eventMenu = document.getElementById('event-menu');
        cachedElements.tree = document.getElementById('tree');

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
        cachedElements.emojiPanel.addEventListener('dragstart', handleDragStart);
        cachedElements.playArea.addEventListener('dragover', (e) => e.preventDefault());
        cachedElements.playArea.addEventListener('drop', handleDrop);
        cachedElements.emojiPanel.addEventListener('touchstart', handleTouchStart);
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
        const x = e.clientX - cachedElements.playArea.offsetLeft;
        const y = e.clientY - cachedElements.playArea.offsetTop;
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
            const x = touch.clientX - cachedElements.playArea.offsetLeft;
            const y = touch.clientY - cachedElements.playArea.offsetTop;
            console.log(`Placing emoji: ${selectedEmoji} at (${x}, ${y})`);
            addEmojiToPlayArea(selectedEmoji, x, y);
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

        cachedElements.emojiPanel.appendChild(emojiElement);
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
        cachedElements.playArea.appendChild(wormElement);

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
        cachedElements.playArea.appendChild(emojiElement);

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

    function unlockTree() {
        cachedElements.tree.classList.remove('disabled');
        cachedElements.tree.setAttribute('draggable', 'true');
    }

    function addButterflies(x, y) {
        const numButterflies = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numButterflies; i++) {
            setTimeout(() => createButterfly(x, y), getRandomTime(10, 20) * 1000);
        }
    }

    function createButterfly(targetX, targetY) {
        const butterflyElement = butterflyPool.get();
        butterflyElement.style.position = 'absolute';
        butterflyElement.style.left = getRandomEdgePosition('x') + 'px';
        butterflyElement.style.top = getRandomEdgePosition('y') + 'px';
        cachedElements.playArea.appendChild(butterflyElement);

        butterflyElement.hunger = 100;
        moveButterfly(butterflyElement, targetX, targetY);

        addEventLogMessage('A new butterfly has appeared!');
    }

    function moveButterfly(butterfly, targetX, targetY) {
        function animate() {
            const currentX = parseFloat(butterfly.style.left);
            const currentY = parseFloat(butterfly.style.top);

            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 2 + 3;

            const newX = currentX + distance * Math.cos(angle);
            const newY = currentY + distance * Math.sin(angle);

            butterfly.style.left = `${newX}px`;
            butterfly.style.top = `${newY}px`;

            butterfly.hunger -= 0.1;

            if (butterfly.hunger <= 0) {
                butterflyLand(butterfly, parseFloat(butterfly.style.left), parseFloat(butterfly.style.top));
            } else {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    function updateButterflies() {
        // This function is now empty as individual butterflies are animated in moveButterfly
    }

    function butterflyLand(butterfly, targetX, targetY) {
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
                butterflyPool.release(butterfly);
                createButterfly(parseFloat(nearestBush.style.left), parseFloat(nearestBush.style.top));
            }, getRandomTime(5, 10) * 1000);
        } else {
            butterflyPool.release(butterfly);
        }

        addEventLogMessage('A butterfly has landed on a bush!');
    }

    function getRandomEdgePosition(axis) {
        if (axis === 'x') {
            return Math.random() > 0.5 ? 0 : cachedElements.playArea.clientWidth - 20;
        } else {
            return Math.random() > 0.5 ? 0 : cachedElements.playArea.clientHeight - 20;
        }
    }

    function getRandomTime(min, max) {
        return Math.random() * (max - min) + min;
    }

    function addEventLogMessage(message) {
        const eventMessageElement = document.createElement('div');
        eventMessageElement.className = 'event-message';
        eventMessageElement.textContent = message;
        
        cachedElements.eventMenu.appendChild(eventMessageElement);
        
        // Keep only the last 5 messages
        while (cachedElements.eventMenu.children.length > 5) {
            cachedElements.eventMenu.removeChild(cachedElements.eventMenu.firstChild);
        }
        
        console.log(`BREAKING NEWS: ${message}`);
    }

    function updateBirds() {
        // Implement bird movement and behavior here
    }

    function updateWorms() {
        // Implement worm wiggling here
    }

    // Expose necessary functions to the global scope
    window.addWormToPanel = addWormToPanelWhenFirstBirdLands;
    window.startWormWiggle = startWormWiggle; // Make sure this function is defined
    window.addBird = addBird; // Make sure this function is defined

    // Initialize the game when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', initializeGame);
})();
