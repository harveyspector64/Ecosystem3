const birdStates = {
    PERCHING: 'perching',
    FLYING: 'flying',
    WALKING: 'walking',
    MOVING_TO_WORM: 'movingToWorm',
    EATING: 'eating',
    ASCENDING: 'ascending',
    DESCENDING: 'descending',
    LANDING: 'landing'
};

let firstBirdLanded = false; // Ensure this is defined

function setState(bird, newState) {
    console.log(`Bird state transition: ${bird.currentState} -> ${newState}`);
    bird.currentState = newState;
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

        bird.hunger = Math.max(bird.hunger - 0.5, 0); // Constant hunger decrement

        detectButterflies(bird, playArea);

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

function birdLandingDecision(bird, playArea) {
    console.log(`Bird deciding where to land. Hunger: ${bird.hunger}`);

    if (bird.hunger <= 30) {
        console.log('Bird hunger below 30, landing on the ground to hunt.');
        birdDescendToGround(bird, playArea);
    } else if (bird.hunger <= 60) {
        console.log('Bird hunger between 30 and 60, actively searching for food.');
        birdFlightPattern(bird, playArea, true);
    } else { 
        console.log('Bird hunger above 60, flying to a tree to perch.');
        birdFlyToTree(bird, playArea);
    }
}

function birdFlyToTree(bird, playArea) {
    console.log('Bird flying to tree.');

    setState(bird, birdStates.FLYING);

    const tree = getNearestTree(bird);
    if (tree) {
        const treeX = parseFloat(tree.style.left);
        const treeY = parseFloat(tree.style.top);

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
    }
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
            birdFlightPattern(bird, playArea, false);
        }, roostTime);
    }, 500); // Short delay to simulate smooth landing
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
                    // Walking logic...
                    detectWorms(bird, playArea);
                } else {
                    clearInterval(stepInterval);
                    if (bird.currentState === birdStates.WALKING) {
                        setTimeout(() => {
                            if (walkCount < maxWalks) {
                                performSteps();
                            } else {
                                clearInterval(walkInterval);
                                birdAscendAndFlight(bird, playArea);
                            }
                        }, 1000); // Pause duration
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

    const moveInterval = setInterval(() => {
        if (bird.currentState !== birdStates.MOVING_TO_WORM) {
            clearInterval(moveInterval);
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

    setTimeout(() => {
        worm.remove();
        bird.hunger = Math.min(bird.hunger + 20, 100);

        // Trigger the next state
        if (bird.hunger >= 60) {
            birdAscendAndFlight(bird, playArea); // Fly if full
        } else {
            setState(bird, birdStates.WALKING); // Keep searching if still hungry
            birdWalkingPattern(bird, playArea);
        }
    }, 200); // Adjust delay as needed
}

function detectWorms(bird, playArea) {
    if (bird.currentState === birdStates.WALKING) {
        const worms = document.querySelectorAll('.worm');
        let nearestWorm = null;
        let minDistance = Infinity;

        worms.forEach(worm => {
            const wormRect = worm.getBoundingClientRect();
            const birdRect = bird.getBoundingClientRect();
            const distance = Math.sqrt((birdRect.left - wormRect.left) ** 2 + (birdRect.top - wormRect.top) ** 2);
            if (distance < minDistance && distance < 300) {
                minDistance = distance;
                nearestWorm = worm;
            }
        });

        if (nearestWorm) {
            birdMoveToWorm(bird, nearestWorm, playArea);
        } else if (bird.hunger <= 60) {
            birdAscendAndFlight(bird, playArea);
        }
    }
}

function detectButterflies(bird, playArea) {
    if (bird.currentState === birdStates.FLYING) {
        const butterflies = document.querySelectorAll('.butterfly');
        butterflies.forEach(butterfly => {
            const butterflyRect = butterfly.getBoundingClientRect();
            const birdRect = bird.getBoundingClientRect();

            if (birdRect.left < butterflyRect.right &&
                birdRect.right > butterflyRect.left &&
                birdRect.top < butterflyRect.bottom &&
                birdRect.bottom > butterflyRect.top) {
                    butterfly.remove();
                    bird.hunger = Math.min(bird.hunger + 5, 100);
                    console.log(`Bird ate a butterfly. Hunger: ${bird.hunger}`);
            }
        });
    }
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

function addBird(x, y, playArea) {
    const delay = Math.random() * 8000 + 4000;
    console.log(`Spawning bird after delay: ${delay}`);

    setTimeout(() => {
        const birdElement = document.createElement('div');
        birdElement.textContent = EMOJIS.BIRD;
        birdElement.classList.add('emoji', 'bird');
        birdElement.style.position = 'absolute';
        birdElement.style.left = `${Math.random() * playArea.clientWidth}px`;
        birdElement.style.top = `${Math.random() * playArea.clientHeight}px`;
        birdElement.style.zIndex = '1';
        playArea.appendChild(birdElement);

        birdElement.hunger = 100; // Initialize hunger
        setState(birdElement, birdStates.FLYING);
        console.log(`Bird spawned with hunger: ${birdElement.hunger} at position ${birdElement.style.left} ${birdElement.style.top}`);

        birdFlightPattern(birdElement, playArea, false);
    }, delay);
}
