
function addBird(x, y) {
    const playArea = document.getElementById('play-area');
    const birdElement = document.createElement('div');
    birdElement.textContent = '🐦';
    birdElement.classList.add('emoji', 'bird');
    birdElement.style.position = 'absolute';
    birdElement.style.left = getRandomEdgePosition('x') + 'px';
    birdElement.style.top = getRandomEdgePosition('y') + 'px';
    playArea.appendChild(birdElement);

    birdElement.hunger = 100; // Initialize hunger bar
    moveBird(birdElement, x, y);
}

function moveBird(bird, targetX, targetY) {
    const interval = setInterval(() => {
        const currentX = parseFloat(bird.style.left);
        const currentY = parseFloat(bird.style.top);

        const angle = Math.random() * Math.PI * 2; // Random angle
        const distance = Math.random() * 20 + 30; // Smaller distance for smoother movement

        const newX = currentX + distance * Math.cos(angle);
        const newY = currentY + distance * Math.sin(angle);

        bird.style.left = `${newX}px`;
        bird.style.top = `${newY}px`;

        bird.hunger -= 1; // Decrease hunger over time

        if (bird.hunger <= 60) {
            clearInterval(interval);
            birdLand(bird, targetX, targetY);
        }
    }, 300); // Slower interval for smoother, less jerky movement
}

function birdLand(bird, targetX, targetY) {
    bird.style.left = `${targetX}px`;
    bird.style.top = `${targetY}px`;
    bird.hunger = 100; // Reset hunger

    setTimeout(() => {
        moveBird(bird, targetX, targetY);
    }, getRandomTime(5, 10) * 1000);
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
