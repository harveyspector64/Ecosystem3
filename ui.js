document.addEventListener('DOMContentLoaded', () => {
    const playArea = document.getElementById('play-area');

    playArea.addEventListener('dragover', function(event) {
        event.preventDefault();
    });

    playArea.addEventListener('drop', function(event) {
        event.preventDefault();
        const data = event.dataTransfer.getData('text/plain');
        const x = event.clientX - playArea.offsetLeft;
        const y = event.clientY - playArea.offsetTop;

        if (data === 'tree') {
            addTree(x, y);
        } else if (data === 'bush') {
            addBush(x, y);
        } else if (data === 'worm') {
            addWorm(x, y);
        }
    });
});
