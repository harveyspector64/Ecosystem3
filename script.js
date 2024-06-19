document.addEventListener('DOMContentLoaded', () => {
    const playArea = document.getElementById('play-area');
    const sidebar = document.getElementById('sidebar');
    let draggedEmoji = null;
    let draggingVisual = null;
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

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

    // Add both dragstart and touchstart listeners
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
            draggedEmoji = null;
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
            draggedEmoji = null;
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

    function createDraggingVisual(emoji) {
        const visual = document.createElement('div');
        visual.textContent = emoji;
        visual.classList.add('dragging-visual');
        document.body.appendChild(visual);
        return visual;
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
        tree.classList.remove('disabled');
        tree.setAttribute('draggable', 'true');
    }

    function addButterflies(x, y, playArea) {
        const numButterflies = Math.floor(Math.random() * 2) + 1;
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

        butterflyElement.hunger = 100;
        moveButterfly(butterflyElement, targetX, targetY, playArea);
    }

    function moveButterfly(butterfly, targetX, targetY, playArea) {
        const interval = setInterval(() => {
            const currentX = parseFloat(butterfly.style.left);
            const currentY = parseFloat(butterfly.style.top);

            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 20 + 30;

            const newX = currentX + distance * Math.cos(angle);
            const newY = currentY + distance * Math.sin(angle);

            butterfly.style.left = `${newX}px`;
            butterfly.style.top = `${newY}px`;

            butterfly.hunger -= 1;

            if (butterfly.hunger <= 0) {
                clearInterval(interval);
                butterflyLand(butterfly, targetX, targetY, playArea);
            }
        }, 300);
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
                butterfly.hunger = 100;
                moveButterfly(butterfly, parseFloat(nearestBush.style.left), parseFloat(nearestBush.style.top), playArea);
            }, getRandomTime(5, 10) * 1000);
        }
    }

    function getRandomEdgePosition(axis, playArea) {
        if (axis === 'x') {
            return Math.random() > 0.5 ? 0 : playArea.clientWidth - 20;
        } else {
            return Math.random() > 0.5 ? 0 : playArea.clientHeight - 20;
        }
    }

    function getRandomTime(min, max) {
        return Math.random() * (max - min) + min;
    }

    window.addWormToPanel = addWormToPanelWhenFirstBirdLands;
});
