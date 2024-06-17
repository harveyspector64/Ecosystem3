document.addEventListener('DOMContentLoaded', () => {
    const emojiPanel = document.getElementById('emoji-panel');
    const playArea = document.getElementById('play-area');

    INITIAL_EMOJIS.forEach(emojiType => {
        const emojiButton = document.createElement('button');
        emojiButton.textContent = EMOJIS[emojiType];
        emojiButton.classList.add('emoji');
        emojiButton.dataset.type = emojiType;
        emojiButton.draggable = true;
        emojiPanel.appendChild(emojiButton);
    });

    emojiPanel.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', event.target.dataset.type);
    });

    playArea.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    playArea.addEventListener('drop', (event) => {
        event.preventDefault();
        const emojiType = event.dataTransfer.getData('text/plain');
        addEmojiToPlayArea(emojiType, event.clientX, event.clientY);
    });
});

function addEmojiToPlayArea(emojiType, x, y) {
    const playArea = document.getElementById('play-area');
    const emojiElement = document.createElement('div');
    emojiElement.textContent = EMOJIS[emojiType];
    emojiElement.classList.add('emoji');
    emojiElement.style.position = 'absolute';
    emojiElement.style.left = `${x}px`;
    emojiElement.style.top = `${y}px`;
    playArea.appendChild(emojiElement);

    handleGameLogic(emojiType, x, y); // Call to central game logic script
}

function updateEmojiPanel(newEmojiType) {
    const emojiPanel = document.getElementById('emoji-panel');
    const newEmojiButton = document.createElement('button');
    newEmojiButton.textContent = EMOJIS[newEmojiType];
    newEmojiButton.classList.add('emoji');
    newEmojiButton.dataset.type = newEmojiType;
    newEmojiButton.draggable = true;
    emojiPanel.appendChild(newEmojiButton);
}
