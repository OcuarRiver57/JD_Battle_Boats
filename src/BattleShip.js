// to do list
/*
- implement the logic for validating ship placement on the grid
- implement the logic for moving ships on the grid
*/

// where i left off
/*
validateShipPlacement
    code logic for checking cells in direction are valid
*/

class BattleShipGame {
    constructor() {
        // Initialize game state
        this.playerTurn = 1; // 1 or 2
        this.playerAction = "attacking"; // possible values: "placing_ship", "moving_ship", "attacking"

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
    }

//#region static utils
    static arrayCordConverter(cord){
        if (typeof cord === "array") {
            return `${cord[0]}-${cord[1]}`;
        }
        else console.error(`arrayCordConverter input is type "${typeof cord}" when it should be "array"`);
        
    }

    static stringCordConverter(cord){
        if (typeof cord === "string") {
            let cords = cord.split("-");
            let x = parseInt(cords[1], 10);
            let y = parseInt(cords[2], 10);
            return [x, y];
        }
        else console.error(`stringCordConverter input is type "${typeof cord}" when it should be "string"`);
        
    }

    static cordConverter(cord){
        if (typeof cord === "string") return this.stringCordConverter(cord);
        else if (typeof cord === "array") return this.arrayCordConverter(cord);
        else console.error(`cordConverter input is type "${typeof cord}" when it should be "array" or "string"`);
    }

//#endregion

//#region Data Dict Selectors
    selectShipList(selectCurrent = true) {
    /*
    this method returns the current player's shipList dictionary
    this is where the cords save in shipData are grouped into ships and saved
    it takes a bool as input. if true, it returns the current player's data.
    if false, it returns the other player's data.
    it defaults to true.
    */
        if (selectCurrent) return (this.playerTurn === 1) ? this.p1ShipList : this.p2ShipList;
        else return (this.playerTurn === 1) ? this.p2ShipList : this.p1ShipList;
    }

    selectShipData(selectCurrent = true) {
    /*
    this method returns the current player's shipData dictionary
    this is where the current player's ship placement and status is stored
    it takes a bool as input. if true, it returns the current player's data.
    if false, it returns the other player's data.
    it defaults to true.
    */
        if (selectCurrent) return (this.playerTurn === 1) ? this.p1ShipData : this.p2ShipData;
        else return (this.playerTurn === 1) ? this.p2ShipData : this.p1ShipData;
    }

    selectAttackData(selectCurrent = true) {
    /*
    this method returns the current player's attackData dictionary
    this is where the current player's attack history is stored
    it takes a bool as input. if true, it returns the current player's data.
    if false, it returns the other player's data.
    it defaults to true.
    */
        if (selectCurrent) return (this.playerTurn === 1) ? this.p1AttackData : this.p2AttackData;
        else return (this.playerTurn === 1) ? this.p2AttackData : this.p1AttackData;
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
    returns it returns null if valid or an array of cords if invalid
    */
        // make sure cord is in string format
        cordStartCord = cordInputTypeErrorHandler(shipStartCord, "validateShipPlacement");
        for (let i = 0; i < shipLength; i++) {
            if (shipDirection == "up") {}
            else if (shipDirection == "down") {}
            else if (shipDirection == "left") {}
            else if (shipDirection == "right") {}
            else console.error(`validateShipPlacement shipDirection is not valid`);
        }
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
        let otherShipGrid = this.selectShipData(false);// false means it selects the non curent player's data
        
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

        console.error(`identifyShipFromCell did not find a ship at cord: ${cord}, in list:${shipList} on turn ${this.playerTurn}`);
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
                console.error(`SaveShipToList: cord ${cord} already has a ship`);
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
            console.error(`${caller} input type was array, converting to string`);
        }
        return cord;
    }
//#endregion
}