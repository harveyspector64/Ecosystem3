function addWorm(x, y) {
    const playArea = document.getElementById('play-area');
    const wormElement = document.createElement('div');
    wormElement.textContent = EMOJIS.WORM;
    wormElement.classList.add('emoji', 'worm');
    wormElement.style.position = 'absolute';
    wormElement.style.left = `${x}px`;
    wormElement.style.top = `${y}px`;
    playArea.appendChild(wormElement);

    // Start worm wiggling
    startWormWiggle(wormElement);
}

function startWormWiggle(worm) {
    const wiggle = () => {
        const wiggleAmount = Math.random() * 5; // Wiggle by up to 5px
        const wiggleDirection = Math.random() > 0.5 ? 1 : -1; // Random direction

        worm.style.transform = `translateX(${wiggleDirection * wiggleAmount}px)`;

        // Randomize next wiggle time between 2 and 5 seconds
        const wiggleTime = Math.random() * 3000 + 2000;

        setTimeout(() => {
            // Reset transformation after wiggle
            worm.style.transform = '';
            setTimeout(wiggle, wiggleTime);
        }, 500); // Wiggle duration
    };

    // Initial delay before the first wiggle
    setTimeout(wiggle, Math.random() * 3000 + 2000);
}
