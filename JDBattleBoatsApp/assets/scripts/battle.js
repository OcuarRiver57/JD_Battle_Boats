/*
File Summary:
This file defines the Battle class, which contains the core game state and rules
for a two-player Battleship-style match. It handles ID generation, ship placement,
attack resolution, turn flow, and helper utilities used by the React Native screens.
*/

// to do list
/*
- implement the logic for moving ships on the grid
- allow both players to place ships at the same time
- limit how many ships can be placed
- dont disable gamestart until ship limit is reached for both plyers
*/

// where i left off
/*

*/

export default class Battle {
    // Creates a new game instance with player state, board data, and generated IDs.
    constructor(gameId) {
        // Initialize game state
        this.playerTurn = 1; // 1 or 2
        this.playerAction = "scout"; // possible values: "deploy", "scout", "attack"

        this.p1ShipData = {}; // dictionary of ship placements for player 1
        /* example: (can have ship, hit, or miss as values)
        {
        "0:0": "ship",
        "0:1": "hit",
        "1:2": "miss"
        }
        */
        this.p1AttackData = {}; // dictionary of attack history for player 1
        /* example: (can have hit or miss as values)
        {
        "0:0": "hit",
        "0:1": "hit",
        "1:2": "miss"
        }
        */
        this.p1ShipList = {}; // dictionary of ships for player 1. 
        /* example: 
        { 
        ship1 : ["0:0", "0:1", "0:2"],
        ship2 : ["1:0", "1:1", "1:2"]
        }
        */
        this.p2ShipData = {}; 
        this.p2AttackData = {};
        this.p2ShipList = {};

        this.gridRows = 10;
        this.gridCols = 10;

        this.player1Id = this.generatePlayerId();
        this.player2Id = this.generatePlayerId();

        this.gameId = gameId;
    }

//#region static utils
    // Builds a short uppercase game code used to reference a match instance.
    static generateGameId(length = 5) {
    // generates random id for game that can be shard with other to play same game
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let id = "";
        for (let i = 0; i < length; i++) {
            id += chars[Math.floor(Math.random() * chars.length)];
        }
        return id;
    }

    // Converts a coordinate array [x, y] into the string format "x:y".
    arrayToStringCordConverter(cord){
        if (Array.isArray(cord)) {
            return `${cord[0]}:${cord[1]}`;
        }
        else this.error(`arrayToStringCordConverter input is type "${typeof cord}" when it should be "array"`);
        
    }

    // Converts a coordinate string "x:y" into an array [x, y].
    stringToArrayCordConverter(cord){
        if (typeof cord === "string") {
            let cords = cord.split(":");
            let x = parseInt(cords[0], 10);
            let y = parseInt(cords[1], 10);
            return [x, y];
        }
        else this.error(`stringCordConverter input is type "${typeof cord}" when it should be "string"`);
        
    }

    // Converts coordinates in either direction based on the input type.
    cordConverter(cord){
        if (typeof cord === "string") return this.stringToArrayCordConverter(cord);
        else if (Array.isArray(cord)) return this.arrayToStringCordConverter(cord);
        else this.error(`cordConverter input is type "${typeof cord}" when it should be "array" or "string"`);
    }

    // Generates a unique player ID for identifying client requests.
    generatePlayerId(length = 16) {
    // generates random id for playsers that will get saved to client
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let id = "";
        for (let i = 0; i < length; i++) {
            id += chars[Math.floor(Math.random() * chars.length)];
        }
        return id;
    }

