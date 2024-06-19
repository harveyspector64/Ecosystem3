document.addEventListener('DOMContentLoaded', () => {
    const playArea = document.getElementById('play-area');
    const sidebar = document.getElementById('sidebar');
    let draggedEmoji = null;
    let touchOffsetX = 0;
    let touchOffsetY = 0;

    // Initialize emojis in the sidebar
    INITIAL_EMOJIS.forEach(item => {
        const element = document.getElementById(item.id);
        if (item.disabled) {
            element.classList.add('disabled');
            element.setAttribute('draggable', 'false');
        } else {
            element.setAttribute('draggable', 'true');
        }
    });

    // Use a single dragstart event listener on the sidebar container
    sidebar.addEventListener('dragstart', handleDragStart);
    sidebar.addEventListener('touchstart', handleTouchStart);

    function handleDragStart(e) {
        const draggedElement = e.target;
        if (!draggedElement.classList.contains('emoji')) return;

        draggedEmoji = draggedElement.textContent;
        console.log(`Drag start: ${draggedEmoji}`);
    }

    function handleTouchStart(e) {
        const draggedElement = e.target;
        if (!draggedElement.classList.contains('emoji')) return;

        draggedEmoji = draggedElement.textContent;
        const touch = e.touches[0];
        touchOffsetX = touch.clientX - draggedElement.getBoundingClientRect().left;
        touchOffsetY = touch.clientY - draggedElement.getBoundingClientRect().top;
        console.log(`Touch start: ${draggedEmoji}`);
        
        playArea.addEventListener('touchmove', handleTouchMove);
        playArea.addEventListener('touchend', handleTouchEnd);
        e.preventDefault();
    }

    function handleTouchMove(e) {
        if (!draggedEmoji) return;

        const touch = e.touches[0];
        const x = touch.clientX - playArea.offsetLeft - touchOffsetX;
        const y = touch.clientY - playArea.offsetTop - touchOffsetY;

        const emojiElement = document.getElementById(draggedEmoji);
        emojiElement.style.position = 'absolute';
        emojiElement.style.left = `${x}px`;
        emojiElement.style.top = `${y}px`;
        emojiElement.style.zIndex = '1000'; // Ensure it's on top

        e.preventDefault();
    }

    function handleTouchEnd(e) {
        if (!draggedEmoji) return;

        const touch = e.changedTouches[0];
        const x = touch.clientX - playArea.offsetLeft - touchOffsetX;
        const y = touch.clientY - playArea.offsetTop - touchOffsetY;

        console.log(`Touch end: ${draggedEmoji} at (${x}, ${y})`);
        if (draggedEmoji === EMOJIS.WORM) {
            addWorm(x, y);
        } else {
            addEmojiToPlayArea(draggedEmoji, x, y, playArea);
        }

        draggedEmoji = null;
        touchOffsetX = 0;
        touchOffsetY = 0;

        playArea.removeEventListener('touchmove', handleTouchMove);
        playArea.removeEventListener('touchend', handleTouchEnd);
    }

    // Ensure the worm is correctly added to the sidebar with event listeners
    function addEmojiToPanel(emoji, id) {
        const emojiElement = document.createElement('div');
        emojiElement.id = id;
        emojiElement.classList.add('emoji');
        emojiElement.textContent = emoji;
        emojiElement.setAttribute('draggable', 'true');
        emojiElement.addEventListener('dragstart', handleDragStart);
        emojiElement.addEventListener('touchstart', handleTouchStart);
        sidebar.appendChild(emojiElement);
        console.log(`${id} added to sidebar`);
    }

    // Call this function when the first bird lands
    function addWormToPanelWhenFirstBirdLands() {
        if (!firstBirdLanded) {
            firstBirdLanded = true;
            addEmojiToPanel(EMOJIS.WORM, 'worm');
        }
    }

    // Define addWorm function
    function addWorm(x, y) {
        const wormElement = document.createElement('div');
        wormElement.textContent = EMOJIS.WORM;
        wormElement.classList.add('emoji', 'worm');
        wormElement.style.position = 'absolute';
        wormElement.style.left = `${x}px`;
        wormElement.style.top = `${y}px`;
        playArea.appendChild(wormElement);
    }

    // Handle drag over event in play area
    playArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        console.log('Drag over play area');
    });

    // Handle drop event in play area
    playArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedEmoji) {
            const x = e.clientX - playArea.offsetLeft;
            const y = e.clientY - playArea.offsetTop;
            console.log(`Drop: ${draggedEmoji} at (${x}, ${y})`);
            if (draggedEmoji === EMOJIS.WORM) {
                addWorm(x, y);
            } else {
                addEmojiToPlayArea(draggedEmoji, x, y, playArea);
            }
            draggedEmoji = null;
        } else {
            console.log('No dragged emoji');
        }
    });

    // Handle touch end event for mobile
    playArea.addEventListener('touchend', handleTouchEnd);

    function addEmojiToPlayArea(emoji, x, y, playArea) {
        const emojiElement = document.createElement('div');
        emojiElement.textContent = emoji;

        // Apply specific classes for styling
        if (emoji === EMOJIS.TREE) {
            emojiElement.classList.add('emoji', 'tree');
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
        playArea.appendChild(emojiElement);

        console.log(`Added ${emoji} to play area at (${x}, ${y})`);

        // Additional logic for specific emojis
        if (emoji === EMOJIS.BUSH) {
            addButterflies(x, y, playArea);
            unlockTree();
        } else if (emoji === EMOJIS.TREE) {
            addBird(x, y, playArea);
        }
    }

    function unlockTree() {
        const tree = document.getElementById('tree');
        tree.classList.remove('disabled');
        tree.setAttribute('draggable', 'true');
    }

    function addButterflies(x, y, playArea) {
        const numButterflies = Math.floor(Math.random() * 2) + 1; // 1-2 butterflies per bush
        for (let i = 0; i < numButterflies; i++) {
            setTimeout(() => createButterfly(x, y, playArea), getRandomTime(10, 20) * 1000);
        }
    }

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

    function getRandomEdgePosition(axis, playArea) {
        if (axis === 'x') {
            return Math.random() > 0.5 ? 0 : playArea.clientWidth - 20; // Adjust 20 for margin
        } else {
            return Math.random() > 0.5 ? 0 : playArea.clientHeight - 20;
        }
    }

    function getRandomTime(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Expose addWormToPanel globally
    window.addWormToPanel = addWormToPanelWhenFirstBirdLands;
});
