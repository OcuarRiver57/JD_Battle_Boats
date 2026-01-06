// to do list
/*
- action method
    - add logic for each action
    - add logic for non current player requesting data
- test the logic for validating ship placement on the grid
- implement the logic for moving ships on the grid
- figure out how to allow both players to place ships at the same time
*/

// where i left off
/*
    action method
        - add logic for each action
*/

class Battle {
    constructor() {
        // Initialize game state
        this.playerTurn = 1; // 1 or 2
        this.playerAction = "attack"; // possible values: "deploy", "scout", "attack"

        this.p1ShipData = {}; // dictionary of ship placements for player 1
        /* example: (can have ship, hit, or miss as values)
        {
        "0-0": "ship",
        "0-1": "hit",
        "1-2": "miss"
        }
        */
        this.p1AttackData = {}; // dictionary of attack history for player 1
        /* example: (can have hit or miss as values)
        {
        "0-0": "hit",
        "0-1": "hit",
        "1-2": "miss"
        }
        */
        this.p1ShipList = {}; // dictionary of ships for player 1. 
        /* example: 
        { 
        ship1 : ["0-0", "0-1", "0-2"],
        ship2 : ["1-0", "1-1", "1-2"]
        }
        */
        this.p2ShipData = {}; 
        this.p2AttackData = {};
        this.p2ShipList = {};

        this.gridRows = 10;
        this.gridCols = 10;

        this.player1Id = generatePlayerId();
        this.player2Id = generatePlayerId();

        this.gameId - generateGameId();
    }

//#region static utils
    static arrayToStringCordConverter(cord){
        if (typeof cord === "array") {
            return `${cord[0]}-${cord[1]}`;
        }
        else this.error(`arrayCordConverter input is type "${typeof cord}" when it should be "array"`);
        
    }

    static stringToArrayCordConverter(cord){
        if (typeof cord === "string") {
            let cords = cord.split("-");
            let x = parseInt(cords[1], 10);
            let y = parseInt(cords[2], 10);
            return [x, y];
        }
        else this.error(`stringCordConverter input is type "${typeof cord}" when it should be "string"`);
        
    }

    static cordConverter(cord){
        if (typeof cord === "string") return this.stringToArrayCordConverter(cord);
        else if (typeof cord === "array") return this.arrayToStringCordConverter(cord);
        else this.error(`cordConverter input is type "${typeof cord}" when it should be "array" or "string"`);
    }

    static generatePlayerId(length = 16) {
    // generates random id for playsers that will get saved to client
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let id = "";
        for (let i = 0; i < length; i++) {
            id += chars[Math.floor(Math.random() * chars.length)];
        }
        return id;
    }

    static generateGameId(length = 5) {
    // generates random id for game that can be shard with other to play same game
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let id = "";
        for (let i = 0; i < length; i++) {
            id += chars[Math.floor(Math.random() * chars.length)];
        }
        return id;
    }

    static getOtherPlayer(player = this.playerTurn){
        return (player === 1) ? 2 : 1;
    }
//#endregion

//#region Data Dict Selectors
    selectShipList(player = this.playerTurn) {
    /*
    this method returns the current player's shipList dictionary
    this is where the cords save in shipData are grouped into ships and saved
    */
        if (player === 1) return this.p1ShipList;
        else return this.p2ShipList;
    }

    selectShipData(player = this.playerTurn) {
    /*
    this method returns the current player's shipData dictionary
    this is where the current player's ship placement and status is stored
    */
        if (player === 1) return this.p1ShipData;
        else return this.p2ShipData;
    }

    selectAttackData(player = this.playerTurn) {
    /*
    this method returns the current player's attackData dictionary
    this is where the current player's attack history is stored
    */
        if (player === 1) return this.p1AttackData;
        else return this.p2AttackData;
    }

//#endregion

//#region place and move ship logic
    deployShip(shipCordsArray) {
    /*
    this funciton handles the final step of adding a ship to the lists
    this funciton does not validate the ship placement
    */
        // picks the current player's shipList
        const shipList = this.selectShipList();
        // save the ship to the list with its cords
        this.saveShipToList(shipCordsArray);

        // picks the current player's shipData
        const shipData = this.selectShipData();
        // save each cord to the shipData dictionary with the value "ship"
        for (const cord in shipCordsArray) {
            shipData[cord] = "ship";
        }

    }

    MoveShip(cord) {
        console.log("move ship not implemented", cord); // handle moving ship logic
    }

