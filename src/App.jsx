import { useState } from 'react'


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
          <CreateGrid value = "ship_grid"/>
        </div>
        <div id = "attack_grid" className = "flex-5/12 flex-col bg-black text-white mx-5">
          <CreateGrid value = "attack_grid"/>
        </div>
      </div>

      <div id = "base_bar" className = "flex flex-row justify-left bg-gray-300 p-4">
        <div id = "powerup_area" className = "bg-yellow-400 flex-5/12"> power ups</div>
        <div id = "status_area" className = "bg-green-400 flex-5/12"> status area</div>
      </div>
    </div>
  )
}

export default App

function CreateGrid(gridType) {
  const rows = 10;
  const cols = 10;
  let grid = [];

  for (let i = 0; i < rows; i++) {
    let row = [];
    for (let j = 0; j < cols; j++) {
      row.push(
        <div id={`cord-${i}-${j}`} className="w-full h-full border border-gray-500 flex items-center justify-center">
        {`${i}-${j}`}
        </div>
      );
    }
    grid.push(
      <div id= {"row-" + i}>
        {row}
      </div>
    );
  }

  return <div id = {gridType} className="grid grid-cols-10 grid-rows-10 w-full h-full">{grid}</div>;
}