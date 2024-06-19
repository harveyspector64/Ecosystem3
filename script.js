document.addEventListener('DOMContentLoaded', () => {
    const playArea = document.getElementById('play-area');
    const sidebar = document.getElementById('sidebar');
    let draggedEmoji = null;
    let draggingVisual = null;
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let firstBirdLanded = false;

    // Initialize emojis in the sidebar
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

    sidebar.addEventListener('dragstart', handleDragStart);
    sidebar.addEventListener('touchstart', handleTouchStart);

    function handleDragStart(e) {
        const draggedElement = e.target;
        if (!draggedElement.classList.contains('emoji')) return;

        draggedEmoji = draggedElement.textContent;
        console.log(`Drag start: ${draggedEmoji}`);

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

        draggingVisual = createDraggingVisual(draggedEmoji);
        draggingVisual.style.left = `${touch.clientX - offsetX}px`;
        draggingVisual.style.top = `${touch.clientY - offsetY}px`;

        isDragging = true;
        e.preventDefault();
    }

    playArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (isDragging && draggedEmoji) {
            console.log('Drag over play area (desktop)');
        }
    });

    playArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (isDragging && draggedEmoji && draggingVisual) {
            const touch = e.touches[0];
            draggingVisual.style.left = `${touch.clientX - offsetX}px`;
            draggingVisual.style.top = `${touch.clientY - offsetY}px`;
        }
    });

    playArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (isDragging && draggedEmoji) {
            const x = e.clientX - playArea.offsetLeft;
            const y = e.clientY - playArea.offsetTop;
            placeEmoji(draggedEmoji, x, y);
            isDragging = false;
        }
    });

    playArea.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (isDragging && draggedEmoji && draggingVisual) {
            const touch = e.changedTouches[0];
            const x = touch.clientX - playArea.offsetLeft - offsetX;
            const y = touch.clientY - playArea.offsetTop - offsetY;
            placeEmoji(draggedEmoji, x, y);

            draggingVisual.remove();
            draggingVisual = null;
            isDragging = false;
        }
    });

    function placeEmoji(emoji, x, y) {
        console.log(`Placing emoji: ${emoji} at (${x}, ${y})`);
        if (emoji === EMOJIS.WORM) {
            addWorm(x, y);
        } else {
            addEmojiToPlayArea(emoji, x, y, playArea);
        }
    }

    function addEmojiToPlayArea(emoji, x, y, playArea) {
        const emojiElement = document.createElement('div');
        emojiElement.textContent = emoji;

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

        if (emoji === EMOJIS.BUSH) {
            addButterflies(x, y, playArea);
            unlockTree();
        } else if (emoji === EMOJIS.TREE) {
            addBird(x, y, playArea);
        }
    }

    function unlockTree() {
        const tree = document.getElementById('tree');
        if (tree) {
            tree.classList.remove('disabled');
            tree.setAttribute('draggable', 'true');
        }
    }

    function addWorm(x, y) {
        const wormElement = document.createElement('div');
        wormElement.textContent = EMOJIS.WORM;
        wormElement.classList.add('emoji', 'worm');
        wormElement.style.position = 'absolute';
        wormElement.style.left = `${x}px`;
        wormElement.style.top = `${y}px`;
        playArea.appendChild(wormElement);
    }

    function addWormToPanelWhenFirstBirdLands() {
        if (!firstBirdLanded) {
            firstBirdLanded = true;
            addEmojiToPanel(EMOJIS.WORM, 'worm');
        }
    }

    function addBird(x, y, playArea) {
        const delay = Math.random() * 8000 + 4000;
        console.log(`Spawning bird after delay: ${delay}`);

        setTimeout(() => {
            const birdElement = document.createElement('div');
            birdElement.textContent = EMOJIS.BIRD;
            birdElement.classList.add('emoji', 'bird');
            birdElement.style.position = 'absolute';
            birdElement.style.left = `${Math.random() * playArea.clientWidth}px`;
            birdElement.style.top = `${Math.random() * playArea.clientHeight}px`;
            birdElement.style.zIndex = '1';
            playArea.appendChild(birdElement);

            birdElement.hunger = 100;
            setState(birdElement, birdStates.FLYING);
            console.log(`Bird spawned with hunger: ${birdElement.hunger} at position ${birdElement.style.left} ${birdElement.style.top}`);

            birdFlightPattern(birdElement, playArea, false);
        }, delay);
    }

    function addEmojiToPanel(emoji, id) {
        const emojiElement = document.createElement('div');
        emojiElement.id = id;
        emojiElement.classList.add('emoji');
        emojiElement.textContent = emoji;
        emojiElement.setAttribute('draggable', 'true');

        emojiElement.addEventListener('dragstart', (e) => {
            const draggedElement = e.target;
            if (!draggedElement.classList.contains('emoji')) return;

            draggedEmoji = draggedElement.textContent;
            console.log(`Drag start: ${draggedEmoji}`);
        });

        sidebar.appendChild(emojiElement);
        console.log(`${id} added to sidebar`);
    }

    window.addWormToPanel = addWormToPanelWhenFirstBirdLands;
});
