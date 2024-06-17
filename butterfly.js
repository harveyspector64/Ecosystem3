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
    playArea.appendChild(butterfly);

    // Butterfly behavior logic
    moveButterfly(butterfly);
}

function moveButterfly(butterfly) {
    // Logic for butterfly flight patterns and interactions
}
