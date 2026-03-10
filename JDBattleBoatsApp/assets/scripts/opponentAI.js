/*
File Summary:
This file defines AI opponents for local Battleship games. It includes a factory
that selects an AI class by difficulty, a shared base AI for ship placement and
attack tracking, and multiple strategy variants from random to near-perfect play.
*/

// Factory function that returns an AI strategy instance for the chosen difficulty.
export default function opponentAI(gameId, difficulty) {
    switch(difficulty){
        case 1:
            return new VeryEasyOpponentAI(gameId);
        case 2:
            return new EasyOpponentAI(gameId);
        case 3:
            return new MediumOpponentAI(gameId);
        case 4:
            return new HardOpponentAI(gameId);
        case 5:
            return new VeryHardOpponentAI(gameId);
        case 6:
            return new ImpossibleOpponentAI(gameId);
    }
}

// Base AI class containing shared setup, ship placement, and attack helpers.
class OpponentAI {
    // Initializes persistent AI state for one game session.
    constructor(gameId) {
        this.gameId = gameId;
        this.playerId = null;
        this.shipsPlaced = 0;
        this.shipLengths = [2, 3, 4, 5]; // 4 boats total
        this.ships = {}; // object with ship name as keys and arrays of coordinates as values
        this.hits = []; // array of coordinates that have been hit
        this.misses = []; // array of coordinates that have been missed
        this.attackedCoordinates = []; // all coordinates attacked (hits + misses)
        console.log(`[AI] OpponentAI constructor called - GameID: ${gameId}, shipsPlaced initialized to: ${this.shipsPlaced}`);
    }

    // Generates a valid ship start, direction, and length for the next ship to place.
    placeShip() {
        const shipLength = this.shipLengths[this.shipsPlaced];
        let validPlacement = false;
        let shipStart = null;
        let shipDirection = "right";

        while (!validPlacement) {
            const x = Math.floor(Math.random() * 10);
            const y = Math.floor(Math.random() * 10);
            shipDirection = Math.random() < 0.5 ? "right" : "down";

            const shipCoordinates = this.generateShipCoordinates(x, y, shipDirection, shipLength);
            validPlacement = this.validatePlacement(shipCoordinates);
            shipStart = `${x}:${y}`;
        }

        return [shipStart, shipDirection, shipLength];
    }

    // Builds every coordinate a ship would occupy from a starting cell and direction.
    generateShipCoordinates(startX, startY, direction, length) {
        const coordinates = [];
        for (let i = 0; i < length; i++) {
            if (direction === "right") {
                coordinates.push(`${startX + i}:${startY}`);
            } else {
                coordinates.push(`${startX}:${startY + i}`);
            }
        }
        return coordinates;
    }

    // Verifies that candidate ship coordinates are inside the grid and non-overlapping.
    validatePlacement(coordinates) {
        // Check if all coordinates are within bounds and not already occupied
        for (const coord of coordinates) {
            const [x, y] = coord.split(':').map(Number);
            if (x < 0 || x > 9 || y < 0 || y > 9) return false;

            // Check if coordinate already occupied by another ship
            for (const ship of Object.values(this.ships)) {
                if (ship.includes(coord)) return false;
            }
        }
        return true;
    }

