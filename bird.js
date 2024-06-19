const playArea = document.getElementById('play-area');
let firstBirdLanded = false;

const birdStates = {
    PERCHING: 'perching',
    FLYING: 'flying',
    WALKING: 'walking',
    MOVING_TO_WORM: 'movingToWorm',
    EATING: 'eating',
    DESCENDING: 'descending',
    LANDING: 'landing',
    ASCENDING: 'ascending'
};

function setState(bird, newState) {
    console.log(`Bird state transition: ${bird.currentState} -> ${newState}`);
    bird.currentState = newState;
}

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
        setState(birdElement, birdStates.FLYING);
        console.log(`Bird spawned with hunger: ${birdElement.hunger} at position ${birdElement.style.left} ${birdElement.style.top}`);

        birdFlightPattern(birdElement, playArea, false);
    }, delay);
}

function birdFlightPattern(bird, playArea, isErratic) {
    setState(bird, birdStates.FLYING);

    const flightTime = Math.random() * 10000 + 5000; // 5-15 seconds
    let lastDebugTime = Date.now();

    const flightInterval = setInterval(() => {
        if (bird.currentState !== birdStates.FLYING) {
            clearInterval(flightInterval);
            return;
        }

        if (Date.now() - lastDebugTime > 3000) {
            console.log(`Bird is flying at: ${bird.style.left} ${bird.style.top}`);
            lastDebugTime = Date.now();
        }

        const currentX = parseFloat(bird.style.left);
        const currentY = parseFloat(bird.style.top);

        const angle = Math.random() * Math.PI * 2;
        const distance = isErratic ? (Math.random() * 40 + 60) : (Math.random() * 20 + 30);
        const newX = currentX + distance * Math.cos(angle);
        const newY = currentY + distance * Math.sin(angle);

        bird.style.left = `${Math.max(0, Math.min(newX, playArea.clientWidth - 20))}px`;
        bird.style.top = `${Math.max(0, Math.min(newY, playArea.clientHeight - 20))}px`;

        bird.hunger -= isErratic ? 1 : 0.5;

        detectButterflies(bird, playArea);
        detectWorms(bird, playArea);

        if (newX <= 0 || newX >= playArea.clientWidth || newY <= 0 || newY >= playArea.clientHeight) {
            console.log(`Bird hit the boundary at: ${newX} ${newY}`);
            clearInterval(flightInterval);
            birdLandingDecision(bird, playArea);
        }
    }, 500);

    setTimeout(() => {
        if (bird.currentState === birdStates.FLYING) {
            clearInterval(flightInterval);
            console.log('Bird completing flight time, preparing to land.');
            birdLandingDecision(bird, playArea);
        }
    }, flightTime);
}

function birdLandNearWorm(bird, worm, playArea) {
    console.log('Bird landing near a worm.');
    setState(bird, birdStates.LANDING);

    const wormRect = worm.getBoundingClientRect();

    const landX = wormRect.left + (Math.random() * 20 - 10);
    const landY = wormRect.top + (Math.random() * 20 - 10);

    bird.style.left = `${Math.max(0, Math.min(landX, playArea.clientWidth - 20))}px`;
    bird.style.top = `${Math.max(0, Math.min(landY, playArea.clientHeight - 20))}px`;

    bird.style.transition = 'top 1s, left 1s';

    setTimeout(() => {
        setState(bird, birdStates.WALKING);
        bird.walkCount = 0; // Reset walk count
        birdWalkingPattern(bird, playArea);

        if (!firstBirdLanded) {
            firstBirdLanded = true;
            window.addWormToPanel();
        }
    }, 1000); // Longer delay to simulate smooth landing
}

function birdLandingDecision(bird, playArea) {
    console.log(`Bird deciding where to land. Hunger: ${bird.hunger}`);

    if (bird.hunger <= 30) {
        console.log('Bird hunger below 30, landing on the ground to hunt.');
        birdDescendToGround(bird, playArea);
    } else if (bird.hunger <= 60) {
        console.log('Bird hunger between 30 and 60, actively searching for food.');
        birdFlightPattern(bird, playArea, true);
    } else {
        // Adding randomness to decision making
        if (Math.random() < 0.7) {
            console.log('Bird hunger above 70, flying to a tree to perch.');
            birdFlyToTree(bird, playArea);
        } else {
            console.log('Bird hunger above 70, continuing to fly.');
            birdFlightPattern(bird, playArea, false);
        }
    }
}

