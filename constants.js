// constants.js

export const EMOJIS = {
    BUSH: '🌺',
    TREE: '🌳',
    BUTTERFLY: '🦋',
    BIRD: '🐦',
    WORM: '🐛'
};

export const INITIAL_EMOJIS = [
    { id: 'flowering-bush', emoji: EMOJIS.BUSH },
    { id: 'tree', emoji: EMOJIS.TREE, disabled: true }
];

export const birdStates = {
    PERCHING: 'perching',
    FLYING: 'flying',
    WALKING: 'walking',
    MOVING_TO_WORM: 'movingToWorm',
    EATING: 'eating',
    DESCENDING: 'descending',
    LANDING: 'landing',
    ASCENDING: 'ascending'
};
