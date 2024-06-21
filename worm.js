// Worm.js

import { EMOJIS } from './constants.js';

export class Worm {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.element = this.createWormElement();
        this.wigglePhase = 0;
        this.wiggleAmplitude = 2;
        this.wiggleSpeed = 5;
        this.visibilityTimer = 0;
        this.isVisible = true;
        this.lastRepositionTime = 0;
    }

    createWormElement() {
        const element = document.createElement('div');
        element.textContent = EMOJIS.WORM;
        element.classList.add('emoji', 'worm');
        element.style.position = 'absolute';
        element.style.left = `${this.x}px`;
        element.style.top = `${this.y}px`;
        return element;
    }

    update(deltaTime) {
        this.wiggle(deltaTime);
        this.updateVisibility(deltaTime);
        this.occasionallyReposition(deltaTime);
    }

    wiggle(deltaTime) {
        this.wigglePhase += this.wiggleSpeed * deltaTime;
        const wiggleOffset = Math.sin(this.wigglePhase) * this.wiggleAmplitude;
        this.element.style.transform = `translateX(${wiggleOffset}px)`;
    }

    updateVisibility(deltaTime) {
        this.visibilityTimer += deltaTime;
        if (this.visibilityTimer > 10) {  // Every 10 seconds
            this.visibilityTimer = 0;
            this.isVisible = Math.random() < 0.8;  // 80% chance to be visible
            this.element.style.opacity = this.isVisible ? '1' : '0';
        }
    }

    occasionallyReposition(deltaTime) {
        this.lastRepositionTime += deltaTime;
        if (this.lastRepositionTime > 30) {  // Every 30 seconds
            this.lastRepositionTime = 0;
            if (Math.random() < 0.3) {  // 30% chance to reposition
                const offset = 20;  // 20px offset
                this.x += Math.random() * offset * 2 - offset;
                this.y += Math.random() * offset * 2 - offset;
                this.element.style.left = `${this.x}px`;
                this.element.style.top = `${this.y}px`;
            }
        }
    }
}
