// game.js

import { EcosystemManager } from './ecosystemManager.js';
import { EMOJIS } from './constants.js';

class Game {
    constructor() {
        this.playArea = document.getElementById('play-area');
        this.emojiPanel = document.getElementById('emoji-panel');
        this.ecosystemManager = new EcosystemManager(this.playArea);
        this.lastTime = 0;
    }

    initialize() {
        this.setupEventListeners();
        this.gameLoop(0);
    }

    setupEventListeners() {
        this.playArea.addEventListener('dragover', (e) => e.preventDefault());
        this.playArea.addEventListener('drop', this.handleDrop.bind(this));
        this.emojiPanel.addEventListener('dragstart', this.handleDragStart.bind(this));
    }

    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.textContent);
    }

    handleDrop(e) {
        e.preventDefault();
        const x = e.clientX - this.playArea.offsetLeft;
        const y = e.clientY - this.playArea.offsetTop;
        const emoji = e.dataTransfer.getData('text/plain');
        this.addEmojiToPlayArea(emoji, x, y);
    }

    addEmojiToPlayArea(emoji, x, y) {
        switch(emoji) {
            case EMOJIS.BUSH:
                this.ecosystemManager.addBush(x, y);
                break;
            case EMOJIS.TREE:
                this.ecosystemManager.addTree(x, y);
                break;
            case EMOJIS.WORM:
                this.ecosystemManager.addWorm(x, y);
                break;
        }
        this.addEventLogMessage(`A ${this.getEmojiName(emoji)} has been added to the ecosystem!`);
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

    addEventLogMessage(message) {
        const eventMenu = document.getElementById('event-menu');
        const eventMessageElement = document.createElement('div');
        eventMessageElement.className = 'event-message';
        eventMessageElement.textContent = message;
        eventMenu.appendChild(eventMessageElement);
        
        while (eventMenu.children.length > 6) {
            eventMenu.removeChild(eventMenu.children[1]);
        }
        
        console.log(`BREAKING NEWS: ${message}`);
    }

    gameLoop(currentTime) {
        requestAnimationFrame(this.gameLoop.bind(this));
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.ecosystemManager.update(deltaTime);
    }
}

const game = new Game();
game.initialize();

// Expose necessary functions to the global scope
window.addWormToPanel = () => {
    const wormElement = document.createElement('div');
    wormElement.textContent = EMOJIS.WORM;
    wormElement.id = 'worm';
    wormElement.classList.add('emoji');
    wormElement.setAttribute('draggable', 'true');
    document.getElementById('emoji-panel').appendChild(wormElement);
};