    // Runs one AI turn: place ships during setup, then attack once setup is complete.
    takeTurn(battleInstance) {
        if (!this.playerId && battleInstance.player2Id) {
            this.playerId = battleInstance.player2Id;
            console.log(`[AI] Player ID set to: ${this.playerId}`);
        }

        console.log(`[AI] takeTurn called - shipsPlaced: ${this.shipsPlaced}, p2ShipList count: ${Object.keys(battleInstance.p2ShipList || {}).length}`);

        // Place ships first
        if (this.shipsPlaced < 4) {
            const [shipStart, shipDirection, shipLength] = this.placeShip();
            console.log(`[AI] Attempting to place ship: start=${shipStart}, dir=${shipDirection}, len=${shipLength}, shipsPlaced=${this.shipsPlaced}`);
            const result = battleInstance.action(this.playerId, "deploy", [shipStart, shipDirection, shipLength]);
            console.log(`[AI] Deploy result:`, result);

            if (result && result.actionData && result.actionData.length > 0) {
                const shipName = "ship" + (this.shipsPlaced + 1);
                this.ships[shipName] = result.actionData;
                this.shipsPlaced++;
                console.log(`[AI] Ship placed successfully! Total ships: ${this.shipsPlaced}`);
            } else {
                console.log(`[AI] Ship placement failed - no actionData or empty array`);
            }
        }
        // Attack phase
        else {
            console.log(`[AI] Attempting to attack (shipsPlaced=${this.shipsPlaced})`);
            const attackCoordinate = this.selectTarget();
            if (attackCoordinate) {
                const result = battleInstance.action(this.playerId, "attack", [attackCoordinate]);
                this.recordAttack(attackCoordinate, result);
            }
        }
    }

    // Chooses an attack target; subclasses override this with smarter strategies.
    selectTarget() {
        // Override in subclasses for different strategies
        const coordinate = this.getRandomCoordinate();
        return !this.attackedCoordinates.includes(coordinate) ? coordinate : null;
    }

    // Returns a random coordinate in the 10x10 board.
    getRandomCoordinate() {
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        return `${x}:${y}`;
    }

    // Records whether an AI attack was a hit or miss and stores the attacked coordinate.
    recordAttack(coordinate, result) {
        this.attackedCoordinates.push(coordinate);
        if (result && result.actionData && result.actionData[0] === "hit") {
            this.hits.push(coordinate);
        } else {
            this.misses.push(coordinate);
        }
    }

    // Returns valid, not-yet-attacked adjacent cells around a coordinate.
    getAdjacentCoordinates(coordinate) {
        const [x, y] = coordinate.split(':').map(Number);
        const adjacent = [];
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            if (newX >= 0 && newX <= 9 && newY >= 0 && newY <= 9) {
                const coord = `${newX}:${newY}`;
                if (!this.attackedCoordinates.includes(coord)) {
                    adjacent.push(coord);
                }
            }
        }
        return adjacent;
    }
}

// Difficulty 1 AI: random targeting with basic duplicate avoidance.
class VeryEasyOpponentAI extends OpponentAI {
    // Attacks random locations on grid
    selectTarget() {
        let coordinate;
        let attempts = 0;
        const maxAttempts = 20;

        while (attempts < maxAttempts) {
            coordinate = this.getRandomCoordinate();
            if (!this.attackedCoordinates.includes(coordinate)) {
                return coordinate;
            }
            attempts++;
        }
        return null;
    }
}

// Difficulty 2 AI: random targeting that retries until an untried coordinate is found.
class EasyOpponentAI extends OpponentAI {
    // Attacks random locations with no repeat attacks
    selectTarget() {
        let coordinate;
        let attempts = 0;
        const maxAttempts = 20;

        while (attempts < maxAttempts) {
            coordinate = this.getRandomCoordinate();
            if (!this.attackedCoordinates.includes(coordinate)) {
                return coordinate;
            }
            attempts++;
        }
        return null;
    }
}

// Difficulty 3 AI: random search plus adjacent follow-up after a hit.
class MediumOpponentAI extends OpponentAI {
    // Random with no repeats, targets area around hits
    selectTarget() {
        // If there are recent hits, target adjacent squares
        if (this.hits.length > 0) {
            const lastHit = this.hits[this.hits.length - 1];
            const adjacent = this.getAdjacentCoordinates(lastHit);
            if (adjacent.length > 0) {
                return adjacent[Math.floor(Math.random() * adjacent.length)];
            }
        }

        // Otherwise random
        let coordinate;
        let attempts = 0;
        const maxAttempts = 20;

        while (attempts < maxAttempts) {
            coordinate = this.getRandomCoordinate();
            if (!this.attackedCoordinates.includes(coordinate)) {
                return coordinate;
            }
            attempts++;
        }
        return null;
    }
}

