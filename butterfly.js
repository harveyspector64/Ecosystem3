// Butterfly.js

import { EMOJIS } from './constants.js';

export class Butterfly {
    constructor(bush) {
        this.homeBush = bush;
        this.element = this.createButterflyElement();
        this.x = parseFloat(bush.style.left) + Math.random() * 40 - 20;
        this.y = parseFloat(bush.style.top) + Math.random() * 40 - 20;
        this.hunger = 100;
        this.speed = 0.5 + Math.random() * 0.5;
        this.angle = Math.random() * Math.PI * 2;
        this.wobble = 0;
    }

    createButterflyElement() {
        const element = document.createElement('div');
        element.textContent = EMOJIS.BUTTERFLY;
        element.classList.add('emoji', 'butterfly');
        element.style.position = 'absolute';
        return element;
    }

    update(deltaTime) {
        if (this.hunger < 30 && this.distanceToBush(this.homeBush) > 50) {
            this.moveTowardsBush(deltaTime);
        } else if (this.hunger < 30 && this.distanceToBush(this.homeBush) <= 50) {
            this.land();
        } else {
            this.fly(deltaTime);
        }

        this.updateHunger(deltaTime);
        this.updateElementPosition();
    }

    fly(deltaTime) {
        this.wobble += deltaTime * 10;
        this.angle += (Math.sin(this.wobble) * 0.3 + Math.random() * 0.2 - 0.1) * deltaTime;
        
        const dx = Math.cos(this.angle) * this.speed;
        const dy = Math.sin(this.angle) * this.speed;

        this.x += dx;
        this.y += dy;

        // Keep butterfly near its home bush
        const maxDistance = 100;
        const bushX = parseFloat(this.homeBush.style.left);
        const bushY = parseFloat(this.homeBush.style.top);
        const distanceToBush = Math.sqrt((this.x - bushX)**2 + (this.y - bushY)**2);

        if (distanceToBush > maxDistance) {
            this.angle = Math.atan2(bushY - this.y, bushX - this.x);
        }
    }

    moveTowardsBush(deltaTime) {
        const bushX = parseFloat(this.homeBush.style.left);
        const bushY = parseFloat(this.homeBush.style.top);
        const angle = Math.atan2(bushY - this.y, bushX - this.x);
        
        this.x += Math.cos(angle) * this.speed * 2;
        this.y += Math.sin(angle) * this.speed * 2;
    }

    land() {
        this.x = parseFloat(this.homeBush.style.left) + Math.random() * 20 - 10;
        this.y = parseFloat(this.homeBush.style.top) + Math.random() * 20 - 10;
        this.feed();
    }

    feed() {
        this.hunger = Math.min(100, this.hunger + 20);
        console.log(`Butterfly feeding. New hunger: ${this.hunger}`);
    }

    updateHunger(deltaTime) {
        this.hunger = Math.max(0, this.hunger - 1 * deltaTime);
    }

    updateElementPosition() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

    distanceToBush(bush) {
        const bushX = parseFloat(bush.style.left);
        const bushY = parseFloat(bush.style.top);
        return Math.sqrt((this.x - bushX)**2 + (this.y - bushY)**2);
    }
}
