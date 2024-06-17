document.addEventListener('DOMContentLoaded', () => {
    const playArea = document.getElementById('play-area');

    function createButterfly(x, y) {
        const butterflyElement = document.createElement('div');
        butterflyElement.textContent = EMOJIS.BUTTERFLY;
        butterflyElement.classList.add('emoji', 'butterfly');
        butterflyElement.style.position = 'absolute';
        butterflyElement.style.left = getRandomEdgePosition('x') + 'px';
        butterflyElement.style.top = getRandomEdgePosition('y') + 'px';
        playArea.appendChild(butterflyElement);

        butterflyElement.hunger = 100; // Initialize hunger bar
        butterflyElement.state = 'flying'; // Initial state

        console.log('Butterfly spawned at position', butterflyElement.style.left, butterflyElement.style.top);

        butterflyFlightPattern(butterflyElement, x, y);
    }

    function butterflyFlightPattern(butterfly, targetX, targetY) {
        console.log('Entering butterflyFlightPattern for butterfly at:', butterfly.style.left, butterfly.style.top);

        butterfly.state = 'flying';
        const flightTime = Math.random() * 5000 + 5000; // 5-10 seconds
        let lastDebugTime = Date.now(); // Timestamp for throttling debug messages

        const flightInterval = setInterval(() => {
            if (butterfly.state === 'flying') {
                if (Date.now() - lastDebugTime > 3000) { // Log every 3 seconds
                    console.log('Butterfly is flying at:', butterfly.style.left, butterfly.style.top);
                    lastDebugTime = Date.now();
                }

                const currentX = parseFloat(butterfly.style.left);
                const currentY = parseFloat(butterfly.style.top);

                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 20 + 10; // Random distance
                const newX = currentX + distance * Math.cos(angle);
                const newY = currentY + distance * Math.sin(angle);

                butterfly.style.left = `${Math.max(0, Math.min(newX, playArea.clientWidth - 20))}px`;
                butterfly.style.top = `${Math.max(0, Math.min(newY, playArea.clientHeight - 20))}px`;

                if (butterfly.hunger <= 0) {
                    clearInterval(flightInterval);
                    console.log('Butterfly hunger below 0, removing butterfly.');
                    butterfly.remove();
                }
            }
        }, 500);

        // Set timeout for changing state after flight time
        setTimeout(() => {
            if (butterfly.state === 'flying') {
                clearInterval(flightInterval);
                console.log('Butterfly completing flight time, resuming flight.');
                butterflyFlightPattern(butterfly, targetX, targetY);
            }
        }, flightTime);
    }

    function addButterflies(x, y) {
        const numButterflies = Math.floor(Math.random() * 2) + 1; // 1-2 butterflies per bush
        const bushElement = document.createElement('div');
        bushElement.classList.add('bush');
        bushElement.dataset.cooldown = false; // Initial cooldown state

        for (let i = 0; i < numButterflies; i++) {
            createButterfly(x, y);
        }

        // Add bush to play area
        bushElement.style.position = 'absolute';
        bushElement.style.left = `${x}px`;
        bushElement.style.top = `${y}px`;
        playArea.appendChild(bushElement);

        // Set up butterfly respawn cooldown
        setInterval(() => {
            if (bushElement.dataset.cooldown === "false") {
                createButterfly(x, y);
                bushElement.dataset.cooldown = true;
                setTimeout(() => {
                    bushElement.dataset.cooldown = false;
                }, Math.random() * 30000 + 30000); // 30-60 seconds cooldown
            }
        }, 5000); // Check every 5 seconds
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
