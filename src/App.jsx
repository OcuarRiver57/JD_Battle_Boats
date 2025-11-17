// to do list
/*
- implement the logic for placing ships on the grid
- implement the logic for moving ships on the grid
- implement the logic for attacking the opponent's grid
- implement the logic for ending a turn and switching players
*/

// where i left off
/*

*/


import { useState, useEffect } from 'react';

// global variables
// in lowercase with underscores to make them easily identifiable
let PLAYER_ACTION = "placing_ship"; // possible values: "placing_ship" "moving_ship" "attacking"
let PLAYER_TURN = 1; // 1 or 2

let P1_SHIP_MAP = [[],[],[],[],[],[],[],[],[],[]]; 
let P1_ATTACK_MAP = [[],[],[],[],[],[],[],[],[],[]]; 
let P2_SHIP_MAP = [[],[],[],[],[],[],[],[],[],[]]; 
let P2_ATTACK_MAP = [[],[],[],[],[],[],[],[],[],[]]; 


function App() {
  // Initialize two 10x10 grids
  const [gridA, setGridA] = useState(CreateBlankMap());
  const [gridB, setGridB] = useState(CreateBlankMap());

  return (
    <div id="app_container" className = "flex flex-col h-screen">
      <div id = "info_bar" className = "flex flex-row justify-between bg-gray-300 p-4">
        <div id = "turn_info" className = "flex-6/12">Current Player: null</div>
        <div id = "timer_info" className = "flex-6/12">Game Time:0    Round Time:0</div>
      </div>

      <div id="game_board" className = "flex flex-row h-10/12">
        <div id = "ship_grid" className = "flex-5/12 flex-col bg-blue-400 mx-5"> 
          <CreateGrid gridId="a" grid={gridA} setGrid={setGridA}/>
        </div>
        <div id = "attack_grid" className = "flex-5/12 flex-col bg-black text-white mx-5">
          <CreateGrid gridId="b" grid={gridB} setGrid={setGridB}/>
        </div>
      </div>

      <div id = "base_bar" className = "flex flex-row justify-left bg-gray-300 p-4">
        <div id = "powerup_area" className = "bg-yellow-400 flex-5/12"> power ups</div>
        <div id = "status_area" className = "bg-green-400 flex-5/12"> <AddTestingButtons setGridA={setGridA} setGridB={setGridB}/>{/*remove this before production */} </div>
      </div>
    </div>
  )
}

//#region grid creation
function Cell({ gridID, row, col, value, onUpdate }) {
  const cellId = `${gridID}-${row}-${col}`;

  return (
    <div 
      id={cellId} 
      key={cellId}
      className="
        w-full h-full border border-gray-500 flex items-center justify-center 
        hover:cursor-pointer hover:bg-orange-500
      " 
      style={{ backgroundColor: SetBackgroundOfCell(value) }}
      onClick={() => handleCellClick(cellId, row, col, gridID, onUpdate)}
    >
    {/* cell contents */}
    {value}
    </div>
  ); 
}

function CreateGrid({ gridId, grid, setGrid, rows = 10, cols = 10 }) {
    // function to handle when a cell is clicked and update it with a new value
    const handleCellUpdate = (row, col, newValue) => {
      // make a copy of the entire grid so we can change it
      let newGrid = [];
      for (let y = 0; y < grid.length; y++) {
        newGrid[y] = [];
        for (let x = 0; x < grid[y].length; x++) {
          // if this is the cell we're updating then use the new value
          if (y === row && x === col) {
            newGrid[y][x] = newValue;
          } else {
            newGrid[y][x] = grid[y][x];
          }
        }
      }
      // tell react that the grid has changed
      setGrid(newGrid);
    };

    // create an array to hold all the cell components
    let cells = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        cells.push(
          <Cell 
            key={`${gridId}-${row}-${col}`} 
            gridID={gridId} 
            row={row} 
            col={col}
            value={grid[row][col]}
            onUpdate={handleCellUpdate}
          />
        );
      }
    }
    return (
        <div className="grid grid-cols-10 grid-rows-10 w-full h-full">
          {cells}
        </div>
    );
  }

function handleCellClick(cellId, row, col, gridId, onUpdate) {
  const cell = document.getElementById(cellId);
  // add logic to handle the cell click such as updating game state or sending a move to the server

  if (PLAYER_ACTION == "moving_ship") MoveShip(cell, row, col, gridId, onUpdate);
      
  if (PLAYER_ACTION == "attacking") Attack(cell, row, col, gridId, onUpdate);

  if (PLAYER_ACTION == "placing_ship") PlaceShip(cell, row, col, gridId, onUpdate);
  
}

//#endregion

