// Bird.js

import { EMOJIS } from './constants.js';

export class Bird {
    static birdCounter = 0;

    constructor(x, y) {
        this.element = this.createBirdElement(x, y);
        this.currentState = Bird.birdStates.FLYING;
        this.hunger = 100;
        this.foodConsumed = 0;
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

    createBirdElement(x, y) {
        const birdElement = document.createElement('div');
        birdElement.textContent = EMOJIS.BIRD;
        birdElement.classList.add('emoji', 'bird');
        birdElement.style.position = 'absolute';
        birdElement.style.left = `${x}px`;
        birdElement.style.top = `${y}px`;
        birdElement.id = `bird-${++Bird.birdCounter}`;
        return birdElement;
    }

    update(deltaTime, playArea) {
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

        this.updateHunger(deltaTime);
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
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
        newX = Math.max(0, Math.min(newX, playArea.clientWidth - 20));
        newY = Math.max(0, Math.min(newY, playArea.clientHeight - 20));

        this.x = newX;
        this.y = newY;

        // Occasionally check for landing
        if (Math.random() < 0.01) {
            this.checkForLanding(playArea);
        }
    }

    walk(deltaTime, playArea) {
        // Implement walking behavior...
    }

    perch(deltaTime) {
        // Implement perching behavior...
    }

    checkForLanding(playArea) {
        if (this.hunger > 70) {
            this.flyToNearestTree(playArea);
        } else if (this.hunger < 30) {
            this.descendToGround(playArea);
        }
    }

    flyToNearestTree(playArea) {
        // Implement flying to nearest tree...
    }

    descendToGround(playArea) {
        // Implement descending to ground...
    }

    updateHunger(deltaTime) {
        this.hunger = Math.max(0, this.hunger - 2 * deltaTime);
    }

    eat(food) {
        if (food instanceof Butterfly) {
            this.hunger = Math.min(100, this.hunger + 5);
            this.foodConsumed += 5;
        } else if (food instanceof Worm) {
            this.hunger = Math.min(100, this.hunger + 20);
            this.foodConsumed += 20;
        }
        console.log(`Bird ate ${food.constructor.name}. New hunger: ${this.hunger}`);
        this.checkForNestCreation();
    }

    checkForNestCreation() {
        if (this.foodConsumed >= 120) {
            // Implement nest creation...
        }
    }

    // Other methods...
}
