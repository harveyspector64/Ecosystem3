document.addEventListener('DOMContentLoaded', () => {
    const playArea = document.getElementById('play-area');

    window.addBird = function(x, y) {
        console.log('Tree placed at:', x, y);

        const spawnTime = Math.random() * 8000 + 4000; // 4-12 seconds
        setTimeout(() => {
            console.log('Spawning bird after delay:', spawnTime);

            const birdElement = document.createElement('div');
            birdElement.textContent = EMOJIS.BIRD; // Placeholder emoji
            birdElement.classList.add('emoji', 'bird');
            birdElement.style.position = 'absolute';
            birdElement.style.left = getRandomEdgePosition('x') + 'px';
            birdElement.style.top = getRandomEdgePosition('y') + 'px';
            playArea.appendChild(birdElement);

            birdElement.hunger = 100; // Initialize hunger bar
            birdElement.state = 'flying'; // Initial state
            birdElement.walkCount = 0; // Initialize walk count

            console.log('Bird spawned with hunger:', birdElement.hunger, 'at position', birdElement.style.left, birdElement.style.top);

            birdFlightPattern(birdElement, x, y, false);
        }, spawnTime);
    };

    function birdFlightPattern(bird, targetX, targetY, isHunting) {
        console.log('Entering birdFlightPattern for bird at:', bird.style.left, bird.style.top);

        bird.state = 'flying';
        const flightTime = (Math.random() * 10000 + 5000); // 5-15 seconds
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
