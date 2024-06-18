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
        birdElement.style.zIndex = '1'; // Ensure bird is above other elements
        playArea.appendChild(birdElement);

        birdElement.hunger = 100; // Initialize hunger
        console.log(`Bird spawned with hunger: ${birdElement.hunger} at position ${birdElement.style.left} ${birdElement.style.top}`);

        birdFlightPattern(birdElement, playArea, false);
    }, delay);
}

function birdFlightPattern(bird, playArea, isErratic) {
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

            // Determine flight pattern
            const angle = Math.random() * Math.PI * 2; // Random angle
            const distance = isErratic ? (Math.random() * 40 + 60) : (Math.random() * 20 + 30); // Erratic vs normal distance
            const newX = currentX + distance * Math.cos(angle);
            const newY = currentY + distance * Math.sin(angle);

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
                    bird.hunger = Math.min(bird.hunger + 5, 100); // Increase hunger by a small amount
                    console.log('Bird ate a butterfly. Hunger:', bird.hunger);
                }
            });
        }
    }, 500);

    // Set timeout for changing state after flight time
    setTimeout(() => {
        if (bird.state === 'flying') {
            clearInterval(flightInterval);
            console.log('Bird completing flight time, preparing to land.');
            birdLandingDecision(bird, playArea);
        }
    }, flightTime);
}

function birdLandingDecision(bird, playArea) {
    console.log('Bird deciding where to land. Hunger:', bird.hunger);

    if (bird.hunger <= 60) {
        console.log('Bird hunger below 60, landing on the ground.');
        birdDescendToGround(bird, playArea);
    } else {
        console.log('Bird hunger above 60, flying to a tree to land.');
        birdFlyToTree(bird, playArea);
    }
}

function birdFlyToTree(bird, playArea) {
    console.log('Bird flying to tree.');

    bird.state = 'flying';
    const tree = getNearestTree(bird);
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

function birdDescendToGround(bird, playArea) {
    console.log('Bird descending to land on the ground.');

    bird.state = 'descending';
    bird.style.transition = 'top 1s, left 1s';
    bird.style.top = `${parseFloat(bird.style.top) + 50}px`; // Descend a bit to simulate landing
    setTimeout(() => {
        bird.state = 'walking';
        bird.walkCount = 0; // Reset walk count
        birdWalkingPattern(bird, playArea);

        if (!firstBirdLanded) {
            firstBirdLanded = true;
            // Call addWormToPanel() from script.js
            window.addWormToPanel();
        }
    }, 1000); // Longer delay to simulate smooth landing
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
            birdFlightPattern(bird, playArea, false);
        }, roostTime);
    }, 500); // Short delay to simulate smooth landing
}

function birdWalkingPattern(bird, playArea) {
    console.log('Bird walking on the ground.');

    let walkCount = 0; // Counter for walks
    const maxWalks = 2 + Math.floor(Math.random() * 5) + 2; // 2-6 walk/pause cycles

    const walkInterval = setInterval(() => {
        if (bird.state === 'walking') {
            walkCount++;
            const stepCount = 5 + Math.floor(Math.random() * 5); // 5-9 steps per pattern

            const performSteps = () => {
                let stepIndex = 0;
                const stepInterval = setInterval(() => {
                    if (stepIndex < stepCount && bird.state === 'walking') {
                        stepIndex++;
                        const currentX = parseFloat(bird.style.left);
                        const currentY = parseFloat(bird.style.top);

                        // Smaller, hop-like steps
                        const distance = Math.random() * 5 + 2; // Shorter distance for hop-like movement
                        const angle = Math.random() * Math.PI * 2; // Random angle

                        const newX = currentX + distance * Math.cos(angle);
                        const newY = currentY + distance * Math.sin(angle);

                        bird.style.left = `${Math.max(0, Math.min(newX, playArea.clientWidth - 20))}px`; // Confining to map
                        bird.style.top = `${Math.max(0, Math.min(newY, playArea.clientHeight - 20))}px`; // Confining to map

                        // Smooth transition for hops
                        bird.style.transition = 'top 0.3s, left 0.3s';

                        console.log('Bird walked to', bird.style.left, bird.style.top);

                        // Check for nearby worms
                        const worms = document.querySelectorAll('.worm');
                        let nearestWorm = null;
                        let minDistance = Infinity;

                        worms.forEach(worm => {
                            const wormRect = worm.getBoundingClientRect();
                            const birdRect = bird.getBoundingClientRect();
                            const distance = Math.sqrt((birdRect.left - wormRect.left) ** 2 + (birdRect.top - wormRect.top) ** 2);
                            if (distance < minDistance && distance < 100) { // If within 100 pixels and nearest
                                minDistance = distance;
                                nearestWorm = worm;
                            }
                        });

                        if (nearestWorm) {
                            clearInterval(stepInterval);
                            clearInterval(walkInterval);
                            console.log('Bird sees a worm and moves towards it.');
                            birdMoveToWorm(bird, nearestWorm, playArea);
                        }
                    } else {
                        clearInterval(stepInterval);
                        if (bird.state === 'walking') {
                            const pauseDuration = Math.random() * 5000 + 2000; // Random pause between 2-7 seconds
                            bird.style.transform = Math.random() > 0.5 ? 'scaleX(-1)' : 'scaleX(1)'; // Simulate looking both ways
                            console.log(`Bird pausing for ${pauseDuration}ms`);
                            setTimeout(() => {
                                if (walkCount < maxWalks && bird.state === 'walking') {
                                    performSteps();
                                } else {
                                    clearInterval(walkInterval);
                                    birdAscendAndFlight(bird, playArea);
                                }
                            }, pauseDuration);
                        }
                    }
                }, 500); // Step interval, slower speed
            };

            performSteps();
        }
    }, 1000); // Initial delay before starting the walking pattern
}

