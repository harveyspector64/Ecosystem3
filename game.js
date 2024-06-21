// game.js

import { GameEngine } from './gameEngine.js';
import { EcosystemManager } from './ecosystemManager.js';
import { UI } from './ui.js';
import { ProgressionSystem } from './progressionSystem.js';
import { EMOJIS } from './constants.js';

class Game {
    constructor() {
        this.gameEngine = new GameEngine();
        this.ecosystemManager = new EcosystemManager();
        this.ui = new UI();
        this.progressionSystem = new ProgressionSystem();
        this.lastTime = 0;
    }

    initialize() {
        this.ui.initializeUI();
        this.setupEventListeners();
        this.gameLoop(0);
    }

    setupEventListeners() {
        const playArea = document.getElementById('play-area');
        playArea.addEventListener('dragover', (e) => e.preventDefault());
        playArea.addEventListener('drop', this.handleDrop.bind(this));
        // Add touch event listeners here
    }

    handleDrop(e) {
        e.preventDefault();
        const x = e.clientX - this.ui.playArea.offsetLeft;
        const y = e.clientY - this.ui.playArea.offsetTop;
        const emoji = e.dataTransfer.getData('text/plain');
        this.addEntityToPlayArea(emoji, x, y);
    }

    addEntityToPlayArea(emoji, x, y) {
        switch(emoji) {
            case EMOJIS.BUSH:
                this.ecosystemManager.addBush(x, y);
                break;
            case EMOJIS.TREE:
                if (this.progressionSystem.canPlantTree()) {
                    this.ecosystemManager.addTree(x, y);
                    this.progressionSystem.treePlanted();
                }
                break;
            case EMOJIS.WORM:
                this.ecosystemManager.addWorm(x, y);
                break;
        }
        this.ui.addEventLogMessage(`A ${this.getEmojiName(emoji)} has been added to the ecosystem!`);
        this.progressionSystem.checkUnlocks();
    }

    getEmojiName(emoji) {
        switch(emoji) {
            case EMOJIS.BUSH: return 'bush';
            case EMOJIS.TREE: return 'tree';
            case EMOJIS.BUTTERFLY: return 'butterfly';
            case EMOJIS.BIRD: return 'bird';
            case EMOJIS.WORM: return 'worm';
            default: return 'creature';
        }
    }

    gameLoop(currentTime) {
        requestAnimationFrame(this.gameLoop.bind(this));
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.ecosystemManager.update(deltaTime);
        this.ui.update();
        
        // Implement basic viewport culling
        const visibleEntities = this.ecosystemManager.getVisibleEntities(this.ui.getViewport());
        this.ui.renderEntities(visibleEntities);
    }
}

const game = new Game();
game.initialize();
