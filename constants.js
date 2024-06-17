const EMOJIS = {
    butterfly: '🦋',
    tree: '🌳',
    bird: '🐦',
    worm: '🐛',
    floweringBush: '🌸', // Example new emoji
    rock: '🪨' // Example new emoji
};

const INITIAL_EMOJIS = ['butterfly', 'tree'];

const UNLOCK_THRESHOLDS = {
    bird: 1, // Unlocks after placing 1 tree
    worm: 1, // Unlocks after placing 1 bird
    // Add more thresholds as needed
};

const DAY_NIGHT_CYCLE = {
    dayDuration: 600, // Example duration in seconds
    nightDuration: 600 // Example duration in seconds
};
