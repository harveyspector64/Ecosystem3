function addWorm(x, y) {
    const worm = document.createElement('div');
    worm.textContent = EMOJIS.worm;
    worm.classList.add('emoji', 'worm');
    worm.style.position = 'absolute';
    worm.style.left = `${x}px`;
    worm.style.top = `${y}px`;
    document.getElementById('play-area').appendChild(worm);
}
