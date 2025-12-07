// to do list
/*
- implement the logic for placing ships on the grid
- implement the logic for moving ships on the grid
- implement the logic for attacking the opponent's grid
- implement the logic for ending a turn and switching players
*/

// where i left off
/*
displayshipslist > ShipForList > onShipListClick
*/

import { useState, useEffect, createContext, useContext } from 'react';

// create a context to avoid prop drilling for grids and styles
const GameContext = createContext(null);

// global variables in lowercase with underscores to make them easily identifiable
let PLAYER_ACTION = "attacking"; // possible values: "placing_ship" "moving_ship" "attacking"
let PLAYER_TURN = 1; // 1 or 2

let P1_SHIP_DATA = {}; //dictionary of ship placements for player 1, keyed by cell id (e.g. "a-0-0")
let P1_ATTACK_DATA = {}; // dictionary of attack history for player 1, keyed by cell id (e.g. "b-0-0")
let P1_SHIP_LIST = {}; // dictionary of ships for player 1
// example {ship1 : [cord1, cord2, cord3]}, {ship2 : [cord1, cord2, cord3]}, etc.

let P2_SHIP_DATA = {}; 
let P2_ATTACK_DATA = {};
let P2_SHIP_LIST = {};

function App() {
  const [gridA, setGridA] = useState(CreateBlankGridDict("a"));
  const [gridB, setGridB] = useState(CreateBlankGridDict("b"));

  useEffect(() => {
    LoadMapData(setGridA, setGridB);
  }, []);

  let className = " bg-black text-white mx-2 border-2 border-gray-500 p-2 m-4";
  let cellStyle = "flex items-center justify-center hover:cursor-pointer";

  return (
    <GameContext.Provider value={{ gridA, setGridA, gridB, setGridB, gridStyle: className, cellStyle }}>
    <div id="app_container" className = "flex flex-col h-screen max-h-screen">
        <div id = "info_bar" className = "flex flex-row justify-between bg-gray-300 p-4">
          <div id = "turn_info" className = "flex-6/12">Player{PLAYER_TURN}'s Turn!</div>
          <div id = "timer_info" className = "flex-6/12">Game Time:0    Round Time:0</div>
        </div>

        {(PLAYER_ACTION == "placing_ship") 
        ?  <GameStart /> 
        :  <GamePlay />}

        <div id = "base_bar" className = "flex flex-row justify-left bg-gray-300 p-4">
          <div id = "powerup_area" className = "bg-yellow-400 flex-5/12"> power ups</div>
          <div id = "status_area" className = "bg-green-400 flex-5/12">
            <AddTestingButtons/>
          </div>
        </div>
      </div>
      </GameContext.Provider>
  )
  
}

function GameStart() {
  const { gridA, setGridA, gridStyle, cellStyle } = useContext(GameContext);
  const fleet = {
  "patrol": {
    "id": "patrol",
    "name": "Patrol Boat",
    "amount": 2,
    "length": 2
  },
  "submarine": {
    "id": "submarine",
    "name": "Submarine",
    "amount": 2,
    "length": 3
  },
  "destroyer": {
    "id": "destroyer",
    "name": "Destroyer",
    "amount": 2,
    "length": 3
  },
  "battleship": {
    "id": "battleship",
    "name": "Battleship",
    "amount": 1,
    "length": 4
  },
  "carrier": {
    "id": "carrier",
    "name": "Carrier",
    "amount": 1,
    "length": 5
  }
};

  const [currentShip, setCurrentShip] = useState("patrol");
  const [direction, setDirection] = useState("up");

  return (
    <div id="game_board" className = "flex flex-row flex-1 bg-gray-700 justify-center">

      <div id = "fleet_list" className = {`${gridStyle}`}>
        <DisplayShipList 
          fleet={fleet}
          currentShip={currentShip}
          setCurrentShip={setCurrentShip}
          direction={direction}
          setDirection={setDirection}
        />
      </div>

      <div id = "ship_grid" className = {`${gridStyle} aspect-square`}> 
        <CreateDisplayGrid 
          gridId="a" 
          cellStyle={cellStyle}
          />
      </div>
      
    </div>
  )

}

