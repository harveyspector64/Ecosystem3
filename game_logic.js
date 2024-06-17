function handleGameLogic(emojiType, x, y) {
    if (emojiType === 'tree') {
        unlockBird();
    } else if (emojiType === 'bird') {
        unlockWorm();
    }

    // Add more game logic as needed
}
