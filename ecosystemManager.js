// ecosystemManager.js

import { Bird } from './Bird.js';
import { Butterfly } from './Butterfly.js';
import { Worm } from './Worm.js';
import { EMOJIS } from './constants.js';

export class EcosystemManager {
    constructor(playArea) {
        this.playArea = playArea;
        this.entities = {
            birds: [],
            butterflies: [],
            worms: [],
            bushes: [],
            trees: []
        };
        this.firstBirdLanded = false;
    }

    addBush(x, y) {
        const bushElement = document.createElement('div');
        bushElement.textContent = EMOJIS.BUSH;
        bushElement.classList.add('emoji', 'bush');
        bushElement.style.position = 'absolute';
        bushElement.style.left = `${x}px`;
        bushElement.style.top = `${y}px`;
        this.playArea.appendChild(bushElement);
        this.entities.bushes.push(bushElement);
        this.spawnButterflies(bushElement);
    }

    addTree(x, y) {
        const treeElement = document.createElement('div');
        treeElement.textContent = EMOJIS.TREE;
        treeElement.classList.add('emoji', 'tree');
        treeElement.style.position = 'absolute';
        treeElement.style.left = `${x}px`;
        treeElement.style.top = `${y}px`;
        this.playArea.appendChild(treeElement);
        this.entities.trees.push(treeElement);
        this.addBird(x, y);
    }

    addWorm(x, y) {
        const worm = new Worm(x, y);
        this.playArea.appendChild(worm.element);
        this.entities.worms.push(worm);
    }

    addBird(x, y) {
        const bird = new Bird(x, y);
        this.playArea.appendChild(bird.element);
        this.entities.birds.push(bird);
    }

    spawnButterflies(bush) {
        const count = Math.floor(Math.random() * 3) + 1; // 1-3 butterflies
        for (let i = 0; i < count; i++) {
            const butterfly = new Butterfly(bush);
            this.playArea.appendChild(butterfly.element);
            this.entities.butterflies.push(butterfly);
        }
    }

    update(deltaTime) {
        this.entities.birds.forEach(bird => {
            bird.update(deltaTime, this.playArea);
            this.checkBirdInteractions(bird);
        });

        this.entities.butterflies.forEach(butterfly => {
            butterfly.update(deltaTime);
        });

        this.entities.worms.forEach(worm => {
            worm.update(deltaTime);
        });
    }

    checkBirdInteractions(bird) {
        if (bird.currentState === Bird.birdStates.FLYING) {
            this.checkBirdButterflyCatch(bird);
        } else if (bird.currentState === Bird.birdStates.WALKING) {
            this.checkBirdWormDetection(bird);
        }

        if (!this.firstBirdLanded && bird.currentState === Bird.birdStates.WALKING) {
            this.firstBirdLanded = true;
            window.addWormToPanel();
        }
    }

    checkBirdButterflyCatch(bird) {
        this.entities.butterflies.forEach((butterfly, index) => {
            if (this.checkCollision(bird.element, butterfly.element)) {
                bird.eat(butterfly);
                butterfly.element.remove();
                this.entities.butterflies.splice(index, 1);
            }
        });
    }

    checkBirdWormDetection(bird) {
        const nearestWorm = this.findNearestWorm(bird);
        if (nearestWorm && this.getDistance(bird.element, nearestWorm.element) < 300) {
            bird.birdMoveToWorm(nearestWorm, this.playArea);
        }
    }

    findNearestWorm(bird) {
        let nearestWorm = null;
        let minDistance = Infinity;
        this.entities.worms.forEach(worm => {
            const distance = this.getDistance(bird.element, worm.element);
            if (distance < minDistance) {
                minDistance = distance;
                nearestWorm = worm;
            }
        });
        return nearestWorm;
    }

    checkCollision(element1, element2) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
        return !(rect1.right < rect2.left || 
                 rect1.left > rect2.right || 
                 rect1.bottom < rect2.top || 
                 rect1.top > rect2.bottom);
    }

    getDistance(element1, element2) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
        const dx = (rect1.left + rect1.right) / 2 - (rect2.left + rect2.right) / 2;
        const dy = (rect1.top + rect1.bottom) / 2 - (rect2.top + rect2.bottom) / 2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    removeEntity(entity) {
        const type = entity.constructor.name.toLowerCase() + 's';
        const index = this.entities[type].indexOf(entity);
        if (index > -1) {
            this.entities[type].splice(index, 1);
            entity.element.remove();
        }
    }
}