function birdMoveToWorm(bird, worm, playArea) {
    console.log('Bird moving to worm.');

    bird.state = 'movingToWorm';
    const wormRect = worm.getBoundingClientRect();
    const birdRect = bird.getBoundingClientRect();

    const dx = wormRect.left - birdRect.left;
    const dy = wormRect.top - birdRect.top;
    const angle = Math.atan2(dy, dx);

    const speed = 2; // Speed of moving towards the worm

    const moveInterval = setInterval(() => {
        const currentX = parseFloat(bird.style.left);
        const currentY = parseFloat(bird.style.top);

        const newX = currentX + speed * Math.cos(angle);
        const newY = currentY + speed * Math.sin(angle);

        bird.style.left = `${Math.max(0, Math.min(newX, playArea.clientWidth - 20))}px`;
        bird.style.top = `${Math.max(0, Math.min(newY, playArea.clientHeight - 20))}px`;

        const newBirdRect = bird.getBoundingClientRect();

        if (Math.abs(newBirdRect.left - wormRect.left) < 5 && Math.abs(newBirdRect.top - wormRect.top) < 5) {
            clearInterval(moveInterval);
            // Eat the worm
            worm.remove();
            bird.hunger = Math.min(bird.hunger + 20, 100); // Increase hunger
            console.log('Bird ate a worm. Hunger:', bird.hunger);
            birdAscendAndFlight(bird, playArea);
        }
    }, 100);
}

function birdAscendAndFlight(bird, playArea) {
    console.log('Bird ascending to flight.');

    bird.state = 'ascending';
    bird.style.transition = 'top 1s, left 1s';
    bird.style.top = `${parseFloat(bird.style.top) - 50}px`; // Ascend a bit to simulate takeoff
    setTimeout(() => {
        bird.state = 'flying';
        birdFlightPattern(bird, playArea, bird.hunger <= 60); // Check if the flight should be erratic
    }, 1000); // Longer delay to simulate smooth takeoff
}

function getNearestTree(bird) {
    const trees = document.querySelectorAll('.tree');
    let nearestTree = null;
    let minDistance = Infinity;

    trees.forEach(tree => {
        const treeX = parseFloat(tree.style.left);
        const treeY = parseFloat(tree.style.top);
        const distance = Math.sqrt((treeX - parseFloat(bird.style.left)) ** 2 + (treeY - parseFloat(bird.style.top)) ** 2);

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
    wormElement.style.zIndex = '0'; // Ensure worm is below other elements
    wormElement.addEventListener('dragstart', (e) => {
        const draggedElement = e.target;
        if (!draggedElement.classList.contains('emoji')) return;

        draggedEmoji = draggedElement.textContent;
        console.log(`Drag start: ${draggedEmoji}`);
    });

    const sidebar = document.getElementById('sidebar');
    sidebar.appendChild(wormElement);
}