    validateShipPlacement(shipStartCord, shipLength, shipDirection) {
    /*
    this method takes a start cell id, ship length, and direction. 
    it checks the start cord and then the next cells in the direction of the ship
    returns it returns empty array if valid or an array of cords if invalid
    */
        // make sure input is in string format for testing
        shipStartCord = cordInputTypeErrorHandler(shipStartCord, "validateShipPlacement");

        // convert cord to array format for easier use
        shipStartCord = stringToArrayCordConverter(shipStartCord);
        let invalidCells = [];
        
        for (let i = 0; i < shipLength; i++) {
            let currentGrid = this.selectShipData();
            let currentCord = [...shipStartCord];

            if (shipDirection == "up") {
            // checks if cells above starting cord are valid
                //makes currently checked cord the one above the previous one
                currentCord[1] = shipStartCord[1] - i; // 0 is x, 1 is y. - is up, + is down. [1] - 1 is up one

                // checks if cell is out of bounds or already used
                if (currentCord < 0 || currentGrid[currentCord] == "ship" || currentGrid[currentCord] == "hit") {
                    console.log(`cell ${currentCord} is invalid for placing a ship`);
                    invalidCells.push(currentCord);
                }
            }
            else if (shipDirection == "down") {
                currentCord[1] = shipStartCord[1] + i;
                if (currentCord > this.gridCols || currentGrid[currentCord] == "ship" || currentGrid[currentCord] == "hit") {
                    console.log(`cell ${currentCord} is invalid for placing a ship`);
                    invalidCells.push(currentCord);
                }
            }
            else if (shipDirection == "left") {
                currentCord[0] = shipStartCord[0] - i;
                if (currentCord < 0 || currentGrid[currentCord] == "ship" || currentGrid[currentCord] == "hit") {
                    console.log(`cell ${currentCord} is invalid for placing a ship`);
                    invalidCells.push(currentCord);
                }
            }
            else if (shipDirection == "right") {
                currentCord[0] = shipStartCord[0] + i;
                if (currentCord > this.gridCols || currentGrid[currentCord] == "ship" || currentGrid[currentCord] == "hit") {
                    console.log(`cell ${currentCord} is invalid for placing a ship`);
                    invalidCells.push(currentCord);
                }
            }
            else this.error(`validateShipPlacement shipDirection is not valid`);
        }
        return invalidCells;
    }
//#endregion

//#region attack logic
    attack(cord) {
    /*
    this method takes a cord as an attack target and uses the current player as the attacker
    it updates the current player's attackData and the other players shipData with the result.
    */
        // select the current player's attackData and the other player's shipData
        let currentAttackGrid = this.selectAttackData();
        let otherShipGrid = this.selectShipData(this.getOtherPlayer());// selects the non curent player's data
        
        // make sure cord is in string format
        cord = cordInputTypeErrorHandler(cord, "attack");

        // log the attack for debugging
        console.log(`Player${this.playerTurn} is Attacking: ${cord}. current cell status: ${otherShipGrid[cord]}`);

        // handles attack logic
        if (otherShipGrid[cord] == "ship" || otherShipGrid[cord] == "hit"){
        // if the cell is a ship or already hit then it is hit
            othershipGrid = "hit";
            currentAttackGrid[cord] = "hit";

        } else {
        // other wise it is a miss 
            otherShipGrid[cord] = "miss";
            currentAttackGrid[cord] = "miss";
        }

        //log result for debugging
        console.log(`attack result: ${otherShipGrid[cord]}`);
    }
//#endregion

//#region ship cords logic
    identifyShipFromCell(cord) {
    /* 
    this method identifies a ship when given a cord
    this is useful when a cell is selected and we need to 
    know which ship it belongs to so that we can get those cell cords as well
    it takes a cord as input and returns the key of the ship in the shipList dictionary
    */
        // make sure cord is in string format
        cord = cordInputTypeErrorHandler(cord, "identifyShipFromCell");
        
        //selects the current players shipList for search
        const shipList = this.selectShipList();
        
        //shipName is the key, shipList is the dict. 
        //for each key it searches is values (an array of cords) to see if it contains the cord
        for (const shipName in shipList) {
            if (shipList[shipName].includes(cord)) {
            return shipList[shipName];// return the list of coordinates for this ship
            }
        }

        this.error(`identifyShipFromCell did not find a ship at cord: ${cord}, in list:${shipList} on turn ${this.playerTurn}`);
        return null; // no ship found at this cell
    }