    // Returns the opposite player number for the current turn context.
    getOtherPlayer(player = this.playerTurn){
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

//#region deploy and move ship logic
    shipCordsFromStartDirectionLength(shipStartCord, shipDirection, shipLength){
    /*
    this method takes a start cell id, ship length, and direction.
    returns it returns an array of cords for the ship's placement or validation
    */
        // make sure input is in string format for testing
        shipStartCord = this.testCordInputTypeErrorHandler(shipStartCord, "validateShipPlacement");

        // convert cord to array format for easier use
        shipStartCord = this.stringToArrayCordConverter(shipStartCord);

        let cells = [];
        
        for (let i = 0; i < shipLength; i++) {
            let currentCord = [...shipStartCord];

            if (shipDirection == "up") {
                currentCord[1] = shipStartCord[1] - i; // 0 is x, 1 is y. - is up, + is down. [1] - 1 is up one
                cells.push(currentCord);
            }
            else if (shipDirection == "down") {
                currentCord[1] = shipStartCord[1] + i;
                cells.push(currentCord);
            }
            else if (shipDirection == "left") {
                currentCord[0] = shipStartCord[0] - i;
                cells.push(currentCord);
            }
            else if (shipDirection == "right") {
                currentCord[0] = shipStartCord[0] + i;
                cells.push(currentCord);
            }
            else this.error(`shipCordsFromStartDirectionLength shipDirection is not valid`);
        }
        return cells;
    }

    deployShip(shipCordsArray) {
    // this method places ship on the grid for the current player and returns cells of placed ship
        // check for valid input (expects array of [x,y])
        let invalidCells = this.validateShipPlacement(shipCordsArray);
        if (invalidCells.length > 0) {
            //this.error(`deployShip: ship placement invalid at cells: ${invalidCells}`);
            return [];
        }

        // save the ship to the list of ships
        this.saveShipToList(shipCordsArray);

        // picks the current player's shipData
        const shipData = this.selectShipData();
        // save each cord to the shipData dictionary with the value "ship"
        for (const cord of shipCordsArray) {
            const key = Array.isArray(cord) ? `${cord[0]}:${cord[1]}` : cord;
            shipData[key] = "ship";
        }
        return shipCordsArray;
    }

    // Placeholder for ship movement rules that have not been implemented yet.
    MoveShip(cord) {
        console.log("move ship not implemented", cord); // handle moving ship logic
    }

    validateShipPlacement(shipCordsArray) {
    /*
    this method takes an array of cords. 
    it checks the start cord and then the next cells in the direction of the ship
    returns it returns empty array if valid or an array of invalid cords if invalid
    */
        let invalidCords = [];
        const currentGrid = this.selectShipData();

        for (const cord of shipCordsArray) {
            let [x, y] = cord;
            if (
                x < 0 || x >= this.gridRows || /*checks x for out of bounds */
                y < 0 || y >= this.gridCols || /*checks y for out of bounds */
                currentGrid[cord] == "ship" || /*checks if cells is occupied */
                currentGrid[cord] == "hit"
            ) {
                //console.log(`cell ${cord} is invalid for placing a ship`);
                invalidCords.push([x, y]);
            }
        }
        return invalidCords;
    }

    validateShipPlacementOld(shipStartCord, shipDirection, shipLength) {
    /*
    this method takes a start cell id, ship length, and direction. 
    it checks the start cord and then the next cells in the direction of the ship
    returns it returns empty array if valid or an array of cords if invalid
    */
        // make sure input is in string format for testing
        shipStartCord = this.testCordInputTypeErrorHandler(shipStartCord, "validateShipPlacement");

        // convert cord to array format for easier use
        shipStartCord = this.stringToArrayCordConverter(shipStartCord);
        let invalidCells = [];
        
        for (let i = 0; i < shipLength; i++) {
            let currentGrid = this.selectShipData();
            let currentCord = [...shipStartCord];

            if (shipDirection == "up") {
            // checks if cells above starting cord are valid
                //makes currently checked cord the one above the previous one
                currentCord[1] = shipStartCord[1] - i; // 0 is x, 1 is y. - is up, + is down. [1] - 1 is up one
                // checks if cell is out of bounds or already used
                if (currentCord[1] < 0 || currentGrid[currentCord] == "ship" || currentGrid[currentCord] == "hit") {
                    console.log(`cell ${currentCord} is invalid for placing a ship`);
                    invalidCells.push(currentCord);
                }
            }
            else if (shipDirection == "down") {
                currentCord[1] = shipStartCord[1] + i;
                if (currentCord[1] > this.gridCols || currentGrid[currentCord] == "ship" || currentGrid[currentCord] == "hit") {
                    console.log(`cell ${currentCord} is invalid for placing a ship`);
                    invalidCells.push(currentCord);
                }
            }
            else if (shipDirection == "left") {
                currentCord[0] = shipStartCord[0] - i;
                if (currentCord[0] < 0 || currentGrid[currentCord] == "ship" || currentGrid[currentCord] == "hit") {
                    console.log(`cell ${currentCord} is invalid for placing a ship`);
                    invalidCells.push(currentCord);
                }
            }
            else if (shipDirection == "right") {
                currentCord[0] = shipStartCord[0] + i;
                if (currentCord[0] > this.gridCols || currentGrid[currentCord] == "ship" || currentGrid[currentCord] == "hit") {
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
        cord = this.testCordInputTypeErrorHandler(cord, "attack");

        // log the attack for debugging
        console.log(`Player${this.playerTurn} is Attacking: ${cord}. current cell status: ${otherShipGrid[cord]}`);

        // handles attack logic
        if (otherShipGrid[cord] == "ship"){
        // if the cell is a ship then it is hit
            otherShipGrid[cord] = "hit";
            currentAttackGrid[cord] = "hit";
            return [otherShipGrid[cord]];

        } 
        else if (otherShipGrid[cord] == "hit"){ 
        // if cell is already hit then return hit
            return [otherShipGrid[cord]];
        } else {
        // other wise it is a miss 
            otherShipGrid[cord] = "miss";
            currentAttackGrid[cord] = "miss";
            return ["miss"];
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
        cord = this.testCordInputTypeErrorHandler(cord, "identifyShipFromCell");
        
        //selects the current players shipList for search
        const shipList = this.selectShipList();
        
        //shipName is the key, shipList is the dict. 
        //for each key it searches is values (an array of cords) to see if it contains the cord
        for (const shipName in shipList) {
            if (shipList[shipName].includes(cord)) {
            return shipList[shipName];// return the list of coordinates for this ship
            }
        }

        this.error(`identifyShipFromCell did not find a ship at cord: ${cord}, in list:${JSON.stringify(shipList)} on turn ${this.playerTurn}`);
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
            if (this.selectShipData()[cord] == "ship") {
                this.error(`SaveShipToList: cord ${cord} already has a ship`);
            }
        }

        // picks the current player's shipList
        const shipList = this.selectShipList();

        // names the ship
        const shipName = `ship${Object.keys(shipList).length}`;

        // convert cords to array format for more consistant data storage
        let newShipCordsArray = [];
        for (const cord of shipCordsArray) {
            newShipCordsArray.push(this.arrayToStringCordConverter(cord));
        }

        // save the ship to the list with its cords
        shipList[shipName] = newShipCordsArray;
    }

//#endregion

//#region turn logic
    endTurn() {
    // it ends a turn and changes current player
        // switch player turn when attacking
        this.playerTurn = (this.playerTurn === 1) ? 2 : 1;    
    }

    action(playerId, action = "attack", details){
    // takes a player num, cords, and the current action and runs acts accordingly
        // checks if the game is starting and it should send the playerid's to the players.
        let gameStart = Object.keys(this.p1ShipList).length < 4 || Object.keys(this.p2ShipList).length < 4;
        let returnData ={};

        this.playerAction = action;

        // checks if the player id is correct or the game is starting
        if (playerId === this.player1Id || playerId === this.player2Id || gameStart) {
            //checks if the player who sent the request is the current player
            let player = 0;
            if (playerId === this.player1Id) player = 1;
            else if (playerId === this.player2Id) player = 2;

            const deployDuringSetup = this.playerAction == "deploy" && gameStart;
            console.log(`[Battle] Action called: player=${player}, action=${action}, turn=${this.playerTurn}, gameStart=${gameStart}, deployDuringSetup=${deployDuringSetup}`);
            
            if (player === this.playerTurn || deployDuringSetup) { // allow both players to deploy while setup is active
                let actionData;
                if (this.playerAction == "scout") {
                    actionData = this.validateShipPlacement(...details)
                }
                else if (this.playerAction == "deploy") {
                    let deployCords = this.shipCordsFromStartDirectionLength(...details);
                    actionData = this.deployShip(deployCords);
                }
                else if (this.playerAction == "attack" && !gameStart) {// attack can not be preformed on game start
                    actionData = this.attack(...details);
                    this.endTurn();
                }
                if (gameStart) returnData.playerId = (player === 1 ? this.player1Id : this.player2Id);

                returnData.actionData = actionData;
                returnData.fleet = {...this.selectShipData()};
                returnData.attacks = {...this.selectAttackData()};
                returnData.playerTurn = this.playerTurn;
                returnData.playerAction = this.playerAction;
                return returnData;
            }
            else console.log(`Its is not player${player}'s turn`);
        }
        else (this.error(`ID error: Player${player}| Given Id:${playerId}`));
    }

    // Checks whether either player's remaining ship cells are all destroyed.
    checkGameOver() {
        let p1Win = true;
        let p2Win = true;

        for (const cord in this.p1ShipData) {
            if (this.p1ShipData[cord] === "ship") {
                p2Win = false;
            }
        }
        for (const cord in this.p2ShipData) {
            if (this.p2ShipData[cord] === "ship") {
                p1Win = false;
            }
        }

        if (p1Win) return 1;
        else if (p2Win) return 2;
        else return 0;
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

            let cord = `${randomRow}:${randomCol}`;
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

    // Logs a detailed snapshot of game state to help diagnose runtime issues.
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
