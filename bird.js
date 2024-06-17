document.addEventListener('DOMContentLoaded', () => {
    const playArea = document.getElementById('play-area');
    let birdSpawned = false; // Flag to ensure only one bird spawns per tree

    window.addBird = function(x, y) {
        if (birdSpawned) return; // Ensure only one bird spawns per tree
        birdSpawned = true;

        console.log('Tree placed at:', x, y);

        // Set a random time for the bird to appear after the tree is placed
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

            birdElement.hunger = 100; // Initialize hunger bar
            birdElement.state = 'flying'; // Initial state

            console.log('Bird spawned with hunger:', birdElement.hunger, 'at position', birdElement.style.left, birdElement.style.top);

            birdFlightPattern(birdElement, x, y);
        }, spawnTime);
    };

    function birdFlightPattern(bird, targetX, targetY) {
        console.log('Entering birdFlightPattern for bird at:', bird.style.left, bird.style.top);

        bird.state = 'flying';
        const flightTime = Math.random() * 10000 + 5000; // 5-15 seconds
        let lastDebugTime = Date.now(); // Timestamp for throttling debug messages

        const flightInterval = setInterval(() => {
            if (bird.state === 'flying') {
                // Throttle debug messages for flying state
                if (Date.now() - lastDebugTime > 1000) { // Log once per second
                    console.log('Bird is flying at:', bird.style.left, bird.style.top);
                    lastDebugTime = Date.now();
                }

                const currentX = parseFloat(bird.style.left);
                const currentY = parseFloat(bird.style.top);

                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 50 + 30; // Adjust distance for smoother flight
                const newX = currentX + distance * Math.cos(angle);
                const newY = currentY + distance * Math.sin(angle);

                bird.style.left = `${newX}px`;
                bird.style.top = `${newY}px`;

                bird.hunger -= 1; // Decrease hunger over time

                if (Date.now() - lastDebugTime > 1000) { // Log once per second
                    console.log('Bird moved to', bird.style.left, bird.style.top, 'with hunger', bird.hunger);
                    lastDebugTime = Date.now();
                }

                if (bird.hunger <= 60) {
                    clearInterval(flightInterval);
                    console.log('Bird hunger below 60, preparing to land.');
                    birdLandingDecision(bird, targetX, targetY);
                }
            }
        }, 500); // Increase interval for smoother, less frantic flight

        // Set timeout for changing state after flight time
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
                bird.hunger = 100; // Reset hunger after roosting
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

                const distance = Math.random() * 20 + 10; // Walk distance
                const angle = Math.random() * Math.PI * 2; // Random angle

                const newX = currentX + distance * Math.cos(angle);
                const newY = currentY + distance * Math.sin(angle);

                bird.style.left = `${newX}px`;
                bird.style.top = `${newY}px`;

                console.log('Bird walked to', bird.style.left, bird.style.top);

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
});
