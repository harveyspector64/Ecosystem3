document.addEventListener('DOMContentLoaded', () => {
    const playArea = document.getElementById('play-area');
    const sidebar = document.getElementById('sidebar');
    let draggedEmoji = null;
    let draggingVisual = null; // For visual feedback (mobile only)
    let isDragging = false; // Flag to track dragging state 
    let offsetX = 0; 
    let offsetY = 0; 

    // Initialize emojis in the sidebar with null checks
    INITIAL_EMOJIS.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
            if (item.disabled) {
                element.classList.add('disabled');
                element.setAttribute('draggable', 'false');
            } else {
                element.setAttribute('draggable', 'true');
            }
        }
    });

    // Add both dragstart and touchstart listeners
    sidebar.addEventListener('dragstart', handleDragStart);
    sidebar.addEventListener('touchstart', handleTouchStart);

    function handleDragStart(e) {
        const draggedElement = e.target;
        if (!draggedElement.classList.contains('emoji')) return;

        draggedEmoji = draggedElement.textContent;
        console.log(`Drag start: ${draggedEmoji}`);

        // For desktop, set dataTransfer 
        e.dataTransfer.setData('text/plain', draggedEmoji); 
        isDragging = true; 
    }

    function handleTouchStart(e) {
        const draggedElement = e.target;
        if (!draggedElement.classList.contains('emoji')) return;

        draggedEmoji = draggedElement.textContent;
        const touch = e.touches[0];
        offsetX = touch.clientX - draggedElement.getBoundingClientRect().left;
        offsetY = touch.clientY - draggedElement.getBoundingClientRect().top;
        console.log(`Touch start: ${draggedEmoji}`);

        // Create visual feedback for mobile
        draggingVisual = createDraggingVisual(draggedEmoji);
        draggingVisual.style.left = `${touch.clientX - offsetX}px`;
        draggingVisual.style.top = `${touch.clientY - offsetY}px`;

        isDragging = true;
        e.preventDefault(); 
    }

    // Unified drag handling
    playArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (isDragging && draggedEmoji) {
            // Desktop drag handling
            console.log('Drag over play area (desktop)'); 
        }
    });

    playArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (isDragging && draggedEmoji && draggingVisual) {
            // Mobile drag handling
            const touch = e.touches[0];
            draggingVisual.style.left = `${touch.clientX - offsetX}px`;
            draggingVisual.style.top = `${touch.clientY - offsetY}px`;
        }
    });

    // Unified drop handling
    playArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (isDragging && draggedEmoji) {
            // Desktop drop handling 
            const x = e.clientX - playArea.offsetLeft;
            const y = e.clientY - playArea.offsetTop;
            placeEmoji(draggedEmoji, x, y);
            isDragging = false; 
        }
    });

    playArea.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (isDragging && draggedEmoji && draggingVisual) {
            // Mobile drop handling
            const touch = e.changedTouches[0];
            const x = touch.clientX - playArea.offsetLeft - offsetX;
            const y = touch.clientY - playArea.offsetTop - offsetY;
            placeEmoji(draggedEmoji, x, y);

            draggingVisual.remove();
            draggingVisual = null;
            isDragging = false; 
        }
    });

    // Function to place emoji (desktop and mobile)
    function placeEmoji(emoji, x, y) {
        console.log(`Placing emoji: ${emoji} at (${x}, ${y})`);
        if (emoji === EMOJIS.WORM) {
            addWorm(x, y);
        } else {
            addEmojiToPlayArea(emoji, x, y, playArea);
        }
    }

    // Unified function to add emojis to play area
    function addEmojiToPlayArea(emoji, x, y, playArea) {
        const emojiElement = document.createElement('div');
        emojiElement.textContent = emoji;

        // Apply specific classes for styling
        if (emoji === EMOJIS.TREE) {
            emojiElement.classList.add('emoji', 'tree');
            addBird(x, y, playArea);
        } else if (emoji === EMOJIS.BUTTERFLY) {
            emojiElement.classList.add('emoji', 'butterfly');
        } else if (emoji === EMOJIS.WORM) {
            emojiElement.classList.add('emoji', 'worm');
        } else {
            emojiElement.classList.add('emoji');
        }

        emojiElement.style.position = 'absolute';
        emojiElement.style.left = `${x}px`;
        emojiElement.style.top = `${y}px`;
        playArea.appendChild(emojiElement);

        console.log(`Added ${emoji} to play area at (${x}, ${y})`);

        // Additional logic for specific emojis
        if (emoji === EMOJIS.BUSH) {
            addButterflies(x, y, playArea);
            unlockTree();
        }
    }

    // Function to add birds to the play area
    function addBird(x, y, playArea) {
        const delay = Math.random() * 8000 + 4000; // 4-12 seconds delay
        console.log(`Spawning bird after delay: ${delay}`);
        
        setTimeout(() => {
            const birdElement = document.createElement('div');
            birdElement.textContent = EMOJIS.BIRD;
            birdElement.classList.add('emoji', 'bird');
            birdElement.style.position = 'absolute';
            birdElement.style.left = `${Math.random() * playArea.clientWidth}px`;
            birdElement.style.top = `${Math.random() * playArea.clientHeight}px`;
            birdElement.style.zIndex = '1'; // Ensure bird is above other elements
            playArea.appendChild(birdElement);

            birdElement.hunger = 100; // Initialize hunger
            setState(birdElement, birdStates.FLYING);
            console.log(`Bird spawned with hunger: ${birdElement.hunger} at position ${birdElement.style.left} ${birdElement.style.top}`);

            birdFlightPattern(birdElement, playArea, false);
        }, delay);
    }

    // Unified function to add worms to the play area
    function addWorm(x, y) {
        const wormElement = document.createElement('div');
        wormElement.textContent = EMOJIS.WORM;
        wormElement.classList.add('emoji', 'worm');
        wormElement.style.position = 'absolute';
        wormElement.style.left = `${x}px`;
        wormElement.style.top = `${y}px`;
        playArea.appendChild(wormElement);
    }

    // Unified function to create visual feedback for mobile dragging
    function createDraggingVisual(emoji) {
        const visual = document.createElement('div');
        visual.textContent = emoji;
        visual.classList.add('dragging-visual');
        document.body.appendChild(visual);
        return visual;
    }

    // Function to add worms to the panel when the first bird lands
    function addWormToPanelWhenFirstBirdLands() {
        if (!firstBirdLanded) {
            firstBirdLanded = true;
            addEmojiToPanel(EMOJIS.WORM, 'worm');
        }
    }

    // Ensure the worm is correctly added to the sidebar with event listeners
    function addEmojiToPanel(emoji, id) {
        const emojiElement = document.createElement('div');
        emojiElement.id = id;
        emojiElement.classList.add('emoji');
        emojiElement.textContent = emoji;
        emojiElement.setAttribute('draggable', 'true');

        // Attach the same dragstart listener
        emojiElement.addEventListener('dragstart', (e) => {
            const draggedElement = e.target;
            if (!draggedElement.classList.contains('emoji')) return;

            draggedEmoji = draggedElement.textContent;
            console.log(`Drag start: ${draggedEmoji}`);
        });

        sidebar.appendChild(emojiElement);
        console.log(`${id} added to sidebar`);
    }

    // Function to unlock tree
    function unlockTree() {
        const tree = document.getElementById('tree');
        if (tree) {
            tree.classList.remove('disabled');
            tree.setAttribute('draggable', 'true');
        }
    }

    // Function to add butterflies to the play area
    function addButterflies(x, y, playArea) {
        const numButterflies = Math.floor(Math.random() * 2) + 1; // 1-2 butterflies per bush
        for (let i = 0; i < numButterflies; i++) {
            setTimeout(() => createButterfly(x, y, playArea), getRandomTime(10, 20) * 1000);
        }
    }

    // Function to create butterfly
    function createButterfly(targetX, targetY, playArea) {
        const butterflyElement = document.createElement('div');
        butterflyElement.textContent = EMOJIS.BUTTERFLY;
        butterflyElement.classList.add('emoji', 'butterfly');
        butterflyElement.style.position = 'absolute';
        butterflyElement.style.left = getRandomEdgePosition('x', playArea) + 'px';
        butterflyElement.style.top = getRandomEdgePosition('y', playArea) + 'px';
        playArea.appendChild(butterflyElement);

        butterflyElement.hunger = 100; // Initialize hunger bar
        moveButterfly(butterflyElement, targetX, targetY, playArea);
    }

    // Function to move butterfly
    function moveButterfly(butterfly, targetX, targetY, playArea) {
        const interval = setInterval(() => {
            const currentX = parseFloat(butterfly.style.left);
            const currentY = parseFloat(butterfly.style.top);

            const angle = Math.random() * Math.PI * 2; // Random angle
            const distance = Math.random() * 20 + 30; // Smaller distance for smoother movement

            const newX = currentX + distance * Math.cos(angle);
            const newY = currentY + distance * Math.sin(angle);

            butterfly.style.left = `${newX}px`;
            butterfly.style.top = `${newY}px`;

            butterfly.hunger -= 1; // Decrease hunger over time

            if (butterfly.hunger <= 0) {
                clearInterval(interval);
                butterflyLand(butterfly, targetX, targetY, playArea);
            }
        }, 300); // Slower interval for smoother, less jerky movement
    }

    // Function to land butterfly
    function butterflyLand(butterfly, targetX, targetY, playArea) {
        const bushes = document.querySelectorAll('.emoji');
        let nearestBush = null;
        let minDistance = Infinity;

        bushes.forEach(bush => {
            if (bush.textContent === EMOJIS.BUSH) {
                const bushX = parseFloat(bush.style.left);
                const bushY = parseFloat(bush.style.top);
                const distance = Math.sqrt((bushX - targetX) ** 2 + (bushY - targetY) ** 2);

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestBush = bush;
                }
            }
        });

        if (nearestBush) {
            butterfly.style.left = nearestBush.style.left;
            butterfly.style.top = nearestBush.style.top;

            setTimeout(() => {
                butterfly.hunger = 100; // Reset hunger
                moveButterfly(butterfly, parseFloat(nearestBush.style.left), parseFloat(nearestBush.style.top), playArea);
            }, getRandomTime(5, 10) * 1000);
        }
    }

    // Function to get random edge position
    function getRandomEdgePosition(axis, playArea) {
        if (axis === 'x') {
            return Math.random() > 0.5 ? 0 : playArea.clientWidth - 20; // Adjust 20 for margin
        } else {
            return Math.random() > 0.5 ? 0 : playArea.clientHeight - 20;
        }
    }

    // Function to get random time
    function getRandomTime(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Expose addWormToPanel globally
    window.addWormToPanel = addWormToPanelWhenFirstBirdLands;
});