//#region map creation
function CreateBlankMap(rows = 10, cols = 10) {
  let map = [];

  for (let x = 0; x < rows; x++) {
    map[x] = [];
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
  // possibly defunct after changing to backend storage
  // cords is in the format of "a-0-0" or "b-0-0"
  // cords[0] is either "a" or "b" to determine which grid it is
  // cords[1] is the row number and cords[2] is the column number
  // cordstate is the value of the gamecellvalue of the cell which can be "ship" "hit" "miss" or empty
  let cordState = document.getElementById(cord).gamecellvalue; 

  // if the cordstate is "ship" then we need to save it to the appropriate ship list based on the player turn
  if (cordState == "ship") {
    if (cord[0] == "a" ) {
      if (PLAYER_TURN == 1) {
        P1_SHIP_MAP[cord] = cordState;
      }
      else {
        P2_SHIP_MAP[cord] = cordState;
      }
      // the game should only try to save cordstate "ship" if the cord is in grid "a" (ship grid)
    } else throw new Error("attempted to save ship data to grid b or invalid grid");
  }

  // if the cordstate is "hit" or "miss" then we need to save it to the appropriate ship list and attack list based on the player turn
  else {
    if (cord[0] == "a" ) { // grid "a" shows the current player's ships
      if (PLAYER_TURN == 1) { // if player 1 is attacking when this function is called
        P2_SHIP_MAP[cord] = cordState; // update the ship list of the opponent player with the new cordstate (hit or miss)
        P1_ATTACK_MAP[cord] = cordState; // update the attack list of the current player with the new cordstate (hit or miss)
      }
      else { // if p2 is attacking then do the update the corresponding lists for player 1 and player 2
        P1_SHIP_MAP[cord] = cordState;
        P2_ATTACK_MAP[cord] = cordState;
      }
    }
  }
}

function SaveAllMapData() {
  // possibly defunct after changing to backend storage
  for (let i = 0; i < 10; i++) { // for each row in grid "a" and "b"
    for (let j = 0; j < 10; j++) { // for each column in each row
      // if cell is not empty save the data to the appropriate list
      if (document.getElementById(`a-${i}-${j}`).gamecellvalue != "")
        SaveMapData(`a-${i}-${j}`);

      // if cell is not empty save the data to the appropriate list
      if (document.getElementById(`b-${i}-${j}`).gamecellvalue != "")
        SaveMapData(`b-${i}-${j}`);
    }
  }
}

function LoadAllMapData(setGridA, setGridB) {
  // build two new grids (10x10) and populate them from the backend lists
  const rows = 10;
  const cols = 10;
  const newA = [];
  const newB = [];
  for (let i = 0; i < rows; i++) {
    newA[i] = [];
    newB[i] = [];
    for (let j = 0; j < cols; j++) {
      const cordA = `a-${i}-${j}`;
      const cordB = `b-${i}-${j}`;
      if (PLAYER_TURN === 1) {
        newA[i][j] = P1_SHIP_MAP[cordA] || "";
        newB[i][j] = P1_ATTACK_MAP[cordB] || "";
      } else {
        newA[i][j] = P2_SHIP_MAP[cordA] || "";
        newB[i][j] = P2_ATTACK_MAP[cordB] || "";
      }
    }
  }

  if (typeof setGridA === 'function') setGridA(newA);
  if (typeof setGridB === 'function') setGridB(newB);

  // return the built grids in case caller wants them synchronously
  return { gridA: newA, gridB: newB };
}
//#endregion

//#region player actionhandlers
function PlaceShip(cell, row, col, gridId, onUpdate) {
  const cord = cell.id;
  console.log("place ship not implemented"); // handle placing ship logic
  
  SaveMapData(cord);
}

function MoveShip(cell, row, col, gridId, onUpdate) {
  const cord = cell.id;
  console.log("move ship not implemented"); // handle moving ship logic

  SavemapData(cord);
}

function Attack(cell, row, col, gridId, onUpdate) {
  const cord = cell.id;
  console.log("attacking not implemented"); // handle attacking logic

  SaveMapData(cord);
}
//#endregion

//#region game functions
function InitGame() {
  CreateAllMaps();
  LoadAllMapData();
}

function EndTurn() {
  // save the current game state before ending the turn
  SaveAllMapData();

  // switch player turn
  PLAYER_TURN = (PLAYER_TURN === 1) ? 2 : 1;

  // load the game state for the new player
  LoadAllMapData();
}

function SetBackgroundOfCell(cellValue){
  if (cellValue == "ship") return "green";
  else if (cellValue == "hit") return "red";
  else if (cellValue == "miss") return "white";
  else return "transparent";
}
//#endregion

//#region test functions

function changeRandomCells(setGridA, setGridB) {
  let randomGrid = Math.random() < 0.5 ? "a" : "b";
  let random100 = Math.floor(Math.random() * 100);
  let random3 = Math.floor(Math.random() * 3);
  
  let randomValue = "";
  if (random3 == 0) randomValue = "ship";
  else if (random3 == 1) randomValue = "hit";
  else randomValue = "miss";
  
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
    console.log(`changed cell ${cellId} to value ${randomValue}`);
  }
  console.log(`changed ${random100} cells in grid ${randomGrid} to value ${randomValue}`);
  LoadAllMapData(setGridA, setGridB);
}

function ResetMaps(setGridA, setGridB) {
  P1_ATTACK_MAP = {};
  P1_SHIP_MAP = {};
  P2_ATTACK_MAP = {};
  P2_SHIP_MAP = {};
  LoadAllMapData(setGridA, setGridB);
}

function AddTestingButtons({ setGridA, setGridB }) {
  return (
    <div >
      <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={() => changeRandomCells(setGridA, setGridB)}>
        Change Random Cells
      </button>
      <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => ResetMaps(setGridA, setGridB)}>
        Reset Maps
      </button>
    </div>
  )
}

//#endregion

export default App