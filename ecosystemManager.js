// ecosystemManager.js

import { Bush } from './entities/Bush.js';
import { Tree } from './entities/Tree.js';
import { Bird } from './entities/Bird.js';
import { Butterfly } from './entities/Butterfly.js';
import { Worm } from './entities/Worm.js';

export class EcosystemManager {
    constructor() {
        this.entities = {
            bushes: [],
            trees: [],
            birds: [],
            butterflies: [],
            worms: []
        };
        this.grid = {}; // Simple spatial partitioning
        this.gridSize = 100; // Size of each grid cell
    }

    addBush(x, y) {
        const bush = new Bush(x, y);
        this.entities.bushes.push(bush);
        this.addToGrid(bush);
        this.spawnButterflies(bush);
    }

    addTree(x, y) {
        const tree = new Tree(x, y);
        this.entities.trees.push(tree);
        this.addToGrid(tree);
        this.spawnBird(x, y);
    }

    addWorm(x, y) {
        const worm = new Worm(x, y);
        this.entities.worms.push(worm);
        this.addToGrid(worm);
    }

    spawnButterflies(bush) {
        const count = Math.floor(Math.random() * 3) + 1; // 1-3 butterflies
        for (let i = 0; i < count; i++) {
            const butterfly = new Butterfly(bush.x, bush.y, bush);
            this.entities.butterflies.push(butterfly);
            this.addToGrid(butterfly);
        }
    }

    spawnBird(x, y) {
        const bird = new Bird(x, y);
        this.entities.birds.push(bird);
        this.addToGrid(bird);
    }

    update(deltaTime) {
        for (let type in this.entities) {
            this.entities[type].forEach(entity => {
                entity.update(deltaTime);
                this.updateGridPosition(entity);
            });
        }

        this.handleInteractions();
    }

    handleInteractions() {
        this.entities.birds.forEach(bird => {
            if (bird.state === 'flying') {
                this.checkBirdButterflyCatch(bird);
            } else if (bird.state === 'walking') {
                this.checkBirdWormCatch(bird);
            }
        });

        this.entities.butterflies.forEach(butterfly => {
            this.checkButterflyPollination(butterfly);
        });
    }

    checkBirdButterflyCatch(bird) {
        const nearbyButterflies = this.getNearbyEntities(bird, 'butterflies');
        for (let butterfly of nearbyButterflies) {
            if (this.checkCollision(bird, butterfly)) {
                bird.eat(butterfly);
                this.removeEntity(butterfly);
                break;
            }
        }
    }

    checkBirdWormCatch(bird) {
        const nearbyWorms = this.getNearbyEntities(bird, 'worms');
        for (let worm of nearbyWorms) {
            if (this.checkCollision(bird, worm)) {
                bird.eat(worm);
                this.removeEntity(worm);
                break;
            }
        }
    }

    checkButterflyPollination(butterfly) {
        if (butterfly.hasLanded && Math.random() < 0.1) { // 10% chance of pollination
            const nearbyBushes = this.getNearbyEntities(butterfly, 'bushes');
            if (nearbyBushes.length > 0) {
                const randomBush = nearbyBushes[Math.floor(Math.random() * nearbyBushes.length)];
                randomBush.pollinate();
            }
        }
    }

    removeEntity(entity) {
        const type = entity.constructor.name.toLowerCase() + 's';
        const index = this.entities[type].indexOf(entity);
        if (index > -1) {
            this.entities[type].splice(index, 1);
            this.removeFromGrid(entity);
        }
    }

    addToGrid(entity) {
        const cellX = Math.floor(entity.x / this.gridSize);
        const cellY = Math.floor(entity.y / this.gridSize);
        const cellKey = `${cellX},${cellY}`;
        if (!this.grid[cellKey]) {
            this.grid[cellKey] = [];
        }
        this.grid[cellKey].push(entity);
        entity.gridCell = cellKey;
    }

    updateGridPosition(entity) {
        const newCellX = Math.floor(entity.x / this.gridSize);
        const newCellY = Math.floor(entity.y / this.gridSize);
        const newCellKey = `${newCellX},${newCellY}`;
        if (newCellKey !== entity.gridCell) {
            this.removeFromGrid(entity);
            this.addToGrid(entity);
        }
    }

    removeFromGrid(entity) {
        if (entity.gridCell) {
            const cellEntities = this.grid[entity.gridCell];
            const index = cellEntities.indexOf(entity);
            if (index > -1) {
                cellEntities.splice(index, 1);
            }
        }
    }

    getNearbyEntities(entity, type) {
        const cellX = Math.floor(entity.x / this.gridSize);
        const cellY = Math.floor(entity.y / this.gridSize);
        const nearbyEntities = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const cellKey = `${cellX + dx},${cellY + dy}`;
                if (this.grid[cellKey]) {
                    nearbyEntities.push(...this.grid[cellKey].filter(e => e.constructor.name.toLowerCase() + 's' === type));
                }
            }
        }
        return nearbyEntities;
    }

    checkCollision(entity1, entity2) {
        const dx = entity1.x - entity2.x;
        const dy = entity1.y - entity2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (entity1.radius + entity2.radius);
    }

    getVisibleEntities(viewport) {
        const visibleEntities = [];
        for (let type in this.entities) {
            visibleEntities.push(...this.entities[type].filter(entity => 
                entity.x >= viewport.left && entity.x <= viewport.right &&
                entity.y >= viewport.top && entity.y <= viewport.bottom
            ));
        }
        return visibleEntities;
    }
}