function birdFlyToTree(bird, playArea) {
    console.log('Bird flying to tree.');

    setState(bird, birdStates.FLYING);

    const tree = getNearestTree(bird);
    if (tree) {
        const treeX = parseFloat(tree.style.left);
        const treeY = parseFloat(tree.style.top);

        console.log(`Tree found at: ${treeX}, ${treeY}`);

        const flyInterval = setInterval(() => {
            if (bird.currentState !== birdStates.FLYING) {
                clearInterval(flyInterval);
                return;
            }

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
                const speed = 5;
                const newX = currentX + speed * Math.cos(angle);
                const newY = currentY + speed * Math.sin(angle);
                bird.style.left = `${newX}px`;
                bird.style.top = `${newY}px`;
            }
        }, 100);
    } else {
        console.log('No tree found, continuing flight.');
        birdAscendAndFlight(bird, playArea);
    }
}

function birdDescendToGround(bird, playArea) {
    console.log('Bird descending to land on the ground.');

    setState(bird, birdStates.DESCENDING);

    bird.style.transition = 'top 1s, left 1s';
    bird.style.top = `${parseFloat(bird.style.top) + 50}px`;
    setTimeout(() => {
        setState(bird, birdStates.WALKING);
        bird.walkCount = 0; // Reset walk count
        birdWalkingPattern(bird, playArea);

        if (!firstBirdLanded) {
            firstBirdLanded = true;
            window.addWormToPanel();
        }
    }, 1000); // Longer delay to simulate smooth landing
}

function birdLandOnTree(bird, treeX, treeY, playArea) {
    console.log(`Bird landing on a tree at: ${treeX}, ${treeY}`);

    setState(bird, birdStates.LANDING);

    setTimeout(() => {
        bird.style.left = `${treeX + Math.random() * 60 - 30}px`;
        bird.style.top = `${treeY + Math.random() * 80 - 40}px`;

        console.log(`Bird landed on tree at ${bird.style.left} ${bird.style.top}`);

        const roostTime = Math.random() * 20000 + 10000; // 10-30 seconds
        setTimeout(() => {
            console.log('Bird has roosted. Resuming flight.');
            birdAscendAndFlight(bird, playArea);
        }, roostTime);
    }, 500); // Short delay to simulate smooth landing
}

function birdWalkingPattern(bird, playArea) {
    console.log('Bird walking on the ground.');

    let walkCount = 0;
    const maxWalks = 2 + Math.floor(Math.random() * 5) + 2;

    const walkInterval = setInterval(() => {
        if (bird.currentState !== birdStates.WALKING) {
            clearInterval(walkInterval);
            return;
        }

        walkCount++;
        const stepCount = 5 + Math.floor(Math.random() * 5);

        const performSteps = () => {
            let stepIndex = 0;
            const stepInterval = setInterval(() => {
                if (stepIndex < stepCount && bird.currentState === birdStates.WALKING) {
                    stepIndex++;
                    const currentX = parseFloat(bird.style.left);
                    const currentY = parseFloat(bird.style.top);

                    const distance = Math.random() * 5 + 2;
                    const angle = Math.random() * Math.PI * 2;

                    const newX = currentX + distance * Math.cos(angle);
                    const newY = currentY + distance * Math.sin(angle);

                    bird.style.left = `${Math.max(0, Math.min(newX, playArea.clientWidth - 20))}px`;
                    bird.style.top = `${Math.max(0, Math.min(newY, playArea.clientHeight - 20))}px`;

                    bird.style.transition = 'top 0.3s, left 0.3s';

                    console.log('Bird walked to', bird.style.left, bird.style.top);

                    detectWorms(bird, playArea);
                } else {
                    clearInterval(stepInterval);
                    if (bird.currentState === birdStates.WALKING) {
                        const pauseDuration = Math.random() * 5000 + 2000;
                        bird.style.transform = Math.random() > 0.5 ? 'scaleX(-1)' : 'scaleX(1)';
                        console.log(`Bird pausing for ${pauseDuration}ms`);
                        setTimeout(() => {
                            if (walkCount < maxWalks && bird.currentState === birdStates.WALKING) {
                                performSteps();
                            } else {
                                clearInterval(walkInterval);
                                birdAscendAndFlight(bird, playArea);
                            }
                        }, pauseDuration);
                    }
                }
            }, 500);
        };

        performSteps();
    }, 1000);
}

