function addButterflies(x, y) {
    setInterval(() => {
        const butterfly = document.createElement('div');
        butterfly.textContent = EMOJIS.butterfly;
        butterfly.classList.add('emoji', 'butterfly');
        butterfly.style.position = 'absolute';
        butterfly.style.left = `${x}px`;
        butterfly.style.top = `${y}px`;
        butterfly.style.opacity = 0.8; // Slight transparency
        butterfly.style.fontSize = '1.5em'; // Smaller size
        document.getElementById('play-area').appendChild(butterfly);

        moveButterfly(butterfly);
        butterflyFeeding(butterfly);
    }, 5000);
}

function moveButterfly(butterfly) {
    setInterval(() => {
        const playArea = document.getElementById('play-area');
        const targetX = Math.random() * playArea.clientWidth;
        const targetY = Math.random() * playArea.clientHeight;

        butterfly.style.left = `${targetX}px`;
        butterfly.style.top = `${targetY}px`;
    }, 2000);
}

function butterflyFeeding(butterfly) {
    setInterval(() => {
        const bushes = document.querySelectorAll('.bush');
        if (bushes.length > 0) {
            const bush = bushes[Math.floor(Math.random() * bushes.length)];
            butterfly.style.left = bush.style.left;
            butterfly.style.top = bush.style.top;

            // Simulate feeding
            setTimeout(() => {
                moveButterfly(butterfly);
            }, 2000); // Feed for 2 seconds
        }
    }, 10000); // Attempt to feed every 10 seconds
}
