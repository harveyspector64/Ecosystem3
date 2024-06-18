const playArea = document.getElementById('play-area');
let firstBirdLanded = false;

function addBird(x, y, playArea) {
    const delay = Math.random() * 8000 + 4000; // 4-12 seconds delay
    console.log(`Spawning bird after delay: ${delay}`);
    
    setTimeout(() => {
        const birdElement = document.createElement('div');
        birdElement.textContent = EMOJIS.BIRD;
        birdElement.classList.add('emoji', 'bird');
        birdElement.style.position = 'absolute';
        birdElement.style.left = `${Math.random() * playArea.clientWidth}px`;
        birdElement.style.top = `${Math.random() * playArea.clientHeight}px`;
        playArea.appendChild(birdElement);

        birdElement.hunger = 100; // Initialize hunger
        console.log(`Bird spawned with hunger: ${birdElement.hunger} at position ${birdElement.style.left} ${birdElement.style.top}`);

        birdFlightPattern(birdElement, x, y, false, playArea);
    }, delay);
}

function birdFlightPattern(bird, targetX, targetY, isHunting, playArea) {
    console.log('Entering birdFlightPattern for bird at:', bird.style.left, bird.style.top);

    bird.state = 'flying';
    const flightTime = Math.random() * 10000 + 5000; // 5-15 seconds
    let lastDebugTime = Date.now(); // Timestamp for throttling debug messages

    const flightInterval = setInterval(() => {
        if (bird.state === 'flying') {
            if (Date.now() - lastDebugTime > 3000) { // Log every 3 seconds
                console.log('Bird is flying at:', bird.style.left, bird.style.top);
                lastDebugTime = Date.now();
            }

            const currentX = parseFloat(bird.style.left);
            const currentY = parseFloat(bird.style.top);

            // Soaring circular pattern
            const angle = (Date.now() / 1000) % (2 * Math.PI); // Create a circular motion
            const radius = 50; // Radius of the circular path
            const newX = currentX + radius * Math.cos(angle);
            const newY = currentY + radius * Math.sin(angle);

            bird.style.left = `${Math.max(0, Math.min(newX, playArea.clientWidth - 20))}px`;
            bird.style.top = `${Math.max(0, Math.min(newY, playArea.clientHeight - 20))}px`;

            bird.hunger -= 0.5; // Decrease hunger slower

            // Check for butterfly collisions
            const butterflies = document.querySelectorAll('.butterfly');
            butterflies.forEach(butterfly => {
                const butterflyRect = butterfly.getBoundingClientRect();
                const birdRect = bird.getBoundingClientRect();
                if (birdRect.left < butterflyRect.right &&
                    birdRect.right > butterflyRect.left &&
                    birdRect.top < butterflyRect.bottom &&
                    birdRect.bottom > butterflyRect.top) {
                    // Butterfly eaten
                    butterfly.remove();
                    bird.hunger = Math.min(bird.hunger + 2, 100); // Increase hunger by a small amount
                    console.log('Bird ate a butterfly. Hunger:', bird.hunger);
                }
            });

            if (bird.hunger <= 60 && !isHunting) {
                clearInterval(flightInterval);
                console.log('Bird hunger below 60, continuing to fly but in hunting mode.');
                birdFlightPattern(bird, targetX, targetY, true, playArea);
            }
        }
    }, 500);

    // Set timeout for changing state after flight time
    setTimeout(() => {
        if (bird.state === 'flying') {
            clearInterval(flightInterval);
            console.log('Bird completing flight time, preparing to land.');
            birdLandingDecision(bird, targetX, targetY, isHunting, playArea);
        }
    }, flightTime);
}

function birdLandingDecision(bird, targetX, targetY, isHunting, playArea) {
    console.log('Bird deciding where to land. Hunger:', bird.hunger);

    if (bird.hunger <= 60) {
        console.log('Bird hunger below 60, landing on the ground.');
        birdLandOnGround(bird, playArea);
    } else {
        console.log('Bird hunger above 60, flying to a tree to land.');
        birdFlyToTree(bird, targetX, targetY, playArea);
    }
}

