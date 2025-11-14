// TO DO LIST
/*
- Implement the logic for placing ships on the grid
- Implement the logic for moving ships on the grid
- Implement the logic for attacking the opponent's grid
- Implement the logic for ending a turn and switching players
*/

// where i left
/*
updateCellValue ln 53
cell is not updating and rendering
*/


import { useState } from 'react'

//GLOBAL_VARIABLES
//in caps with underscores to make them easily identifiable
let PLAYER_ACTION = "placing_ship"; // Possible values: "placing_ship", "moving_ship", "attacking"
let PLAYER_TURN = 1; // 1 or 2

let P1_SHIP_MAP = [[],[],[],[],[],[],[],[],[],[]]; 
let P1_ATTACK_MAP = [[],[],[],[],[],[],[],[],[],[]]; 
let P2_SHIP_MAP = [[],[],[],[],[],[],[],[],[],[]]; 
let P2_ATTACK_MAP = [[],[],[],[],[],[],[],[],[],[]]; 


function App() {
  const [count, setCount] = useState(0)

  return (
    <div id="app_container" className = "flex flex-col h-screen">
      <div id = "info_bar" className = "flex flex-row justify-between bg-gray-300 p-4">
        <div id = "turn_info" className = "flex-6/12">Current Player: null</div>
        <div id = "timer_info" className = "flex-6/12">Game Time:0    Round Time:0</div>
      </div>

      <div id="game_board" className = "flex flex-row h-10/12">
        <div id = "ship_grid" className = "flex-5/12 flex-col bg-blue-400 mx-5"> 
          <CreateGrid value = "a"/>
        </div>
        <div id = "attack_grid" className = "flex-5/12 flex-col bg-black text-white mx-5">
          <CreateGrid value = "b"/>
        </div>
      </div>

      <div id = "base_bar" className = "flex flex-row justify-left bg-gray-300 p-4">
        <div id = "powerup_area" className = "bg-yellow-400 flex-5/12"> power ups</div>
        <div id = "status_area" className = "bg-green-400 flex-5/12"> <AddTestingButtons/>{/*REMOVE THIS BEFORE PRODUCTIONS */} </div>
      </div>
    </div>
  )
}

//#region grid Creation
function createCell(gridID, row, col) {
  const [cellValue, setCellValue] = useState("");
  const updateCellValue = (newValue) => {
    console.log(`Updating cell ${gridID}-${row}-${col} value to ${newValue}`);
    setCellValue(newValue);
  }
  const cellId = `${gridID}-${row}-${col}`;
  return (
    <div 
      id={cellId} 
      key={cellId}
      gamecellvalue={cellValue}
      className="
        w-full h-full border border-gray-500 flex items-center justify-center 
        hover:cursor-pointer hover:bg-orange-500
      " 
      onClick={handleCellClick}
    >
    {/* cell contents */}
    {cellValue}
    </div>
  ); 
}

function CreateGrid(gridId, rows = 10, cols = 10) {
    let cells = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        cells.push(createCell(gridId, row, col));
      }
    }
    return (
        <div className="grid grid-cols-10 grid-rows-10 w-full h-full">
          {cells}
        </div>
    );
  }

  function handleCellClick(event) {
  const cell = event.target;
  console.log(`Cell clicked: ${cell.id}`);
  // Add logic to handle the cell click, such as updating game state or sending a move to the server

  if (PLAYER_ACTION == "moving_ship") MoveShip(cell);
      
  if (PLAYER_ACTION == "attacking") Attack(cell);

  if (PLAYER_ACTION == "placing_ship") PlaceShip(cell);

}

//#endregion

//#region map Creation
function CreateBlankMap(rows = 10, cols = 10) {
  let map = [];


  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < cols; y++) {
      map[x][y] = "";
    }
  }

  return map;
}

function CreateAllMaps() {
  P1_SHIP_MAP = CreateBlankMap();
  P1_ATTACK_MAP = CreateBlankMap();
  P2_SHIP_MAP = CreateBlankMap();
  P2_ATTACK_MAP = CreateBlankMap();
}
//#endregion

//#region Saving and Loading map data
function SaveMapData(cord) {
  // POSSIBLY DEFUNCT AFTER CHANGING TO BACKEND STORAGE
  //cords is in the format of "a-0-0" or "b-0-0"
  //cords[0] is either "a" or "b" to determine which grid it is
  //cords[1] is the row number and cords[2] is the column number
  //cordState is the value of the gamecellvalue of the cell, which can be "ship", "hit", "miss", or empty
  let cordState = document.getElementById(cord).gamecellvalue; 

  //if the cordState is "ship", then we need to save it to the appropriate ship list based on the player turn
  if (cordState == "ship") {
    if (cord[0] == "a" ) {
      if (PLAYER_TURN == 1) {
        P1_SHIP_MAP[cord] = cordState;
      }
      else {
        P2_SHIP_MAP[cord] = cordState;
      }
      // the game should only try to save cordState "ship" if the cord is in grid "a" (ship grid)
    } else throw new Error("Attempted to save ship data to grid b or invalid grid");
  }

  //if the cordState is "hit" or "miss", then we need to save it to the appropriate ship list and attack list based on the player turn
  else {
    if (cord[0] == "a" ) { // grid "a" shows the current player's ships
      if (PLAYER_TURN == 1) {// if player 1 is attacking when this function is called
        P2_SHIP_MAP[cord] = cordState; //update the ship list of the opponent player with the new cordState (hit or miss)
        P1_ATTACK_MAP[cord] = cordState; //update the attack list of the current player with the new cordState (hit or miss)
      }
      else {// if p2 is attacking then do the update the corresponding lists for player 1 and player 2
        P1_SHIP_MAP[cord] = cordState;
        P2_ATTACK_MAP[cord] = cordState;
      }
    }
  }
}

