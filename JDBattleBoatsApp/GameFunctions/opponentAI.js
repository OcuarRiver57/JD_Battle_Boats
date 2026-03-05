// to do list
/*

*/

// where i left off
/*
    place ship / take turn
*/

import Battle from './battle.js';

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

class OpponentAI {
    constructor(gameId) {
        this.gameId = gameId;
        this.playerId = 0;
        this.shipsPlaced = false;
        this.ships = {}; // object with ship name as keys and arrays of coordinates as values
        this.hits = [];// array of coordinates that have been hit
        this.misses = []; // array of coordinates that have been missed
        this.history = {}; // object with hit or miss history example below
        /*
        {
        "1": {miss: [x,y]},
        "2": {hit: [x,y]},
        }
        */
    }

    placeShip() {
        let x = Math.floor(Math.random() * 10);
        let y = Math.floor(Math.random() * 10);
        let orientation = Math.random() < 0.5 ? 'up' : 'right';
        let cordString = `${x}:${y}`;
            
        return [[cordString, orientation, shipLength]];

    }

    takeTurn(battleInstance) {
        let result;
        if (Object.keys(this.ships).length < 5) {
            result = battleInstance.action(this.playerId, "deploy", ...this.placeShip());
            if(result.playerId) this.playerId = result.playerId;
            if(result.actionData.length > 0){
                this.shipsPlaced++;
                let shipname = "ship" + this.shipsPlaced;
                this.ships[shipname] = result.actionData;
                console.log(`AI placed ${shipname} at ${result.actionData}`);
                console.log(result);
            }
        }


        
    }
}

class VeryEasyOpponentAI extends OpponentAI {

}

class EasyOpponentAI extends OpponentAI {

}

class MediumOpponentAI extends OpponentAI {

}

class HardOpponentAI extends OpponentAI {

}

class VeryHardOpponentAI extends OpponentAI {

}

class ImpossibleOpponentAI extends OpponentAI {

}