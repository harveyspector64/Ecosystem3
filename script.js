class Butterfly {
    // ... (previous code remains the same)

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

    // ... (rest of the Butterfly class remains the same)
}

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

    // ... (rest of the Bird class remains the same)
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
    // Implement worm wiggling here
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

// Expose necessary functions to the global scope
window.addWormToPanel = addWormToPanelWhenFirstBirdLands;
window.addBird = addBird;
window.startWormWiggle = startWormWiggle;
window.addEventLogMessage = addEventLogMessage;

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeGame);

})(); // End of IIFE