function GamePlay() {
  const { gridStyle, cellStyle } = useContext(GameContext);
  let className = "aspect-square flex-1 flex flex-col";
  let gs = `${gridStyle} ${className}`;

  let cs = `${cellStyle} hover:border hover:border-orange-500`;

  return (
    <div id="game_board" className = "flex flex-row flex-1 bg-gray-700">
      <div id = "ship_grid" className = {gs}> 
        <CreateDisplayGrid
          gridId="a" 
          cellStyle={cs}
        />
      </div>
      <div id = "attack_grid" className = {gs}>
        <CreateDisplayGrid 
          gridId="b" 
          cellStyle={cs}
        />
      </div>
    </div>
    )
}

function DisplayShipList({fleet, currentShip, setCurrentShip, direction, setDirection}){
  return Object.keys(fleet).map(key => (
    <ShipForList key={`shipList_${fleet[key].name}`} ship={fleet[key]} currentShip={currentShip} setCurrentShip={setCurrentShip} />
  ));
}

function ShipForList({ship, currentShip, setCurrentShip}){
  const { gridA, setGridA } = useContext(GameContext);
  
  let name = ship["name"];
  let shipkey = ship["id"];
  let length = ship["length"];
  let amount = ship["amount"];
  
  const onShipListClick = () => {
    setCurrentShip(shipkey);
    console.log(`selected ${shipkey}`);
  };
  
  return(
    <div
      id = {`shipList_${name}`} 
      key = {`shipList_${name}`} 
      className = "hover:cursor-pointer border border-black hover:border-orange-600 pb-1 mb-4"
      onClick={onShipListClick}
    >
      <p className = "bg-gray-700 text-white px-1">{name + "s"}</p>
      <p>Length: {length}</p>
      <p>Remaining: {amount}</p>
    </div>
  )
}

function Cell({ gridID, row, col, value, cellStyle}) {
  const cellId = `${gridID}-${row}-${col}`;

  const { setGridA, setGridB } = useContext(GameContext);

  return (
    <div 
      id={cellId} 
      key={cellId}
      className={cellStyle} 
      style={{ backgroundColor: SetBackgroundOfCell(value) }}
      onClick={(event) => handleCellClick(event, cellId, setGridA, setGridB)}
    >
    {/* cell contents */}
    {value}
    </div>
  );
}

