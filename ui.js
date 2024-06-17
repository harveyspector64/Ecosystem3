document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const playArea = document.getElementById('play-area');

    INITIAL_EMOJIS.forEach(emojiType => {
        const emoji = document.createElement('div');
        emoji.className = 'emoji';
        emoji.textContent = EMOJIS[emojiType];
        emoji.draggable = true;

        emoji.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', emojiType);
        });

        emoji.addEventListener('touchstart', (e) => {
            e.dataTransfer = { setData: () => {} }; // Mock setData for touch
            e.dataTransfer.setData('text/plain', emojiType);
        });

        sidebar.appendChild(emoji);
    });

    playArea.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    playArea.addEventListener('drop', (e) => {
        e.preventDefault();
        const emojiType = e.dataTransfer.getData('text/plain');
        const x = e.clientX;
        const y = e.clientY;
        addEmojiToPlayArea(emojiType, x, y);
    });

    playArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        const emojiType = e.target.textContent;
        addEmojiToPlayArea(emojiType, x, y);
    });
});

function addEmojiToPlayArea(emojiType, x, y) {
    const playArea = document.getElementById('play-area');
    const emoji = document.createElement('div');
    emoji.className = emojiType;
    emoji.textContent = EMOJIS[emojiType];
    emoji.style.left = `${x}px`;
    emoji.style.top = `${y}px`;
    playArea.appendChild(emoji);
    handleEmojiPlacement(emojiType, x, y);
}

function unlockEmoji(emojiType) {
    const sidebar = document.getElementById('sidebar');
    const emoji = document.createElement('div');
    emoji.className = 'emoji';
    emoji.textContent = EMOJIS[emojiType];
    emoji.draggable = true;

    emoji.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', emojiType);
    });

    emoji.addEventListener('touchstart', (e) => {
        e.dataTransfer = { setData: () => {} }; // Mock setData for touch
        e.dataTransfer.setData('text/plain', emojiType);
    });

    sidebar.appendChild(emoji);
}
