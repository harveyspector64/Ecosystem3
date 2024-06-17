// bird.js

// Constants for bird behavior
const BIRD_HUNGER_DECAY = 0.01;
const BIRD_WELL_FED_THRESHOLD = 1.5;

export class Bird {
    constructor() {
        this.hunger = 1.0;
        this.wellFed = 0.0;
        this.state = 'flying';
    }

    update() {
        switch (this.state) {
            case 'flying':
                this.hunger -= BIRD_HUNGER_DECAY;
                if (this.hunger <= 0) {
                    this.hunger = 0;
                    this.state = 'hungry';
                }
                break;
            case 'hungry':
                // Logic for hunting worms
                break;
            case 'roosting':
                // Logic for roosting
                break;
            case 'eating':
                // Logic for eating worms
                break;
            case 'breeding':
                // Logic for breeding
                break;
        }
    }

    huntWorm() {
        // Logic to hunt worm
    }

    eatWorm() {
        // Logic to eat worm
    }

    roost() {
        // Logic to roost
    }

    breed() {
        // Logic to breed
    }
}
