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

            // Smooth transition to new position
            this.element.style.transition = 'left 0.5s, top 0.5s';
            this.setPosition({x: newX, y: newY});

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

            // Smooth transition to new position
            this.element.style.transition = 'left 0.5s, top 0.5s';
            this.setPosition({x: newX, y: newY});

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
