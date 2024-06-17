
// gameEngine.js

export class GameEngine {
    constructor() {
        this.bushesPlanted = 0;
        this.treesPlanted = 0;
        this.maxBushes = 5;
        this.maxTrees = 1;
    }

    canPlantBush() {
        console.log('Checking if can plant bush:', this.bushesPlanted, '/', this.maxBushes); // Debugging
        return this.bushesPlanted < this.maxBushes;
    }

    canPlantTree() {
        console.log('Checking if can plant tree:', this.treesPlanted, '/', this.maxTrees); // Debugging
        return this.treesPlanted < this.maxTrees;
    }

    plantBush() {
        console.log('Attempting to plant bush'); // Debugging
        if (this.canPlantBush()) {
            this.bushesPlanted++;
            console.log('Bush planted:', this.bushesPlanted); // Debugging
            return true;
        }
        console.log('Cannot plant bush:', this.bushesPlanted); // Debugging
        return false;
    }

    plantTree() {
        console.log('Attempting to plant tree'); // Debugging
        if (this.canPlantTree()) {
            this.treesPlanted++;
            console.log('Tree planted:', this.treesPlanted); // Debugging
            return true;
        }
        console.log('Cannot plant tree:', this.treesPlanted); // Debugging
        return false;
    }

    reset() {
        this.bushesPlanted = 0;
        this.treesPlanted = 0;
    }
}