function CreateDisplayGrid({ gridId, cellStyle, rows = 10, cols = 10 }) {
    // function to handle when a cell is clicked and update it with a new value
    const handleCellUpdate = (row, col, newValue) => {
      const { gridA, gridB, setGridA, setGridB } = useContext(GameContext);
      const grid = gridId === 'a' ? gridA : gridB;
      const setGrid = gridId === 'a' ? setGridA : setGridB;

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
    const { gridA, gridB } = useContext(GameContext);
    let gridData = gridId === 'a' ? gridA : gridB;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let cellId = `${gridId}-${row}-${col}`;
        const cellValue = (gridData && gridData[row] && gridData[row][col]) ? gridData[row][col] : "";
        cells.push(
          <Cell 
            key={cellId} 
            gridID={gridId} 
            row={row} 
            col={col}
            value={cellValue}
            cellStyle={cellStyle}
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

function handleCellClick(event, cellId, setGridA, setGridB) {
  if (PLAYER_ACTION === "moving_ship") MoveShip(event, cellId, setGridA, setGridB);
  else if (PLAYER_ACTION === "attacking") Attack(event, cellId, setGridA, setGridB);
}

function CreateBlankGridDict(gridId) {
  let rows = 10; 
  let cols = 10;
  let gridDict = [];

  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < cols; y++) {
      gridDict[`${gridId}-${x}-${y}`] = "";
    }
  }
  return gridDict;
}

function LoadMapData(setGridA, setGridB) {
  const rows = 10;
  const cols = 10;
  const newGridA = [];
  const newGridB = [];
  for (let x = 0; x < rows; x++) {
    newGridA[x] = [];
    newGridB[x] = [];
    for (let y = 0; y < cols; y++) {
      const cordA = `a-${x}-${y}`;
      const cordB = `b-${x}-${y}`;
      if (PLAYER_TURN === 1) {
        newGridA[x][y] = P1_SHIP_DATA[cordA] || "";
        newGridB[x][y] = P1_ATTACK_DATA[cordB] || "";
      } else {
        newGridA[x][y] = P2_SHIP_DATA[cordA] || "";
        newGridB[x][y] = P2_ATTACK_DATA[cordB] || "";
      }
    }
  }

  setGridA(newGridA);
  setGridB(newGridB);
}

function IdentifyShipFromCell(cellId) {
  const shipList = (PLAYER_TURN === 1) ? P1_SHIP_DATA : P2_SHIP_DATA;
  
  for (const shipName in shipList) {
    if (shipList[shipName].includes(cellId)) {
      return shipList[shipName];// return the list of coordinates for this ship
    }
  }
  
  return null; // no ship found at this cell
}

function SaveShipToList(shipCells){
  const shipList = (PLAYER_TURN === 1) ? P1_SHIP_DATA : P2_SHIP_DATA;
  const shipName = `ship${shipList.length + 1}`; // simple way to generate a new ship name
  shipList[shipName] = shipCells; // save the ship's coordinates to the list
}

function PlaceShip() {
}

function MoveShip(event, cellId, setGridA, setGridB) {
  console.log("move ship not implemented", cellId); // handle moving ship logic
  LoadMapData(setGridA, setGridB);
}

function Attack(event, cellId, setGridA, setGridB) {
  let grid = cellId[0];
  let yourGrid;
  let oppGrid;
  if (grid === "b"){
    if (PLAYER_TURN === 1) {
      yourGrid = P1_ATTACK_DATA;
      oppGrid = P2_SHIP_DATA;
    }
    else{
      yourGrid = P2_ATTACK_DATA;
      oppGrid = P1_SHIP_DATA;
    }

    if (oppGrid[cellId] === "ship"){
      oppGrid[cellId] = "hit";
      yourGrid[cellId] = "hit";
    }
    else if (!oppGrid[cellId]){
      oppGrid[cellId] = "miss";
      yourGrid[cellId] = "miss";
    }
    console.log(`Attacking: ${cellId} | status: ${oppGrid[cellId]}`);
    LoadMapData(setGridA, setGridB);
  }
  else console.log("cannot attack own fleet");
}

function EndTurn() {
  //SaveAllMapData();

  // switch player turn
  PLAYER_TURN = (PLAYER_TURN === 1) ? 2 : 1;

  // load the game state for the new player
  LoadMapData();
}

function SetBackgroundOfCell(cellValue){
  if (cellValue == "ship") return "green";
  else if (cellValue == "hit") return "red";
  else if (cellValue == "miss") return "white";
  else return "transparent";
}

function ChooseGrid(){
  if (PLAYER_ACTION == "placing_ship") {
    return (PLAYER_TURN === 1) ? P1_SHIP_DATA : P2_SHIP_DATA;
  }
  else if (PLAYER_ACTION == "attacking") {
    return (PLAYER_TURN === 1) ? P1_ATTACK_DATA : P2_ATTACK_DATA;
  }
  else if (PLAYER_ACTION == "moving_ship") {
    return (PLAYER_TURN === 1) ? P1_SHIP_DATA : P2_SHIP_DATA;
  }
}

function TESTchangeRandomCells(setGridA, setGridB) {
  let random100 = Math.floor(Math.random() * 30);
  
  for (let i = 0; i < random100; i++) {
    let randomRow = Math.floor(Math.random() * 10);
    let randomCol = Math.floor(Math.random() * 10);

    let grid = "a";
    let cellId = `${grid}-${randomRow}-${randomCol}`;
    P1_SHIP_DATA[cellId] = "ship";
    P2_ATTACK_DATA[cellId] = "ship";

    grid = "b";
    cellId = `${grid}-${randomRow}-${randomCol}`;
    P2_SHIP_DATA[cellId] = "ship";

    console.log(`changed cell ${cellId}`);
  }
  console.log(`changed ${random100} cells`);
  LoadMapData(setGridA, setGridB);
}

function TESTResetMaps(setGridA, setGridB) {
  P1_ATTACK_DATA = {};
  P1_SHIP_DATA = {};
  P2_ATTACK_DATA = {};
  P2_SHIP_DATA = {};
  LoadMapData(setGridA, setGridB);
}

function AddTestingButtons() {
  const { setGridA, setGridB } = useContext(GameContext);
  return (
    <div >
      <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={() => TESTchangeRandomCells(setGridA, setGridB)}>
        Change Random Cells
      </button>
      <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => TESTResetMaps(setGridA, setGridB)}>
        Reset Maps
      </button>
    </div>
  )
}

export default App