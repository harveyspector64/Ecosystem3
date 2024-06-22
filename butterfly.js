// butterfly.js

import { getRandomTime, getRandomEdgePosition, getBushPosition, getDistance } from './utils.js';
import { EMOJIS } from './constants.js';
import { gameState, addButterfly, removeButterfly } from './gameState.js';
import { addEventLogMessage } from './eventLogger.js';

class Butterfly {
    constructor(element, homeBush) {
        this.element = element;
        this.homeBush = homeBush;
        this.state = 'flying';
        this.carriesPollen = false;
        this.pollenSource = null;
        this.setPosition(this.getRandomPositionAroundBush(homeBush));
        this.hunger = 100;
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
        const radius = getRandomTime(50, 150); // 50-150px radius
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

        // Decrease hunger
        this.hunger = Math.max(this.hunger - 0.1, 0);

        if (this.hunger <= 0) {
            this.die();
        }
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

    die() {
        console.log('Butterfly died due to hunger.');
        this.element.remove();
        removeButterfly(this);
    }
}

export function createButterfly(bush) {
    const butterflyElement = document.createElement('div');
    butterflyElement.textContent = EMOJIS.BUTTERFLY;
    butterflyElement.classList.add('emoji', 'butterfly');
    butterflyElement.style.position = 'absolute';
    
    const butterfly = new Butterfly(butterflyElement, bush);
    window.cachedElements.playArea.appendChild(butterflyElement);
    addButterfly(butterfly);
    return butterfly;
}

export function addButterflies(bush) {
    const numButterflies = Math.floor(Math.random() * 2) + 1;
    const newButterflies = [];
    for (let i = 0; i < numButterflies; i++) {
        newButterflies.push(createButterfly(bush));
    }
    addEventLogMessage(`${numButterflies} new butterflies have appeared!`);
}

function createNewFlowerBush(nearBush) {
    const bushPosition = getBushPosition(nearBush);
    const angle = Math.random() * 2 * Math.PI;
    const distance = getRandomTime(50, 150); // 50-150px away
    const newPosition = {
        x: bushPosition.x + distance * Math.cos(angle),
        y: bushPosition.y + distance * Math.sin(angle)
    };
    addEmojiToPlayArea(EMOJIS.BUSH, newPosition.x, newPosition.y);
    addEventLogMessage("A new flower bush has grown from pollination!");
}

export function updateButterflies() {
    gameState.butterflies.forEach(butterfly => butterfly.move());
}
