// bird.js

import { getRandomTime, getNearestTree, getDistance } from './utils.js';
import { EMOJIS, birdStates } from './constants.js';
import { setFirstBirdLanded } from './gameState.js';
import { addEventLogMessage } from './eventLogger.js';

let birdCounter = 0;

function setState(bird, newState) {
    console.log(`Bird state transition: ${bird.currentState} -> ${newState}`);
    bird.currentState = newState;
}

export function addBird(x, y) {
    const delay = getRandomTime(4000, 12000);
    console.log(`Spawning bird after delay: ${delay}`);
    
    setTimeout(() => {
        if (!window.cachedElements || !window.cachedElements.playArea) {
            console.error('Play area not found');
            return;
        }

        const birdElement = document.createElement('div');
        birdElement.textContent = EMOJIS.BIRD;
        birdElement.classList.add('emoji', 'bird');
        birdElement.style.position = 'absolute';
        birdElement.style.left = `${(Math.random() * 100)}%`;
        birdElement.style.top = `${(Math.random() * 100)}%`;
        birdElement.style.zIndex = '1';
        birdElement.id = `bird-${++birdCounter}`;
        window.cachedElements.playArea.appendChild(birdElement);

        birdElement.hunger = 100;
        birdElement.foodConsumed = 0;
        setState(birdElement, birdStates.FLYING);
        console.log(`Bird spawned with hunger: ${birdElement.hunger} at position ${birdElement.style.left} ${birdElement.style.top}`);
        
        addEventLogMessage(`Bird ${birdElement.id} has spawned.`);

        birdFlightPattern(birdElement, window.cachedElements.playArea, false);
    }, delay);
}

function birdFlightPattern(bird, playArea, isErratic) {
    setState(bird, birdStates.FLYING);

    const flightTime = getRandomTime(5000, 15000);
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
        const distance = isErratic ? getRandomTime(60, 100) : getRandomTime(30, 50);
        const newX = currentX + distance * Math.cos(angle);
        const newY = currentY + distance * Math.sin(angle);

        bird.style.left = `${Math.max(0, Math.min(newX, playArea.clientWidth - 20))}px`;
        bird.style.top = `${Math.max(0, Math.min(newY, playArea.clientHeight - 20))}px`;

        bird.hunger = Math.max(bird.hunger - (isErratic ? 1 : 0.5), 0);

        detectWorms(bird, playArea);
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

        if (!gameState.firstBirdLanded) {
            setFirstBirdLanded();
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
        console.log('Bird hunger above 70, flying to a tree to perch.');
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

function birdDescendToGround(bird, playArea) {
    console.log('Bird descending to land on the ground.');

    setState(bird, birdStates.DESCENDING);

    bird.style.transition = 'top 1s, left 1s';
    bird.style.top = `${parseFloat(bird.style.top) + 50}px`;
    setTimeout(() => {
        setState(bird, birdStates.WALKING);
        bird.walkCount = 0; // Reset walk count
        birdWalkingPattern(bird, playArea);

        if (!gameState.firstBirdLanded) {
            setFirstBirdLanded();
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

        const roostTime = getRandomTime(10000, 30000);
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
                        const pauseDuration = getRandomTime(2000, 7000);
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

    const speed = 10; // Increased speed
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
        } else if (moveTime % 3000 === 0) { // Pause every 3 seconds
            clearInterval(moveInterval);
            const pauseDuration = getRandomTime(500, 1500);
            bird.style.transform = Math.random() > 0.5 ? 'scaleX(-1)' : 'scaleX(1)';
            console.log(`Bird pausing while moving to worm for ${pauseDuration}ms`);
            setTimeout(() => {
                birdMoveToWorm(bird, worm, playArea); // Resume movement
            }, pauseDuration);
        }
    }, 300); // Decreased interval for faster movement
}

function eatWorm(bird, worm) {
    setState(bird, birdStates.EATING);
    console.log(`Bird ate a worm. Hunger: ${bird.hunger}`);

    setTimeout(() => {
        worm.remove();
        bird.hunger = Math.min(bird.hunger + 20, 100);
        bird.foodConsumed = (bird.foodConsumed || 0) + 20; // Track food consumption

        addEventLogMessage(`Bird ${bird.id} ate a worm. Food consumed: ${bird.foodConsumed}`);

        if (bird.hunger >= 60) {
            birdAscendAndFlight(bird, window.cachedElements.playArea);
        } else {
            setState(bird, birdStates.WALKING);
            birdWalkingPattern(bird, window.cachedElements.playArea);
        }

        checkForNestCreation(bird); // Check for nest creation after eating
    }, 200); // Short delay for smoother animation
}

function detectWorms(bird, playArea) {
    if (bird.currentState === birdStates.WALKING) {
        const worms = document.querySelectorAll('.worm');
        let nearestWorm = null;
        let minDistance = Infinity;

        worms.forEach(worm => {
            const wormRect = worm.getBoundingClientRect();
            const birdRect = bird.getBoundingClientRect();
            const distance = getDistance(
                {x: birdRect.left, y: birdRect.top},
                {x: wormRect.left, y: wormRect.top}
            );
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
                    bird.foodConsumed = (bird.foodConsumed || 0) + 5; // Track food consumption
                    console.log(`Bird ate a butterfly. Hunger: ${bird.hunger}`);
                    addEventLogMessage(`Bird ${bird.id} ate a butterfly. Food consumed: ${bird.foodConsumed}`);

                    checkForNestCreation(bird); // Check for nest creation after eating
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
    }, 1000); // Ensure this matches the transition duration
}

function checkForNestCreation(bird) {
    if (bird.foodConsumed >= 120) { // Adjusted threshold for nest creation
        const tree = getNearestTree(bird);
        if (tree) {
            createNestInTree(tree);
            bird.foodConsumed = 0; // Reset food count after creating nest
        }
    }
}

function createNestInTree(tree) {
    console.log('Creating nest in tree.');

    const nestElement = document.createElement('div');
    nestElement.textContent = '🥚'; // Nest with eggs emoji
    nestElement.classList.add('emoji', 'nest');
    nestElement.style.position = 'absolute';
    nestElement.style.left = tree.style.left;
    nestElement.style.top = `${parseFloat(tree.style.top) - 30}px`; // Place nest slightly above the tree
    tree.appendChild(nestElement);

    addEventLogMessage('A nest has been created in a tree.');

    // Set timer for nest to hatch
    const hatchTime = getRandomTime(120000, 180000); // 2-3 minutes
    setTimeout(() => hatchNest(nestElement), hatchTime);
}

function hatchNest(nestElement) {
    console.log('Hatching nest.');

    nestElement.remove();

    addEventLogMessage('A nest has hatched! New birds have appeared.');

    const numberOfBirds = Math.floor(Math.random() * 2) + 2; // 2-3 new birds
    for (let i = 0; i < numberOfBirds; i++) {
        const x = Math.random() * window.cachedElements.playArea.clientWidth;
        const y = Math.random() * window.cachedElements.playArea.clientHeight;
        addBird(x, y);
    }
}

// Expose necessary functions to the global scope
export { 
    addBird,
    birdLandingDecision,
    birdDescendToGround,
    birdAscendAndFlight,
    detectButterflies
};
