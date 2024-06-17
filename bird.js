document.addEventListener('DOMContentLoaded', () => {
    const playArea = document.getElementById('play-area');

    function addBird(x, y) {
        const birdElement = document.createElement('div');
        birdElement.textContent = EMOJIS.BIRD;
        birdElement.classList.add('emoji', 'bird');
        birdElement.style.position = 'absolute';
        birdElement.style.left = getRandomEdgePosition('x') + 'px';
        birdElement.style.top = getRandomEdgePosition('y') + 'px';
        playArea.appendChild(birdElement);

        birdElement.hunger = 100; // Initialize hunger bar
        birdElement.state = 'flying'; // Initial state

        moveBird(birdElement, x, y);
    }

    function moveBird(bird, targetX, targetY) {
        const interval = setInterval(() => {
            if (bird.state === 'flying') {
                const currentX = parseFloat(bird.style.left);
                const currentY = parseFloat(bird.style.top);

                const angle = Math.random() * Math.PI * 2; // Random angle
                const distance = Math.random() * 50 + 50; // Random distance

                const newX = currentX + distance * Math.cos(angle);
                const newY = currentY + distance * Math.sin(angle);

                bird.style.left = `${newX}px`;
                bird.style.top = `${newY}px`;

                bird.hunger -= 1; // Decrease hunger over time

                const flightTime = Math.random() * 3000 + 5000; // 5-8 seconds
                setTimeout(() => {
                    if (bird.hunger <= 60) {
                        clearInterval(interval);
                        bird.state = 'landing';
                        landBird(bird, targetX, targetY);
                    } else {
                        bird.state = 'flying';
                    }
                }, flightTime);
            }
        }, 300); // Slower interval for smoother, less jerky movement
    }

    function landBird(bird, targetX, targetY) {
        if (bird.hunger <= 60) {
            // Land on the tree
            const tree = document.querySelector('.tree');
            if (tree) {
                const treeX = parseFloat(tree.style.left);
                const treeY = parseFloat(tree.style.top);
                bird.style.left = `${treeX + Math.random() * 60 - 30}px`;
                bird.style.top = `${treeY + Math.random() * 80 - 40}px`;

                const roostTime = Math.random() * 3000 + 3000; // 3-6 seconds
                setTimeout(() => {
                    bird.hunger = 100; // Reset hunger after roosting
                    bird.state = 'flying';
                    moveBird(bird, targetX, targetY);
                }, roostTime);
            }
        } else {
            // Land on the ground
            bird.style.left = `${targetX}px`;
            bird.style.top = `${targetY}px`;

            birdWalkingPattern(bird);
        }
    }

    function birdWalkingPattern(bird) {
        const interval = setInterval(() => {
            if (bird.state === 'walking') {
                const currentX = parseFloat(bird.style.left);
                const currentY = parseFloat(bird.style.top);

                const distance = Math.random() * 20 + 10; // Walk distance
                const angle = Math.random() * Math.PI * 2; // Random angle

                const newX = currentX + distance * Math.cos(angle);
                const newY = currentY + distance * Math.sin(angle);

                bird.style.left = `${newX}px`;
                bird.style.top = `${newY}px`;

                const walkTime = Math.random() * 1000 + 500; // 0.5-1.5 seconds
                setTimeout(() => {
                    if (bird.hunger <= 60) {
                        bird.state = 'walking';
                        clearInterval(interval);
                        birdWalkingPattern(bird);
                    } else {
                        bird.state = 'flying';
                        moveBird(bird, newX, newY);
                    }
                }, walkTime);
            }
        }, 300); // Interval for walking pattern
    }

    function getRandomEdgePosition(axis) {
        const playArea = document.getElementById('play-area');
        if (axis === 'x') {
            return Math.random() > 0.5 ? 0 : playArea.clientWidth - 20; // Adjust 20 for margin
        } else {
            return Math.random() > 0.5 ? 0 : playArea.clientHeight - 20;
        }
    }

    // Initial setup for adding bird on tree
    document.getElementById('tree').addEventListener('dragend', (e) => {
        const x = e.clientX - playArea.offsetLeft;
        const y = e.clientY - playArea.offsetTop;
        addBird(x, y);
    });
});
