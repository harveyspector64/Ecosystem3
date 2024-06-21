// Global cached elements
window.cachedElements = {};
window.butterflies = [];
window.birds = [];

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

    function getRandomEdgePosition() {
        const playArea = window.cachedElements.playArea;
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
            case 0: // Top
                return {x: Math.random() * playArea.clientWidth, y: -20};
            case 1: // Right
                return {x: playArea.clientWidth + 20, y: Math.random() * playArea.clientHeight};
            case 2: // Bottom
                return {x: Math.random() * playArea.clientWidth, y: playArea.clientHeight + 20};
            case 3: // Left
                return {x: -20, y: Math.random() * playArea.clientHeight};
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

// Bird class
class Bird {
    constructor(element) {
        this.element = element;
        this.hunger = 100;
        this.foodConsumed = 0;
        this.state = 'flying';
        this.flightAngle = Math.random() * Math.PI * 2;
        this.flightSpeed = 1 + Math.random() * 0.5;
        this.setPosition(getRandomEdgePosition());
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

    move() {
        const currentPosition = this.getPosition();
        let targetPosition;

        if (this.hunger < 50) {
            targetPosition = this.findNearestFood();
        } else {
            targetPosition = this.getRandomPositionInPlay();
        }

        this.flightAngle += (Math.random() - 0.5) * 0.3;

        const newX = currentPosition.x + Math.cos(this.flightAngle) * this.flightSpeed;
        const newY = currentPosition.y + Math.sin(this.flightAngle) * this.flightSpeed;

        const distanceToTarget = getDistance({x: newX, y: newY}, targetPosition);
        if (distanceToTarget > 50) {
            const angleToTarget = Math.atan2(targetPosition.y - newY, targetPosition.x - newX);
            this.flightAngle = this.flightAngle * 0.8 + angleToTarget * 0.2;
        }

        this.setPosition({x: newX, y: newY});

        this.hunger -= 0.1;
        if (this.hunger <= 0) {
            // We'll implement death later
            this.hunger = 100;  // For now, just reset hunger
        }

        this.checkForFood();
    }

    findNearestFood() {
        const worms = document.querySelectorAll('.worm');
        const butterflies = document.querySelectorAll('.butterfly');
        let nearestFood = null;
        let minDistance = Infinity;

        [...worms, ...butterflies].forEach(food => {
            const foodPosition = {
                x: parseFloat(food.style.left),
                y: parseFloat(food.style.top)
            };
            const distance = getDistance(this.getPosition(), foodPosition);
            if (distance < minDistance) {
                minDistance = distance;
                nearestFood = food;
            }
        });

        return nearestFood ? {
            x: parseFloat(nearestFood.style.left),
            y: parseFloat(nearestFood.style.top)
        } : this.getRandomPositionInPlay();
    }

    checkForFood() {
        const currentPosition = this.getPosition();
        const worms = document.querySelectorAll('.worm');
        const butterflies = document.querySelectorAll('.butterfly');

        [...worms, ...butterflies].forEach(food => {
            const foodPosition = {
                x: parseFloat(food.style.left),
                y: parseFloat(food.style.top)
            };
            if (getDistance(currentPosition, foodPosition) < 20) {
                this.eat(food);
            }
        });
    }

    eat(food) {
        const energyGain = food.classList.contains('worm') ? 20 : 5;
        this.hunger = Math.min(this.hunger + energyGain, 100);
        this.foodConsumed += energyGain;
        food.remove();
        addEventLogMessage('birdEat', {food: food.classList.contains('worm') ? 'a worm' : 'a butterfly', energy: this.hunger});

        if (this.foodConsumed >= 100) {
            this.layEgg();
        }
    }

    layEgg() {
        const nearestTree = this.findNearestTree();
        if (nearestTree) {
            createEgg(nearestTree);
            this.foodConsumed = 0;
        }
    }

    findNearestTree() {
        const trees = document.querySelectorAll('.tree');
        let nearestTree = null;
        let minDistance = Infinity;

        trees.forEach(tree => {
            const treePosition = {
                x: parseFloat(tree.style.left),
                y: parseFloat(tree.style.top)
            };
            const distance = getDistance(this.getPosition(), treePosition);
            if (distance < minDistance) {
                minDistance = distance;
                nearestTree = tree;
            }
        });

        return nearestTree    }

    getRandomPositionInPlay() {
        return {
            x: Math.random() * (window.cachedElements.playArea.clientWidth - 20),
            y: Math.random() * (window.cachedElements.playArea.clientHeight - 20)
        };
    }
}
    
 // Butterfly class
    class Butterfly {
        constructor(element, homeBush) {
            this.element = element;
            this.homeBush = homeBush;
            this.state = 'flying';
            this.carriesPollen = false;
            this.pollenSource = null;
            this.flightAngle = Math.random() * Math.PI * 2;
            this.flightSpeed = 0.5 + Math.random() * 0.5;
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
            if (Math.random() < 0.05) {
                this.state = 'flying';
            } else {
                return;
            }
        }

        const currentPosition = this.getPosition();
        let targetPosition;

        if (Math.random() < 0.7) {
            targetPosition = this.getRandomPositionAroundBush(this.homeBush);
        } else {
            targetPosition = this.getRandomPositionInPlay();
        }

        this.flightAngle += (Math.random() - 0.5) * 0.3;  // Reduced angle change

        const newX = currentPosition.x + Math.cos(this.flightAngle) * this.flightSpeed;
        const newY = currentPosition.y + Math.sin(this.flightAngle) * this.flightSpeed;

        // Add some random movement
        const flutterX = Math.sin(Date.now() / 200) * 2;
        const flutterY = Math.cos(Date.now() / 180) * 2;

        this.setPosition({
            x: newX + flutterX,
            y: newY + flutterY
        });

        this.checkForPollination();
    }

        checkForPollination() {
            if (this.carriesPollen) {
                const nearbyBush = this.findNearbyBush();
                if (nearbyBush && nearbyBush !== this.pollenSource) {
                    this.pollinate(nearbyBush);
                }
            } else {
                if (getDistance(this.getPosition(), getBushPosition(this.homeBush)) < 20) {
                    this.carriesPollen = true;
                    this.pollenSource = this.homeBush;
                }
            }
        }

        findNearbyBush() {
            const bushes = Array.from(document.querySelectorAll('.emoji.bush'));
            const currentPosition = this.getPosition();
            for (let bush of bushes) {
                const bushPosition = getBushPosition(bush);
                const distance = getDistance(currentPosition, bushPosition);
                if (distance < 50) {
                    return bush;
                }
            }
            return null;
        }

        pollinate(bush) {
            if (Math.random() < 0.1) {
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
        const butterflyElement = document.createElement('div');
        butterflyElement.textContent = EMOJIS.BUTTERFLY;
        butterflyElement.classList.add('emoji', 'butterfly');
        butterflyElement.style.position = 'absolute';
        
        const startPosition = getRandomEdgePosition();
        butterflyElement.style.left = `${startPosition.x}px`;
        butterflyElement.style.top = `${startPosition.y}px`;
        
        window.cachedElements.playArea.appendChild(butterflyElement);
        
        const butterfly = new Butterfly(butterflyElement, bush);
        window.butterflies.push(butterfly);
        return butterfly;
    }

    function addButterflies(bush) {
        const numButterflies = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numButterflies; i++) {
            setTimeout(() => {
                createButterfly(bush);
                addEventLogMessage('butterflySpawn');
            }, getRandomTime(1000, 5000));
        }
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
        addEventLogMessage('bushGrown');
    }

 function addBird(x, y) {
        const delay = Math.random() * 8000 + 4000; // 4-12 seconds delay
        
        setTimeout(() => {
            const birdElement = document.createElement('div');
            birdElement.textContent = EMOJIS.BIRD;
            birdElement.classList.add('emoji', 'bird');
            
            const startPosition = getRandomEdgePosition();
            birdElement.style.left = `${startPosition.x}px`;
            birdElement.style.top = `${startPosition.y}px`;
            
            window.cachedElements.playArea.appendChild(birdElement);

            const bird = new Bird(birdElement);
            window.birds.push(bird);
            
            addEventLogMessage('birdSpawn');
        }, delay);
    }

    function createEgg(tree) {
        const eggElement = document.createElement('div');
        eggElement.textContent = '🥚';
        eggElement.classList.add('emoji', 'egg');
        eggElement.style.position = 'absolute';

        const treeRect = tree.getBoundingClientRect();
        eggElement.style.left = `${treeRect.left + treeRect.width / 2 - 10}px`;
        eggElement.style.top = `${treeRect.top + 10}px`;

        window.cachedElements.playArea.appendChild(eggElement);

        const hatchTime = getRandomTime(30000, 60000); // 30-60 seconds
        let shakeIntensity = 0;

        const shakeInterval = setInterval(() => {
            shakeIntensity += 0.1;
            eggElement.style.transform = `translate(${Math.sin(Date.now() / 50) * shakeIntensity}px, ${Math.cos(Date.now() / 50) * shakeIntensity}px)`;
        }, 50);

        setTimeout(() => {
            clearInterval(shakeInterval);
            eggElement.remove();
            const numBirds = Math.floor(Math.random() * 3) + 1; // 1-3 birds
            for (let i = 0; i < numBirds; i++) {
                const newBirdElement = document.createElement('div');
                newBirdElement.textContent = EMOJIS.BIRD;
                newBirdElement.classList.add('emoji', 'bird', 'baby');
                newBirdElement.style.position = 'absolute';
                newBirdElement.style.left = eggElement.style.left;
                newBirdElement.style.top = eggElement.style.top;
                newBirdElement.style.fontSize = '0.7em'; // Smaller size for baby birds
                window.cachedElements.playArea.appendChild(newBirdElement);

                const newBird = new Bird(newBirdElement);
                window.birds.push(newBird);
            }
            addEventLogMessage('eggHatch', {count: numBirds});
        }, hatchTime);

        addEventLogMessage('eggLaid');
    }

    function addEventLogMessage(type, details = {}) {
        const eventMenu = window.cachedElements.eventMenu;
        if (!eventMenu) {
            console.error('Event menu not found');
            return;
        }

        let message;
        switch (type) {
            case 'birdSpawn':
                message = "A new bird has taken flight in the ecosystem!";
                break;
            case 'birdEat':
                message = `A bird has feasted on ${details.food}. Its energy is now at ${details.energy}.`;
                break;
            case 'butterflySpawn':
                message = "A delicate butterfly has emerged, carried by the breeze.";
                break;
            case 'bushPlanted':
                message = "A flowering bush has been planted, adding beauty to the landscape.";
                break;
            case 'bushGrown':
                message = "A new flowering bush has sprouted from pollination!";
                break;
            case 'treePlanted':
                message = "A majestic tree now stands tall in the ecosystem.";
                break;
            case 'wormAppeared':
                message = "A worm has surfaced, enriching the soil.";
                break;
            case 'eggLaid':
                message = "An egg has been carefully placed in a tree's branches.";
                break;
            case 'eggHatch':
                message = `The egg has hatched! ${details.count} new baby bird${details.count > 1 ? 's have' : ' has'} joined our world.`;
                break;
            default:
                message = "The ecosystem continues to thrive and change.";
        }

        const eventMessageElement = document.createElement('div');
        eventMessageElement.className = 'event-message';
        eventMessageElement.textContent = message;
        
        eventMenu.appendChild(eventMessageElement);
        
        // Keep only the last 3 messages
        while (eventMenu.children.length > 4) { // +1 for the header
            eventMenu.removeChild(eventMenu.children[1]); // Remove the oldest message, not the header
        }
        
        console.log(`BREAKING NEWS: ${message}`);
    }

 // Update functions
    function updateButterflies() {
        window.butterflies.forEach(butterfly => butterfly.move());
    }

    function updateBirds() {
        window.birds.forEach(bird => bird.move());
    }

    function updateWorms() {
        const worms = document.querySelectorAll('.worm');
        worms.forEach(worm => {
            const wiggleAmount = Math.sin(Date.now() / 200) * 2;
            worm.style.transform = `translateX(${wiggleAmount}px)`;
        });
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

    // Expose necessary functions to the global scope
    window.addWormToPanel = addWormToPanelWhenFirstBirdLands;
    window.addBird = addBird;
    window.startWormWiggle = startWormWiggle;
    window.addEventLogMessage = addEventLogMessage;

    // Initialize the game when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', initializeGame);
})(); // End of IIFE
