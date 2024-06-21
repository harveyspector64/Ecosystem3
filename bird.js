// Bird.js

import { EMOJIS } from '../constants.js';
import { addEventLogMessage } from '../eventLog.js';
import { addPoints } from '../scoring.js';

export class Bird {
    static birdCounter = 0;

    constructor(x, y, isNewborn = false) {
        this.id = `bird-${++Bird.birdCounter}`;
        this.element = this.createBirdElement(x, y, isNewborn);
        this.currentState = Bird.birdStates.FLYING;
        this.hunger = 100;
        this.foodConsumed = 0;
        this.isNewborn = isNewborn;
        this.growthProgress = isNewborn ? 0 : 100;
        this.flightAngle = 0;
        this.flightRadius = 100;
        this.flightSpeed = 2;
        this.centerX = x;
        this.centerY = y;
    }

    static birdStates = {
        PERCHING: 'perching',
        FLYING: 'flying',
        WALKING: 'walking',
        MOVING_TO_WORM: 'movingToWorm',
        EATING: 'eating',
        DESCENDING: 'descending',
        LANDING: 'landing',
        ASCENDING: 'ascending'
    };

    createBirdElement(x, y, isNewborn) {
        const birdElement = document.createElement('div');
        birdElement.textContent = EMOJIS.BIRD;
        birdElement.classList.add('emoji', 'bird');
        if (isNewborn) birdElement.classList.add('newborn');
        birdElement.style.position = 'absolute';
        birdElement.style.left = `${x}px`;
        birdElement.style.top = `${y}px`;
        birdElement.id = this.id;
        return birdElement;
    }

    setState(newState) {
        console.log(`Bird ${this.id} state transition: ${this.currentState} -> ${newState}`);
        this.currentState = newState;
    }

    update(deltaTime, playArea) {
        this.updateHunger(deltaTime);
        this.updateGrowth(deltaTime);

        switch (this.currentState) {
            case Bird.birdStates.FLYING:
                this.fly(deltaTime, playArea);
                break;
            case Bird.birdStates.WALKING:
                this.walk(deltaTime, playArea);
                break;
            case Bird.birdStates.PERCHING:
                this.perch(deltaTime);
                break;
            // Other states...
        }

        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        
        if (this.foodConsumed >= 200) {
            this.tryLayEgg();
        }
    }

    fly(deltaTime, playArea) {
        this.flightAngle += this.flightSpeed * deltaTime;
        
        let newX = this.centerX + Math.cos(this.flightAngle) * this.flightRadius;
        let newY = this.centerY + Math.sin(this.flightAngle) * this.flightRadius;

        // Adjust flight pattern based on hunger
        if (this.hunger < 60) {
            this.flightRadius = Math.max(50, this.flightRadius - 0.5);
            this.flightSpeed = Math.min(4, this.flightSpeed + 0.01);
        } else {
            this.flightRadius = Math.min(100, this.flightRadius + 0.5);
            this.flightSpeed = Math.max(2, this.flightSpeed - 0.01);
        }

        // Ensure bird stays within play area
        this.x = Math.max(0, Math.min(newX, playArea.clientWidth - 20));
        this.y = Math.max(0, Math.min(newY, playArea.clientHeight - 20));

        // Occasionally check for landing
        if (Math.random() < 0.01) {
            this.checkForLanding(playArea);
        }
    }

    walk(deltaTime, playArea) {
        const speed = 20 * deltaTime;
        const angle = Math.random() * Math.PI * 2;
        this.x += Math.cos(angle) * speed;
        this.y += Math.sin(angle) * speed;

        // Ensure bird stays within play area
        this.x = Math.max(0, Math.min(this.x, playArea.clientWidth - 20));
        this.y = Math.max(0, Math.min(this.y, playArea.clientHeight - 20));

        if (Math.random() < 0.01) { // 1% chance to start flying each update
            this.setState(Bird.birdStates.FLYING);
        }
    }

    perch(deltaTime) {
        if (Math.random() < 0.005) { // 0.5% chance to start flying each update
            this.setState(Bird.birdStates.FLYING);
        }
    }

    checkForLanding(playArea) {
        if (this.hunger > 70) {
            this.flyToNearestTree(playArea);
        } else if (this.hunger < 30) {
            this.descendToGround(playArea);
        }
    }

    flyToNearestTree(playArea) {
        // Implementation of flying to nearest tree...
    }

    descendToGround(playArea) {
        // Implementation of descending to ground...
    }

    updateHunger(deltaTime) {
        this.hunger = Math.max(0, this.hunger - 2 * deltaTime);
    }

    updateGrowth(deltaTime) {
        if (this.isNewborn && this.growthProgress < 100) {
            this.growthProgress += 10 * deltaTime; // Grow over time
            if (this.growthProgress >= 100) {
                this.isNewborn = false;
                this.element.classList.remove('newborn');
                addEventLogMessage(`Bird ${this.id} has grown to full size!`);
            }
        }
    }

    eat(food) {
        let nutritionalValue;
        if (food.constructor.name === 'Butterfly') {
            nutritionalValue = 5;
        } else if (food.constructor.name === 'Worm') {
            nutritionalValue = 20;
        }

        this.hunger = Math.min(100, this.hunger + nutritionalValue);
        this.foodConsumed += nutritionalValue;
        this.growthProgress = Math.min(100, this.growthProgress + nutritionalValue);

        addPoints(nutritionalValue);
        console.log(`Bird ${this.id} ate ${food.constructor.name}. New hunger: ${this.hunger}`);
        addEventLogMessage(`Bird ${this.id} ate a ${food.constructor.name.toLowerCase()}!`);
    }

    tryLayEgg() {
        if (Math.random() < 0.1) { // 10% chance to lay an egg when conditions are met
            this.layEgg();
            this.foodConsumed = 0; // Reset food consumed after laying an egg
        }
    }

    layEgg() {
        // Find a nearby tree to lay the egg in
        const nearestTree = this.findNearestTree();
        if (nearestTree) {
            const egg = this.createEggElement(nearestTree);
            nearestTree.appendChild(egg);
            addEventLogMessage(`Bird ${this.id} laid an egg in a tree!`);
            
            // Set a timer for the egg to hatch
            const hatchTime = 30000 + Math.random() * 30000; // 30-60 seconds
            setTimeout(() => this.hatchEgg(egg, nearestTree), hatchTime);
        }
    }

    createEggElement(tree) {
        const egg = document.createElement('div');
        egg.textContent = '🥚';
        egg.classList.add('emoji', 'egg');
        egg.style.position = 'absolute';
        const offset = 20;
        egg.style.left = `${Math.random() * offset - offset/2}px`;
        egg.style.top = `${Math.random() * offset - offset/2}px`;
        return egg;
    }

    hatchEgg(egg, tree) {
        egg.remove();
        const numNewBirds = Math.floor(Math.random() * 3) + 1; // 1-3 new birds
        for (let i = 0; i < numNewBirds; i++) {
            const newBird = new Bird(parseFloat(tree.style.left), parseFloat(tree.style.top), true);
            // Add the new bird to the ecosystem (this will need to be handled by the EcosystemManager)
        }
        addEventLogMessage(`An egg has hatched! ${numNewBirds} new bird(s) born!`);
    }

    findNearestTree() {
        // This method should be implemented in EcosystemManager and called from there
    }
}
