function handleEmojiPlacement(emojiType, x, y) {
    switch(emojiType) {
        case 'tree':
            spawnBirds(x, y);
            break;
        case 'butterfly':
            // Handle butterfly placement logic if needed
            break;
        case 'floweringBush':
            spawnButterflies(x, y);
            break;
        // Add more cases as necessary
    }
}

function spawnButterflies(x, y) {
    // Logic to spawn butterflies
    addButterflies(x, y);
}

function spawnBirds(x, y) {
    // Logic to spawn birds
    addBird(x, y);
    unlockEmoji('caterpillar'); // Unlock caterpillar emoji when birds are spawned
}
