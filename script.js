document.addEventListener('DOMContentLoaded', () => {
    const playArea = document.getElementById('play-area');
    const sidebar = document.getElementById('sidebar');
    let draggedEmoji = null;

    // Initialize emojis in the sidebar
    INITIAL_EMOJIS.forEach(item => {
        const element = document.getElementById(item.id);
        if (item.disabled) {
            element.classList.add('disabled');
            element.setAttribute('draggable', 'false');
        } else {
            element.setAttribute('draggable', 'true');
        }

        // Handle drag start event
        element.addEventListener('dragstart', (e) => {
            draggedEmoji = item.emoji;
        });

        // Handle touch start event for mobile
        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            draggedEmoji = item.emoji;
        });
    });

    // Handle drag over event in play area
    playArea.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    // Handle drop event in play area
    playArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedEmoji) {
            const x = e.clientX - playArea.offsetLeft;
            const y = e.clientY - playArea.offsetTop;
            addEmojiToPlayArea(draggedEmoji, x, y);
            draggedEmoji = null;
        }
    });

    // Handle touch end event for mobile
    playArea.addEventListener('touchend', (e) => {
        if (draggedEmoji) {
            const touch = e.changedTouches[0];
            const x = touch.clientX - playArea.offsetLeft;
            const y = touch.clientY - playArea.offsetTop;
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

        // Additional logic for specific emojis
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

    // Ensure addBird is called for each tree
    playArea.addEventListener('dragend', (e) => {
        const draggedEmoji = e.dataTransfer.getData('text');
        if (draggedEmoji === EMOJIS.TREE) {
            const x = e.clientX - playArea.offsetLeft;
            const y = e.clientY - playArea.offsetTop;
            addBird(x, y);
        }
    });

    // Bird-related logic (as discussed before)
    // ... (keeping the bird logic unchanged for now)

    function addWormToPanel() {
        const wormElement = document.createElement('div');
        wormElement.id = 'worm';
        wormElement.classList.add('emoji');
        wormElement.textContent = EMOJIS.WORM;
        wormElement.setAttribute('draggable', 'true');
        wormElement.addEventListener('dragstart', (e) => {
            draggedEmoji = EMOJIS.WORM;
        });

        sidebar.appendChild(wormElement);
        console.log('Worm emoji added to the panel.');
    }
});