    saveShipToList(shipCordsArray){
    /*
    this function saves a  ship's cords to the current player's shipList dictionary
    it takes an array of cords as input
    */

        // checks if any of the cells already have a ship
        // does not stop duplicates but logs an error
        for (const cord in shipCordsArray) {
            if (this.identifyShipFromCell(cord)) {
                this.error(`SaveShipToList: cord ${cord} already has a ship`);
            }
        }

        // picks the current player's shipList
        const shipList = this.selectShipList();

        // names the ship
        const shipName = `ship${shipList.length}`;

        // save the ship to the list with its cords
        shipList[shipName] = shipCordsArray;
    }

//#endregion

//#region turn logic
    endTurn() {
    // it ends a turn and changes current player

        // switch player turn
        this.playerTurn = (this.playerTurn === 1) ? 2 : 1;
    }

    action(player, cords, playerId){
    // takes a player num, cords, and the current action and runs acts accordingly
        // checks if the game is starting and it should send the playerid's to the players.
        let gameStart = false;
        if (this.p1ShipData.length === 0 || this.p2ShipData.length === 0) gameStart = true;
        let returnData;

        // checks if the player id is correct or the game is starting
        if (playerId === this.player1Id || playerId === this.player2Id || gameStart) {
            //checks if the player who sent the request is the current player
            if (player === this.playerTurn) {
                if (this.playerAction == "scout") {}
                else if (this.playerAction == "deploy") {}
                else if (this.playerAction == "attack") {}
                if (gameStart) returnData.playerId = (player === 1 ? this.player1Id : this.player2Id);

                returnData.fleet = {...this.selectShipData()};
                returnData.attacks = {...this.selectAttackData()};
                return returnData;
            }
            else console.log(`Its is not ${player}'s turn`);
        }
        else (this.error(`ID error: Player${player}| Given Id:${playerId}`));
    }
//#endregion

//#region test functions
    testResetMaps() {
    /*
    resets game to start state by clearing all saved data 
    */

        this.p1ShipData = {};
        this.p1AttackData = {};
        this.p1ShipList = {};

        this.p2ShipData = {}; 
        this.p2AttackData = {};
        this.p2ShipList = {};
    }

    testChangeRandomCells() {
    /*
    changes random cells in the shipData dictionaries to "ship" for testing
    */
        let gridSize = this.gridRows * this.gridCols;
        let fillSize = gridSize / 3;
        let random = Math.floor(Math.random() * fillSize);
        
        for (let i = 0; i < random; i++) {
            let randomRow = Math.floor(Math.random() * this.gridRows);
            let randomCol = Math.floor(Math.random() * this.gridCols);

            let cord = `${randomRow}-${randomCol}`;
            this.p1ShipData[cord] = "ship";
            this.p2ShipData[cord] = "ship";

            console.log(`${i+1}) ..... ${cord} = ship`);
        }
    }

    testCordInputTypeErrorHandler(cord, caller) {
    /* 
    IF CODE IS CORRECT THEN ERROR WILL NOT BE TRIGGERED AND FUNCTION CAN BE REMOVED FROM CODE
    this function checks if the cord input is in the correct format
    it takes a cord and the name of the function that called it as input
    it returns the cord in string format if it was an array
    */
        if (typeof cord === "array") { // if the input is an array, convert it to a string
            cord = this.arrayCordConverter(cord); 
            this.error(`${caller} input type was array, converting to string`);
        }
        return cord;
    }

    error(errorDescription = "no error description provided") {
        console.error(`
            Error in game ${this.gameId}:
            player1Id: ${this.player1Id}
            player2Id: ${this.player2Id}
            playerTurn: ${this.playerTurn}
            playerAction: ${this.playerAction}
            gridRows: ${this.gridRows}
            gridCols: ${this.gridCols}

            Error Description==============================
            ${errorDescription}
            End of Error Description=======================

            Player 1 Data==================================
            player1Id: ${this.player1Id}
            p1ShipData: ${JSON.stringify(this.p1ShipData)}
            p1AttackData: ${JSON.stringify(this.p1AttackData)}
            p1ShipList: ${JSON.stringify(this.p1ShipList)}
            End of Player 1 Data===========================

            Player 2 Data==================================
            player2Id: ${this.player2Id}
            p2ShipData: ${JSON.stringify(this.p2ShipData)}
            p2AttackData: ${JSON.stringify(this.p2AttackData)}
            p2ShipList: ${JSON.stringify(this.p2ShipList)}
            End of Player 2 Data===========================
            `);
    }
//#endregion
}
