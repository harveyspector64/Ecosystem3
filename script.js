// script.js

import { EMOJIS, INITIAL_EMOJIS } from './constants.js';
import { getRandomTime, getEmojiName } from './utils.js';
import { handleDragStart, handleDrop, handleTouchStart, handleTouchMove, handleTouchEnd } from './eventHandlers.js';
import { gameState, setSelectedEmoji, setDraggedElement, incrementBushesPlanted, incrementTreesPlanted } from './gameState.js';
import { addBird } from './bird.js';
import { addButterflies, updateButterflies } from './butterfly.js';
import { addEventLogMessage } from './eventLogger.js';
import { startWormWiggle } from './worm.js';

// Wrap the entire game in an Immediately Invoked Function Expression (IIFE)
(function() {
    // Performance monitor
    const performanceMonitor = {
        frameCount: 0,
        lastTime: performance.now(),
        fps: 0,
        lastLogTime: 0,

        update: function(currentTime) {
            this.frameCount++;
            if (currentTime - this.lastTime >= 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.lastTime = currentTime;
                
                // Log FPS every 5 seconds
                if (currentTime - this.lastLogTime >= 5000) {
                    console.log(`%cCurrent FPS: ${this.fps}`, 'color: green; font-weight: bold;');
                    this.lastLogTime = currentTime;
                }
            }
        }
    };

    // Initialize cached elements
    window.cachedElements = {
        playArea: null,
        emojiPanel: null,
        eventMenu: null,
        tree: null
    };

    // Game logic functions
    function addEmojiToPanel(emoji, id) {
        const emojiElement = document.createElement('div');
        emojiElement.id = id;
        emojiElement.classList.add('emoji');
        emojiElement.textContent = emoji;
        emojiElement.setAttribute('draggable', 'true');

        emojiElement.addEventListener('dragstart', handleDragStart);
        emojiElement.addEventListener('touchstart', handleTouchStart);

        window.cachedElements.emojiPanel.appendChild(emojiElement);
        console.log(`${id} added to emoji panel`);
    }

    function addWormToPanelWhenFirstBirdLands() {
        if (!gameState.firstBirdLanded) {
            gameState.firstBirdLanded = true;
            addEmojiToPanel(EMOJIS.WORM, 'worm');
        }
    }

    function addEmojiToPlayArea(emoji, x, y) {
        const emojiElement = document.createElement('div');
        emojiElement.textContent = emoji;

        if (emoji === EMOJIS.TREE) {
            emojiElement.classList.add('emoji', 'tree');
            incrementTreesPlanted();
        } else if (emoji === EMOJIS.BUSH) {
            emojiElement.classList.add('emoji', 'bush');
            incrementBushesPlanted();
        } else if (emoji === EMOJIS.BUTTERFLY) {
            emojiElement.classList.add('emoji', 'butterfly');
        } else if (emoji === EMOJIS.BIRD) {
            emojiElement.classList.add('emoji', 'bird');
        } else if (emoji === EMOJIS.WORM) {
            emojiElement.classList.add('emoji', 'worm');
        } else {
            emojiElement.classList.add('emoji');
        }

        emojiElement.style.position = 'absolute';
        emojiElement.style.left = `${x}px`;
        emojiElement.style.top = `${y}px`;
        window.cachedElements.playArea.appendChild(emojiElement);

        console.log(`Added ${emoji} to play area at (${x}, ${y})`);

        if (emoji === EMOJIS.BUSH) {
            addButterflies(emojiElement);
            unlockTree();
        } else if (emoji === EMOJIS.TREE) {
            addBird(x, y);
        } else if (emoji === EMOJIS.WORM) {
            startWormWiggle(emojiElement);
        }

        addEventLogMessage(`A ${getEmojiName(emoji)} has been added to the ecosystem!`);
    }

    function unlockTree() {
        window.cachedElements.tree.classList.remove('disabled');
        window.cachedElements.tree.setAttribute('draggable', 'true');
    }

    // Update functions
    function updateBirds() {
        // Implement bird movement and behavior here
        // This function should be implemented in bird.js and imported if needed
    }

    function updateWorms() {
        // Implement worm wiggling here
        // This function should be implemented in worm.js and imported if needed
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
        window.cachedElements.playArea.addEventListener('drop', (e) => handleDrop(e, window.cachedElements.playArea));
        window.cachedElements.emojiPanel.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', (e) => handleTouchEnd(e, window.cachedElements.playArea));
    }

    // Expose necessary functions to the global scope
    window.addWormToPanel = addWormToPanelWhenFirstBirdLands;
    window.addEmojiToPlayArea = addEmojiToPlayArea;

    // Initialize the game when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', initializeGame);
})();
