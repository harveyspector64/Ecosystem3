document.addEventListener('DOMContentLoaded', () => {
    // Add butterfly-specific styles to the play area
    const style = document.createElement('style');
    style.textContent = `
        .butterfly {
            font-size: 1.5rem;
            position: absolute;
            transition: transform 0.5s;
        }
    `;
    document.head.appendChild(style);
});

function addButterflies(x, y) {
    const playArea = document.getElementById('play-area');
    const butterfly = document.createElement('div');
    butterfly.className = 'butterfly';
    butterfly.textContent = EMOJIS['butterfly'];
    butterfly.style.left = `${x}px`;
    butterfly.style.top = `${y}px`;
    butterfly.hunger = 100; // Initial hunger level
    playArea.appendChild(butterfly);

    // Butterfly behavior logic
    moveButterfly(butterfly);
}

function moveButterfly(butterfly) {
    const interval = setInterval(() => {
        butterfly.hunger -= 1; // Decrease hunger over time
        if (butterfly.hunger <= 50) {
            // Butterfly lands to feed if hunger is low
            butterflyLand(butterfly);
        } else {
            // Random flight pattern logic
            const targetX = Math.random() * window.innerWidth;
            const targetY = Math.random() * window.innerHeight;
            butterfly.style.transform = `translate(${targetX}px, ${targetY}px)`;
        }
    }, 1000);
}

function butterflyLand(butterfly) {
    const bushes = document.querySelectorAll('.floweringBush');
    if (bushes.length > 0) {
        // Find nearest bush and land on it to feed
        const bush = bushes[0]; // Simplified for demo; should find nearest
        butterfly.style.left = bush.style.left;
        butterfly.style.top = bush.style.top;
        butterfly.hunger = 100; // Replenish hunger
        setTimeout(() => {
            moveButterfly(butterfly); // Resume flying after feeding
        }, 3000); // Feed for 3 seconds
    } else {
        moveButterfly(butterfly); // Continue flying if no bushes
    }
}