function birdFlyToTree(bird, targetX, targetY, playArea) {
    console.log('Bird flying to tree.');

    bird.state = 'flying';
    const tree = getNearestTree(targetX, targetY);
    if (tree) {
        const treeX = parseFloat(tree.style.left);
        const treeY = parseFloat(tree.style.top);

        // Fly to the tree location
        const flyInterval = setInterval(() => {
            const currentX = parseFloat(bird.style.left);
            const currentY = parseFloat(bird.style.top);
            const dx = treeX - currentX;
            const dy = treeY - currentY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 10) {
                clearInterval(flyInterval);
                birdLandOnTree(bird, treeX, treeY, playArea);
            } else {
                const angle = Math.atan2(dy, dx);
                const speed = 5; // Speed of flying towards the tree
                const newX = currentX + speed * Math.cos(angle);
                const newY = currentY + speed * Math.sin(angle);
                bird.style.left = `${newX}px`;
                bird.style.top = `${newY}px`;
            }
        }, 100);
    }
}

function birdLandOnGround(bird, playArea) {
    console.log('Bird landing on the ground.');

    bird.state = 'landing';
    setTimeout(() => {
        bird.state = 'walking';
        bird.walkCount = 0; // Reset walk count
        birdWalkingPattern(bird, playArea);

        if (!firstBirdLanded) {
            firstBirdLanded = true;
            addWormToPanel(); // Add worm emoji to panel
        }
    }, 500); // Short delay to simulate smooth landing
}

function birdLandOnTree(bird, treeX, treeY, playArea) {
    console.log('Bird landing on a tree.');

    bird.state = 'landing';
    setTimeout(() => {
        bird.style.left = `${treeX + Math.random() * 60 - 30}px`;
        bird.style.top = `${treeY + Math.random() * 80 - 40}px`;

        console.log('Bird landed on tree at', bird.style.left, bird.style.top);

        const roostTime = Math.random() * 20000 + 10000; // 10-30 seconds
        setTimeout(() => {
            console.log('Bird has roosted. Resuming flight.');
            birdFlightPattern(bird, treeX, treeY, false, playArea);
        }, roostTime);
    }, 500); // Short delay to simulate smooth landing
}

function birdWalkingPattern(bird, playArea) {
    console.log('Bird walking on the ground.');

    let walkCount = 0; // Counter for walks
    const maxWalks = 2 + Math.floor(Math.random() * 2); // 2-3 walks

    const walkInterval = setInterval(() => {
        if (bird.state === 'walking') {
            walkCount++;
            const currentX = parseFloat(bird.style.left);
            const currentY = parseFloat(bird.style.top);

            const distance = Math.random() * 10 + 5; // Walk distance, slower speed
            const angle = Math.random() * Math.PI * 2; // Random angle

            const newX = currentX + distance * Math.cos(angle);
            const newY = currentY + distance * Math.sin(angle);

            bird.style.left = `${Math.max(0, Math.min(newX, playArea.clientWidth - 20))}px`; // Confining to map
            bird.style.top = `${Math.max(0, Math.min(newY, playArea.clientHeight - 20))}px`; // Confining to map

            // Simulate looking both ways with pauses and emoji flip
            bird.style.transform = Math.random() > 0.5 ? 'scaleX(-1)' : 'scaleX(1)';

            console.log('Bird walked to', bird.style.left, bird.style.top);

            // Check for nearby worms
            const worms = document.querySelectorAll('.worm');
            worms.forEach(worm => {
                const wormRect = worm.getBoundingClientRect();
                const birdRect = bird.getBoundingClientRect();
                const distance = Math.sqrt((birdRect.left - wormRect.left) ** 2 + (birdRect.top - wormRect.top) ** 2);
                if (distance < 50) { // If within 50 pixels
                    clearInterval(walkInterval);
                    bird.style.left = `${wormRect.left}px`;
                    bird.style.top = `${wormRect.top}px`;
                    worm.remove();
                    bird.hunger = Math.min(bird.hunger + 40, 100); // Increase hunger
                    console.log('Bird ate a worm. Hunger:', bird.hunger);
                    birdFlightPattern(bird, currentX, currentY, true, playArea);
                }
            });

            if (walkCount >= maxWalks) {
                clearInterval(walkInterval);
                bird.state = 'flying';
                console.log('Bird finished walking. Resuming flight.');
                birdFlightPattern(bird, currentX, currentY, true, playArea);
            }
        }
    }, 1000); // Interval for walking pattern, slower speed
}

function getNearestTree(targetX, targetY) {
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

    return nearestTree;
}

function addWormToPanel() {
    const wormElement = document.createElement('div');
    wormElement.id = 'worm';
    wormElement.classList.add('emoji');
    wormElement.textContent = EMOJIS.WORM;
    wormElement.setAttribute('draggable', 'true');
    wormElement.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', EMOJIS.WORM);
    });

    const sidebar = document.getElementById('sidebar');
    sidebar.appendChild(wormElement);
}
