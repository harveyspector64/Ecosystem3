function addBird(x, y) {
    const bird = document.createElement('div');
    bird.textContent = EMOJIS.bird;
    bird.classList.add('emoji', 'bird');
    bird.style.position = 'absolute';
    bird.style.left = `${x}px`;
    bird.style.top = `${y}px`;
    document.getElementById('play-area').appendChild(bird);

    moveBird(bird);
}

function moveBird(bird) {
    setInterval(() => {
        const playArea = document.getElementById('play-area');
        const targetX = Math.random() * playArea.clientWidth;
        const targetY = Math.random() * playArea.clientHeight;

        bird.style.left = `${targetX}px`;
        bird.style.top = `${targetY}px`;
    }, 2000);
}

function unlockWorm() {
    const emojiPanel = document.getElementById('emoji-panel');
    const wormButton = document.createElement('button');
    wormButton.textContent = EMOJIS.worm;
    wormButton.classList.add('emoji');
    wormButton.dataset.type = 'worm';
    wormButton.draggable = true;
    emojiPanel.appendChild(wormButton);
}