function birdMoveToWorm(bird, worm, playArea) {
    setState(bird, birdStates.MOVING_TO_WORM);
    console.log('Bird moving to worm.');

    const wormRect = worm.getBoundingClientRect();
    const birdRect = bird.getBoundingClientRect();

    const dx = wormRect.left - birdRect.left;
    const dy = wormRect.top - birdRect.top;
    const angle = Math.atan2(dy, dx);

    const speed = 2;
    let moveTime = 0;

    const moveInterval = setInterval(() => {
        moveTime += 500;
        if (bird.currentState !== birdStates.MOVING_TO_WORM) {
            clearInterval(moveInterval);
            return;
        }

        if (moveTime >= 15000) { // 15 seconds timeout
            clearInterval(moveInterval);
            console.log('Bird took too long to reach the worm, resuming flight.');
            birdAscendAndFlight(bird, playArea);
            return;
        }

        const currentX = parseFloat(bird.style.left);
        const currentY = parseFloat(bird.style.top);

        const distance = Math.random() * 5 + 2;
        const newX = currentX + distance * Math.cos(angle);
        const newY = currentY + distance * Math.sin(angle);

        bird.style.left = `${Math.max(0, Math.min(newX, playArea.clientWidth - 20))}px`;
        bird.style.top = `${Math.max(0, Math.min(newY, playArea.clientHeight - 20))}px`;

        bird.style.transition = 'top 0.3s, left 0.3s';

        const newBirdRect = bird.getBoundingClientRect();

        if (Math.abs(newBirdRect.left - wormRect.left) < 10 && Math.abs(newBirdRect.top - wormRect.top) < 10) {
            clearInterval(moveInterval);
            eatWorm(bird, worm);
        }
    }, 500);
}

function eatWorm(bird, worm) {
    setState(bird, birdStates.EATING);
    console.log(`Bird ate a worm. Hunger: ${bird.hunger}`);

    worm.remove();
    bird.hunger = Math.min(bird.hunger + 20, 100);

    setTimeout(() => {
        detectWorms(bird, playArea);
    }, 1000);
}

function detectWorms(bird, playArea) {
    const worms = document.querySelectorAll('.worm');
    let nearestWorm = null;
    let minDistance = Infinity;

    worms.forEach(worm => {
        const wormRect = worm.getBoundingClientRect();
        const birdRect = bird.getBoundingClientRect();
        const distance = Math.sqrt((birdRect.left - wormRect.left) ** 2 + (birdRect.top - wormRect.top) ** 2);
        if (distance < minDistance && distance < 300) { // Increased detection radius
            minDistance = distance;
            nearestWorm = worm;
        }
    });

    if (nearestWorm) {
        birdMoveToWorm(bird, nearestWorm, playArea);
    } else {
        birdAscendAndFlight(bird, playArea);
    }
}

function detectButterflies(bird, playArea) {
    const butterflies = document.querySelectorAll('.butterfly');
    butterflies.forEach(butterfly => {
        const butterflyRect = butterfly.getBoundingClientRect();
        const birdRect = bird.getBoundingClientRect();
        const distance = Math.sqrt((birdRect.left - butterflyRect.left) ** 2 + (birdRect.top - butterflyRect.top) ** 2);

        if (distance < 10) {
            butterfly.remove();
            bird.hunger = Math.min(bird.hunger + 5, 100);
            console.log(`Bird ate a butterfly. Hunger: ${bird.hunger}`);
        }
    });
}

function birdAscendAndFlight(bird, playArea) {
    console.log('Bird ascending to flight.');

    setState(bird, birdStates.ASCENDING);

    bird.style.transition = 'top 1s, left 1s';
    bird.style.top = `${parseFloat(bird.style.top) - 50}px`;
    setTimeout(() => {
        setState(bird, birdStates.FLYING);
        birdFlightPattern(bird, playArea, bird.hunger <= 60);
    }, 1000);
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
    wormElement.style.zIndex = '0';
    wormElement.addEventListener('dragstart', (e) => {
        const draggedElement = e.target;
        if (!draggedElement.classList.contains('emoji')) return;

        draggedEmoji = draggedElement.textContent;
        console.log(`Drag start: ${draggedEmoji}`);
    });

    const sidebar = document.getElementById('sidebar');
    sidebar.appendChild(wormElement);
}