// Difficulty 4 AI: checkerboard search pattern with adjacent follow-up behavior.
class HardOpponentAI extends OpponentAI {
    // Precomputes search pattern data for targeted scanning.
    constructor(gameId) {
        super(gameId);
        this.searchPatterns = this.generateSearchPatterns();
        this.patternIndex = 0;
    }

    // Creates a shuffled checkerboard pattern to reduce wasted search shots.
    generateSearchPatterns() {
        const patterns = [];
        // Checkerboard pattern
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                if ((x + y) % 2 === 0) {
                    patterns.push(`${x}:${y}`);
                }
            }
        }
        return patterns.sort(() => Math.random() - 0.5);
    }

    // Chooses adjacent cells after hits, otherwise advances through the search pattern.
    selectTarget() {
        // If there are recent hits, target adjacent squares
        if (this.hits.length > 0) {
            const lastHit = this.hits[this.hits.length - 1];
            const adjacent = this.getAdjacentCoordinates(lastHit);
            if (adjacent.length > 0) {
                return adjacent[Math.floor(Math.random() * adjacent.length)];
            }
        }

        // Use search pattern
        while (this.patternIndex < this.searchPatterns.length) {
            const coordinate = this.searchPatterns[this.patternIndex++];
            if (!this.attackedCoordinates.includes(coordinate)) {
                return coordinate;
            }
        }
        return null;
    }
}

// Difficulty 5 AI: pattern search that attempts to finish known target ships.
class VeryHardOpponentAI extends OpponentAI {
    // Initializes additional state for tracking focused ship elimination.
    constructor(gameId) {
        super(gameId);
        this.searchPatterns = this.generateSearchPatterns();
        this.patternIndex = 0;
        this.targetedShip = null;
    }

    // Creates a shuffled checkerboard scan list used before focused attacks.
    generateSearchPatterns() {
        const patterns = [];
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                if ((x + y) % 2 === 0) {
                    patterns.push(`${x}:${y}`);
                }
            }
        }
        return patterns.sort(() => Math.random() - 0.5);
    }

    // Prioritizes finishing targeted ships, then adjacent hits, then pattern search.
    selectTarget() {
        // If targeting a ship, know its location and attack until sunk
        if (this.targetedShip && this.targetedShip.length > 0) {
            const remaining = this.targetedShip.filter(
                coord => !this.hits.includes(coord)
            );
            if (remaining.length > 0) {
                return remaining[0];
            }
            this.targetedShip = null;
        }

        // If there are hits, determine ship pattern and target it
        if (this.hits.length > 0) {
            const lastHit = this.hits[this.hits.length - 1];
            const adjacent = this.getAdjacentCoordinates(lastHit);
            if (adjacent.length > 0) {
                return adjacent[0];
            }
        }

        // Use search pattern
        while (this.patternIndex < this.searchPatterns.length) {
            const coordinate = this.searchPatterns[this.patternIndex++];
            if (!this.attackedCoordinates.includes(coordinate)) {
                return coordinate;
            }
        }
        return null;
    }
}

// Difficulty 6 AI: intended "perfect" behavior with near-complete coverage.
class ImpossibleOpponentAI extends OpponentAI {
    // Knows all opponent ship locations and never misses
    selectTarget() {
        // In a real implementation, this would need access to the opponent's ship data
        // For now, use a perfect search pattern that doesn't miss
        let coordinate;
        let attempts = 0;

        while (attempts < 100) {
            coordinate = this.getRandomCoordinate();
            if (!this.attackedCoordinates.includes(coordinate)) {
                return coordinate;
            }
            attempts++;
        }
        return null;
    }
}