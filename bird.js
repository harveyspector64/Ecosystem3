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
        // Spawn off-screen
        birdElement.style.left = `${Math.random() > 0.5 ? -50 : playArea.clientWidth + 50}px`;
        birdElement.style.top = `${Math.random() > 0.5 ? -50 : playArea.clientHeight + 50}px`;
        playArea.appendChild(birdElement);

        birdElement.hunger = 100; // Initialize hunger
        console.log(`Bird spawned with hunger: ${birdElement.hunger} at position ${birdElement.style.left} ${birdElement.style.top}`);

        birdFlyIntoView(birdElement, playArea);
    }, delay);
}

function birdFlyIntoView(bird, playArea) {
    // Fly the bird into the play area
    const targetX = Math.random() * playArea.clientWidth;
    const targetY = Math.random() * playArea.clientHeight;
    birdFlyToPosition(bird, targetX, targetY, () => {
        birdFlightPattern(bird, playArea);
    });
}

function birdFlyToPosition(bird, targetX, targetY, callback) {
    // Fly to the target position
    const flyInterval = setInterval(() => {
        const currentX = parseFloat(bird.style.left);
        const currentY = parseFloat(bird.style.top);
        const dx = targetX - currentX;
        const dy = targetY - currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
            clearInterval(flyInterval);
            bird.style.left = `${targetX}px`;
            bird.style.top = `${targetY}px`;
            callback();
        } else {
            const angle = Math.atan2(dy, dx);
            const speed = 5; // Speed of flying to position
            const newX = currentX + speed * Math.cos(angle);
            const newY = currentY + speed * Math.sin(angle);
            bird.style.left = `${newX}px`;
            bird.style.top = `${newY}px`;
        }
    }, 50); // Adjust speed for smooth movement
}

function birdFlightPattern(bird, playArea) {
    console.log('Entering birdFlightPattern for bird at:', bird.style.left, bird.style.top);

    bird.state = 'flying';
    const flightTime = Math.random() * 10000 + 5000; // 5-15 seconds

    const flyInterval = setInterval(() => {
        if (bird.state === 'flying') {
            const currentX = parseFloat(bird.style.left);
            const currentY = parseFloat(bird.style.top);

            // Smooth spiraling flight pattern
            const angle = (Date.now() / 2000) % (2 * Math.PI); // Create a slower circular motion
            const radius = 80; // Larger radius for smoother flight
            const newX = currentX + radius * Math.cos(angle);
            const newY = currentY + radius * Math.sin(angle);

            bird.style.left = `${Math.max(0, Math.min(newX, playArea.clientWidth - 20))}px`;
            bird.style.top = `${Math.max(0, Math.min(newY, playArea.clientHeight - 20))}px`;

            bird.hunger -= 0.5; // Decrease hunger appropriately

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

            if (bird.hunger <= 60) {
                clearInterval(flyInterval);
                console.log('Bird hunger below 60, preparing to land.');
                birdLandingDecision(bird, playArea);
            }
        }
    }, 50); // Ensure continuous movement with smooth flight

    // Set timeout for changing state after flight time
    setTimeout(() => {
        if (bird.state === 'flying') {
            clearInterval(flyInterval);
            console.log('Bird completing flight time, preparing to land.');
            birdLandingDecision(bird, playArea);
        }
    }, flightTime);
}

function birdLandingDecision(bird, playArea) {
    console.log('Bird deciding where to land. Hunger:', bird.hunger);

    if (bird.hunger <= 60) {
        console.log('Bird hunger below 60, landing on the ground.');
        birdLandOnGround(bird, playArea);
    } else {
        console.log('Bird hunger above 60, flying to a tree to land.');
        birdFlyToTree(bird, playArea);
    }
}

function birdFlyToTree(bird, playArea) {
    console.log('Bird flying to tree.');

    bird.state = 'flying';
    const tree = getNearestTree(playArea);
    if (tree) {
        const treeX = parseFloat(tree.style.left);
        const treeY = parseFloat(tree.style.top);

        // Fly to the tree location
        birdFlyToPosition(bird, treeX, treeY, () => {
            birdLandOnTree(bird, treeX, treeY, playArea);
        });
    }
}

function birdLandOnGround(bird, playArea) {
    console.log('Bird landing on the ground.');

    bird.state = 'landing';
    bird.style.transition = 'top 0.5s, left 0.5s';
    bird.style.top = `${parseFloat(bird.style.top) + 20}px`; // Descend a bit to simulate landing
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
            birdFlightPattern(bird, playArea);
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
                        worms.forEach(worm => {
                            const wormRect = worm.getBoundingClientRect();
                            const birdRect = bird.getBoundingClientRect();
                            const distance = Math.sqrt((birdRect.left - wormRect.left) ** 2 + (birdRect.top - wormRect.top) ** 2);
                            if (distance < 50) { // If within 50 pixels
                                clearInterval(stepInterval);
                                clearInterval(walkInterval);
                                bird.style.left = `${wormRect.left}px`;
                                bird.style.top = `${wormRect.top}px`;
                                worm.remove();
                                bird.hunger = Math.min(bird.hunger + 40, 100); // Increase hunger
                                console.log('Bird ate a worm. Hunger:', bird.hunger);
                                birdFlightPattern(bird, currentX, currentY, true, playArea);
                            }
                        });
                    } else {
                        clearInterval(stepInterval);
                        if (bird.state === 'walking') {
                            const pauseDuration = Math.random() * 2000 + 1000; // Random pause between 1-3 seconds
                            bird.style.transform = Math.random() > 0.5 ? 'scaleX(-1)' : 'scaleX(1)'; // Simulate looking both ways
                            console.log(`Bird pausing for ${pauseDuration}ms`);
                            setTimeout(() => {
                                if (walkCount < maxWalks && bird.state === 'walking') {
                                    performSteps();
                                } else {
                                    clearInterval(walkInterval);
                                    bird.state = 'flying';
                                    console.log('Bird finished walking. Resuming flight.');
                                    birdFlightPattern(bird, currentX, currentY, true, playArea);
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

function getNearestTree(playArea) {
    const trees = document.querySelectorAll('.tree');
    let nearestTree = null;
    let minDistance = Infinity;

    trees.forEach(tree => {
        const treeX = parseFloat(tree.style.left);
        const treeY = parseFloat(tree.style.top);
        const distance = Math.sqrt((treeX - playArea.clientWidth / 2) ** 2 + (treeY - playArea.clientHeight / 2) ** 2);

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
