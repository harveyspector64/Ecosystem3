
// script.js

document.addEventListener('DOMContentLoaded', () => {
    const playArea = document.getElementById('play-area');
    const sidebar = document.getElementById('sidebar');
    let draggedEmoji = null;
    let activeEmoji = null;

    INITIAL_EMOJIS.forEach(item => {
        const element = document.getElementById(item.id);
        if (item.disabled) {
            element.classList.add('disabled');
            element.setAttribute('draggable', 'false');
        }

        // Mouse events
        element.addEventListener('dragstart', (e) => {
            draggedEmoji = item.emoji;
        });

        element.addEventListener('dragend', (e) => {
            const x = e.clientX - playArea.offsetLeft;
            const y = e.clientY - playArea.offsetTop;
            addEmojiToPlayArea(draggedEmoji, x, y);
            draggedEmoji = null;
        });

        // Touch events
        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            draggedEmoji = item.emoji;
            activeEmoji = document.createElement('div');
            activeEmoji.textContent = draggedEmoji;
            activeEmoji.classList.add('emoji');
            activeEmoji.style.position = 'absolute';
            activeEmoji.style.left = `${e.touches[0].clientX}px`;
            activeEmoji.style.top = `${e.touches[0].clientY}px`;
            document.body.appendChild(activeEmoji);
        });

        element.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (activeEmoji) {
                activeEmoji.style.left = `${e.touches[0].clientX}px`;
                activeEmoji.style.top = `${e.touches[0].clientY}px`;
            }
        });

        element.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (activeEmoji) {
                activeEmoji.remove();
                activeEmoji = null;
                const touch = e.changedTouches[0];
                const x = touch.clientX - playArea.offsetLeft;
                const y = touch.clientY - playArea.offsetTop;
                addEmojiToPlayArea(draggedEmoji, x, y);
                draggedEmoji = null;
            }
        });
    });

    // Prevent default touch actions on play area
    playArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
    });

    // Mouse events
    playArea.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    playArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedEmoji) {
            const x = e.clientX - playArea.offsetLeft;
            const y = e.clientY - playArea.offsetTop;
            addEmojiToPlayArea(draggedEmoji, x, y);
            draggedEmoji = null;
        }
    });

    function addEmojiToPlayArea(emoji, x, y) {
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

        if (emoji === EMOJIS.BUSH) {
            addButterflies(x, y);
            unlockTree();
        } else if (emoji === EMOJIS.TREE) {
            addBird(x, y);
        }
    }

    function unlockTree() {
        const tree = document.getElementById('tree');
        tree.classList.remove('disabled');
        tree.setAttribute('draggable', 'true');
    }

    function addButterflies(x, y) {
        const numButterflies = Math.floor(Math.random() * 2) + 1; // 1-2 butterflies per bush
        for (let i = 0; i < numButterflies; i++) {
            setTimeout(() => createButterfly(x, y), getRandomTime(10, 20) * 1000);
        }
    }

    function createButterfly(targetX, targetY) {
        const playArea = document.getElementById('play-area');
        const butterflyElement = document.createElement('div');
        butterflyElement.textContent = EMOJIS.BUTTERFLY;
        butterflyElement.classList.add('emoji', 'butterfly');
        butterflyElement.style.position = 'absolute';
        butterflyElement.style.left = getRandomEdgePosition('x') + 'px';
        butterflyElement.style.top = getRandomEdgePosition('y') + 'px';
        playArea.appendChild(butterflyElement);

        butterflyElement.hunger = 100; // Initialize hunger bar
        moveButterfly(butterflyElement, targetX, targetY);
    }

    function moveButterfly(butterfly, targetX, targetY) {
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
                butterflyLand(butterfly, targetX, targetY);
            }
        }, 300); // Slower interval for smoother, less jerky movement
    }

    function butterflyLand(butterfly, targetX, targetY) {
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
                moveButterfly(butterfly, parseFloat(nearestBush.style.left), parseFloat(nearestBush.style.top));
            }, getRandomTime(5, 10) * 1000);
        }
    }

    function addBird(x, y) {
        const playArea = document.getElementById('play-area');
        const birdElement = document.createElement('div');
        birdElement.textContent = EMOJIS.BIRD;
        birdElement.classList.add('emoji', 'bird');
        birdElement.style.position = 'absolute';
        birdElement.style.left = getRandomEdgePosition('x') + 'px';
        birdElement.style.top = getRandomEdgePosition('y') + 'px';
        playArea.appendChild(birdElement);

        console.log(`Bird placed at: (${x}, ${y})`);

        birdElement.landingSpotX = x;
        birdElement.landingSpotY = y;
        moveBird(birdElement, x, y);
    }

    function moveBird(bird, targetX, targetY) {
        const interval = setInterval(() => {
            const currentX = parseFloat(bird.style.left);
            const currentY = parseFloat(bird.style.top);

            const angle = Math.random() * Math.PI * 2; // Random angle
            const distance = Math.random() * 50 + 50; // Random distance

            const newX = currentX + distance * Math.cos(angle);
            const newY = currentY + distance * Math.sin(angle);

            bird.style.left = `${newX}px`;
            bird.style.top = `${newY}px`;

            const distanceToTarget = Math.sqrt((newX - targetX) ** 2 + (newY - targetY) ** 2);
            if (distanceToTarget < 20) {
                clearInterval(interval);
                bird.style.left = `${targetX}px`;
                bird.style.top = `${targetY - 60}px`; // Land on the top part of the tree
                birdCount++;
                if (birdCount === 1) {
                    addBirdToPanel();
                }
            }
        }, 500);
    }

    function addBirdToPanel() {
        const birdElement = document.createElement('div');
        birdElement.id = 'bird';
        birdElement.classList.add('emoji');
        birdElement.textContent = EMOJIS.BIRD;
        birdElement.setAttribute('draggable', 'true');
        birdElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', EMOJIS.BIRD);
        });

        const sidebar = document.getElementById('sidebar');
        sidebar.appendChild(birdElement);
    }

    function addWorms(x, y) {
        const playArea = document.getElementById('play-area');
        const wormElement = document.createElement('div');
        wormElement.textContent = EMOJIS.WORM;
        wormElement.classList.add('emoji', 'worm');
        wormElement.style.position = 'absolute';
        wormElement.style.left = `${getRandomOffset()}px`;
        wormElement.style.top = `${getRandomOffset()}px`;
        playArea.appendChild(wormElement);

        console.log(`Worm placed at: (${getRandomOffset()}, ${getRandomOffset()})`);
    }

    function getRandomOffset() {
        const playArea = document.getElementById('play-area');
        return Math.floor(Math.random() * playArea.clientWidth);
    }

    function getRandomTime(min, max) {
        return Math.random() * (max - min) + min;
    }

    function getRandomEdgePosition(axis) {
        const playArea = document.getElementById('play-area');
        if (axis === 'x') {
            return Math.random() > 0.5 ? 0 : playArea.clientWidth - 20; // Adjust 20 for margin
        } else {
            return Math.random() > 0.5 ? 0 : playArea.clientHeight - 20;
        }
    }
});
