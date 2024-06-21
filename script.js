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

            this.flightAngle += (Math.random() - 0.5) * 0.5;

            const newX = currentPosition.x + Math.cos(this.flightAngle) * this.flightSpeed;
            const newY = currentPosition.y + Math.sin(this.flightAngle) * this.flightSpeed;

            const distanceToTarget = getDistance({x: newX, y: newY}, targetPosition);
            if (distanceToTarget > 100) {
                const angleToTarget = Math.atan2(targetPosition.y - newY, targetPosition.x - newX);
                this.flightAngle = this.flightAngle * 0.8 + angleToTarget * 0.2;
            }

            this.setPosition({x: newX, y: newY});

            if (Math.random() < 0.01) {
                this.state = 'resting';
                this.setPosition(this.getRandomPositionAroundBush(this.homeBush));
            }

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
            if (this.state === 'perching') {
                if (Math.random() < 0.05) {
                    this.state = 'flying';
                } else {
                    return;
                }
            }

            const currentPosition = this.getPosition();
            let targetPosition;

            if (this.hunger < 50 && this.state !== 'hunting') {
                this.state = 'hunting';
                targetPosition = this.findNearestFood();
            } else if (this.state === 'hunting') {
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
                this.die();
            }

            this.checkForFood();
        }

        findNearestFood() {
            const worms = document.querySelectorAll('.emoji.worm');
            const butterflies = document.querySelectorAll('.emoji.butterfly');
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
            const worms = document.querySelectorAll('.emoji.worm');
            const butterflies = document.querySelectorAll('.emoji.butterfly');

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
            const trees = document.querySelectorAll('.emoji.tree');
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

            return nearestTree;
        }

        die() {
            this.element.remove();
            const index = window.birds.indexOf(this);
            if (index > -1) {
                window.birds.splice(index, 1);
            }
            addEventLogMessage('birdDie');
        }

        getRandomPositionInPlay() {
            return {
                x: Math.random() * (window.cachedElements.playArea.clientWidth - 20),
                y: Math.random() * (window.cachedElements.playArea.clientHeight - 20)
            };
        }
    }

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
            const x = touch.clientX - window.
