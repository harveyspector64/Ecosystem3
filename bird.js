document.addEventListener('DOMContentLoaded', () => {
    const playArea = document.getElementById('play-area');

    function addBird(x, y) {
        console.log('Tree placed at:', x, y);

        const spawnTime = Math.random() * 8000 + 4000; // 4-12 seconds
        setTimeout(() => {
            console.log('Spawning bird after delay:', spawnTime);

            const birdElement = document.createElement('div');
            birdElement.textContent = EMOJIS.BIRD;
            birdElement.classList.add('emoji', 'bird');
            birdElement.style.position = 'absolute';
            birdElement.style.left = getRandomEdgePosition('x') + 'px';
            birdElement.style.top = getRandomEdgePosition('y') + 'px';
            playArea.appendChild(birdElement);

            birdElement.hunger = 100;
            birdElement.state = 'flying';

            console.log('Bird spawned with hunger:', birdElement.hunger, 'at position', birdElement.style.left, birdElement.style.top);

            birdFlightPattern(birdElement, x, y);
        }, spawnTime);
    }

    function birdFlightPattern(bird, targetX, targetY) {
        console.log('Bird entering flight state.');

        bird.state = 'flying';
        const flightTime = Math.random() * 10000 + 5000; // 5-15 seconds

        const flightInterval = setInterval(() => {
            if (bird.state === 'flying') {
                console.log('Bird is flying.');

                const currentX = parseFloat(bird.style.left);
                const currentY = parseFloat(bird.style.top);

                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 50 + 30; // Adjusted distance for smoother movement

                const newX = currentX + distance * Math.cos(angle);
                const newY = currentY + distance * Math.sin(angle);

                // Keep the bird within the play area boundaries
                const playAreaWidth = playArea.clientWidth;
                const playAreaHeight = playArea.clientHeight;
                const birdSize = 20; // Adjust based on the bird emoji size

                const clampedX = Math.min(Math.max(newX, birdSize), playAreaWidth - birdSize);
                const clampedY = Math.min(Math.max(newY, birdSize), playAreaHeight - birdSize);

                bird.style.left = `${clampedX}px`;
                bird.style.top = `${clampedY}px`;

                bird.hunger -= 1;

                console.log('Bird moved to', bird.style.left, bird.style.top, 'with hunger', bird.hunger);

                if (bird.hunger <= 60) {
                    clearInterval(flightInterval);
                    console.log('Bird hunger below 60, preparing to land.');
                    birdLandingDecision(bird, targetX, targetY);
                }
            }
        }, 300);

        setTimeout(() => {
            if (bird.state === 'flying') {
                clearInterval(flightInterval);
                console.log('Bird completing flight time, preparing to land.');
                birdLandingDecision(bird, targetX, targetY);
            }
        }, flightTime);
    }

    function birdLandingDecision(bird, targetX, targetY) {
        console.log('Bird deciding where to land. Hunger:', bird.hunger);

        if (bird.hunger <= 60) {
            console.log('Bird hunger below 60, landing on the ground.');
            birdLandOnGround(bird);
        } else {
            console.log('Bird hunger above 60, landing on a tree.');
            birdLandOnTree(bird, targetX, targetY);
        }
    }

    function birdLandOnGround(bird) {
        console.log('Bird landing on the ground.');

        bird.state = 'walking';
        bird.style.left = `${Math.random() * playArea.clientWidth}px`;
        bird.style.top = `${Math.random() * playArea.clientHeight}px`;

        birdWalkingPattern(bird);
    }

    function birdLandOnTree(bird, targetX, targetY) {
        console.log('Bird landing on a tree.');

        const trees = document.querySelectorAll('.tree');
        let nearestTree = null;
        let minDistance = Infinity;

        trees.forEach(tree => {
            const treeX = parseFloat(tree.style.left);
            const treeY = parseFloat(tree.style.top);
            const distance = Math.sqrt((treeX - targetX) ** 2 + (treeY - targetY) ** 2);

            if (distance < minDistance) {
                minDistance = distance;
                nearestTree = tree;
            }
        });

        if (nearestTree) {
            const treeX = parseFloat(nearestTree.style.left);
            const treeY = parseFloat(nearestTree.style.top);
            bird.style.left = `${treeX + Math.random() * 60 - 30}px`;
            bird.style.top = `${treeY + Math.random() * 80 - 40}px`;

            console.log('Bird landed on tree at', bird.style.left, bird.style.top);

            const roostTime = Math.random() * 3000 + 3000; // 3-6 seconds
            setTimeout(() => {
                bird.hunger = 100;
                console.log('Bird has roosted and reset hunger. Resuming flight.');
                birdFlightPattern(bird, targetX, targetY);
            }, roostTime);
        }
    }

    function birdWalkingPattern(bird) {
        console.log('Bird walking on the ground.');

        const walkInterval = setInterval(() => {
            if (bird.state === 'walking') {
                const currentX = parseFloat(bird.style.left);
                const currentY = parseFloat(bird.style.top);

                const distance = Math.random() * 20 + 10;
                const angle = Math.random() * Math.PI * 2;

                const newX = currentX + distance * Math.cos(angle);
                const newY = currentY + distance * Math.sin(angle);

                bird.style.left = `${newX}px`;
                bird.style.top = `${newY}px`;

                console.log('Bird walked to', bird.style.left, bird.style.top);

                // Check for worms nearby
                const worms = document.querySelectorAll('.worm');
                const birdRect = bird.getBoundingClientRect();

                worms.forEach(worm => {
                    const wormRect = worm.getBoundingClientRect();
                    if (isColliding(birdRect, wormRect)) {
                        console.log('Bird found a worm and is eating it.');
                        worm.remove();
                        bird.hunger += 20; // Increase hunger meter
                    }
                });

                const walkTime = Math.random() * 1000 + 500; // 0.5-1.5 seconds
                setTimeout(() => {
                    if (bird.hunger <= 60) {
                        bird.state = 'walking';
                        clearInterval(walkInterval);
                        birdWalkingPattern(bird);
                    } else {
                        bird.state = 'flying';
                        console.log('Bird hunger above 60, resuming flight.');
                        birdFlightPattern(bird, newX, newY);
                    }
                }, walkTime);
            }
        }, 300);
    }

    function isColliding(rect1, rect2) {
        return (
            rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top
        );
    }

    function getRandomEdgePosition(axis) {
        const playArea = document.getElementById('play-area');
        if (axis === 'x') {
            return Math.random() > 0.5 ? 0 : playArea.clientWidth - 20;
        } else {
            return Math.random() > 0.5 ? 0 : playArea.clientHeight - 20;
        }
    }

    document.getElementById('tree').addEventListener('dragend', (e) => {
        const x = e.clientX - playArea.offsetLeft;
        const y = e.clientY - playArea.offsetTop;
        addBird(x, y);
    });
});
