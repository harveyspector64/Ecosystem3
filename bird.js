document.addEventListener('DOMContentLoaded', () => {
    const playArea = document.getElementById('play-area');
    
    // Initialize bird-related variables
    let birdCount = 0;

    function addBird(x, y) {
        console.log('Adding bird at coordinates:', x, y);

        const birdElement = document.createElement('div');
        birdElement.textContent = EMOJIS.BIRD;
        birdElement.classList.add('emoji', 'bird');
        birdElement.style.position = 'absolute';
        birdElement.style.left = getRandomEdgePosition('x') + 'px';
        birdElement.style.top = getRandomEdgePosition('y') + 'px';
        playArea.appendChild(birdElement);

        birdElement.hunger = 100; // Initialize hunger bar
        birdElement.state = 'flying'; // Initial state

        console.log('Bird initialized with hunger:', birdElement.hunger);

        moveBird(birdElement, x, y);
    }

    function moveBird(bird, targetX, targetY) {
        console.log('Bird starting flight from', bird.style.left, bird.style.top);

        const flightInterval = setInterval(() => {
            if (bird.state === 'flying') {
                const currentX = parseFloat(bird.style.left);
                const currentY = parseFloat(bird.style.top);

                // Calculate new position with random angles and distances
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 100 + 50;
                const newX = currentX + distance * Math.cos(angle);
                const newY = currentY + distance * Math.sin(angle);

                bird.style.left = `${newX}px`;
                bird.style.top = `${newY}px`;

                bird.hunger -= 1; // Decrease hunger over time

                console.log('Bird moved to', bird.style.left, bird.style.top, 'with hunger', bird.hunger);

                // Decide if the bird should land
                const flightTime = Math.random() * 10000 + 10000; // 10-20 seconds
                setTimeout(() => {
                    if (bird.hunger <= 60) {
                        clearInterval(flightInterval);
                        bird.state = 'landing';
                        console.log('Bird hunger below 60, preparing to land.');
                        landBird(bird, targetX, targetY);
                    } else {
                        console.log('Bird continuing flight.');
                        bird.state = 'flying';
                    }
                }, flightTime);
            }
        }, 300); // Movement interval
    }

    function landBird(bird, targetX, targetY) {
        if (bird.hunger <= 60) {
            // Land on the tree
            console.log('Bird is landing on the tree due to low hunger.');
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

                const roostTime = Math.random() * 3000 + 3000; // 3-6 seconds
                setTimeout(() => {
                    bird.hunger = 100; // Reset hunger after roosting
                    bird.state = 'flying';
                    console.log('Bird has roosted and reset hunger. Resuming flight.');
                    moveBird(bird, targetX, targetY);
                }, roostTime);
            }
        } else {
            // Land on the ground
            console.log('Bird is landing on the ground.');
            bird.style.left = `${targetX}px`;
            bird.style.top = `${targetY}px`;

            birdWalkingPattern(bird);
        }
    }

    function birdWalkingPattern(bird) {
        console.log('Bird is walking on the ground.');

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
