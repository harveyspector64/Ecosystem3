
function addWorm(x, y) {
    const playArea = document.getElementById('play-area');
    const wormElement = document.createElement('div');
    wormElement.textContent = '🐛';
    wormElement.classList.add('emoji', 'worm');
    wormElement.style.position = 'absolute';
    wormElement.style.left = `${x}px`;
    wormElement.style.top = `${y}px`;
    playArea.appendChild(wormElement);
}