function SaveAllMapData() {
  // POSSIBLY DEFUNCT AFTER CHANGING TO BACKEND STORAGE
  for (let i = 0; i < 10; i++) {// for each row in grid "a" and "b"
    for (let j = 0; j < 10; j++) {// for each column in each row
      // if cell is not empty, save the data to the appropriate list
      if (document.getElementById(`a-${i}-${j}`).gamecellvalue != "")
        SaveMapData(`a-${i}-${j}`);

      // if cell is not empty, save the data to the appropriate list
      if (document.getElementById(`b-${i}-${j}`).gamecellvalue != "")
        SaveMapData(`b-${i}-${j}`);
    }
  }
}

function LoadMapData(cord) {
  //short hand to get the value of the cell in the grid
  let mapCell = document.getElementById(cord).gamecellvalue;
  if (PLAYER_TURN == 1) {
    if (cord[0] == "a") {
      mapCell.updateCellValue(P1_SHIP_MAP[cord]) 
    }
    else if (cord[0] == "b") {
      mapCell.updateCellValue(P1_ATTACK_MAP[cord] || "");
    }
  }
  else if (PLAYER_TURN == 2) {
    if (cord[0] == "a") {
      mapCell.updateCellValue(P2_SHIP_MAP[cord]);
    }
    else if (cord[0] == "b") {
      mapCell.updateCellValue(P2_ATTACK_MAP[cord]);
    }
  }
}

function LoadAllMapData() {
    for (let i = 0; i < 10; i++) {// for each row in grid "a" and "b"
    for (let j = 0; j < 10; j++) {// for each column in each row
      LoadMapData(`a-${i}-${j}`);
      LoadMapData(`b-${i}-${j}`);
    }
  }
}
//#endregion

//#region player actionhandlers
function PlaceShip(cell) {
  const cord = cell.id;
  console.log("place ship not implemented")// Handle placing ship logic
  
  SaveMapData(cord);
}

function MoveShip(cell) {
  const cord = cell.id;
  console.log("move ship not implemented")// Handle moving ship logic

  SavemapData(cord);
}

function Attack(cell) {
  const cord = cell.id;
  console.log("attacking not implemented")// Handle attacking logic

  SaveMapData(cord);
}
//#endregion

//#region Game functions
function InitGame() {
  CreateAllMaps();
  LoadAllMapData();
}

function EndTurn() {
  // Save the current game state before ending the turn
  SaveAllMapData();

  // Switch player turn
  PLAYER_TURN = (PLAYER_TURN === 1) ? 2 : 1;

  // Load the game state for the new player
  LoadAllMapData();
}
//#endregion

//#region test functions

function changeRandomCells() {
  let randomGrid = Math.random() < 0.5 ? "a" : "b";
  let random100 = Math.floor(Math.random() * 100);
  let random3 = Math.floor(Math.random() * 3);
  
  let randomValue = "";
  if (random3 == 0) randomValue = "ship";
  else if (random3 == 1) randomValue = "hit";
  else randomValue = "miss";
  
  console.log(`Changing ${random100} cells in grid ${randomGrid} to value ${randomValue}`);
  for (let i = 0; i < random100; i++) {
    let randomRow = Math.floor(Math.random() * 10);
    let randomCol = Math.floor(Math.random() * 10);
    let cellId = `${randomGrid}-${randomRow}-${randomCol}`;
    if (randomGrid == "a") {
      P1_SHIP_MAP[cellId] = randomValue;
      P2_ATTACK_MAP[cellId] = randomValue;
    }
    else if (randomGrid == "b") {
      P1_ATTACK_MAP[cellId] = randomValue;
      P2_SHIP_MAP[cellId] = randomValue;
    }
    console.log(`Changed cell ${cellId} to value ${randomValue}`);
  }
  console.log(`changed ${random100} cells in grid ${randomGrid} to value ${randomValue}`);
}

function ResetMaps() {
  P1_ATTACK_MAP = {};
  P1_SHIP_MAP = {};
  P2_ATTACK_MAP = {};
  P2_SHIP_MAP = {};
  LoadAllMapData();
}

function AddTestingButtons() {
  return (
    <div >
      <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={changeRandomCells}>
        Change Random Cells
      </button>
      <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={ResetMaps}>
        Reset Maps
      </button>
    </div>
  )
}

//#endregion

export default App