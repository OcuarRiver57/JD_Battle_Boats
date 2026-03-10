/*
File Summary:
This screen handles pre-battle fleet placement for the player. It creates a game
instance, previews ship placement by direction and length, validates placement,
submits deploy actions, and routes to the battle screen once setup is complete.
*/

import { Pressable, Text, View, FlatList, Dimensions, TextInput, StyleSheet, Alert} from "react-native";
import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { createInstance } from "./../assets/scripts/localCommand.js";

// Coordinate converter utilities
// Converts UI grid IDs (row-col) to Battle coordinates (x:y).
const gridIdToCord = (id) => {
  // Converts "row-col" format to "x:y" format (where x=col, y=row for Battle.js)
  const [row, col] = id.split("-");
  return `${col}:${row}`; // Swap to col:row because Battle.js uses x:y where x=column, y=row
};

// Converts Battle coordinates (x:y or [x, y]) back to UI grid IDs (row-col).
const cordToGridId = (cord) => {
  // Converts "x:y" format (col:row) to "row-col" format for grid IDs
  if (typeof cord === "string") {
    const [col, row] = cord.split(":"); // Battle.js uses col:row
    return `${row}-${col}`; // Grid uses row-col
  }
  if (Array.isArray(cord)) {
    return `${cord[1]}-${cord[0]}`; // cord[0]=x=col, cord[1]=y=row, so swap for grid
  }
  return cord;
};

// Calculate ship coordinates from start position, direction, and length
// Builds a ship footprint in grid ID format from a start cell, direction, and length.
const shipCordsFromStartDirectionLength = (startGridId, direction, length) => {
  const [row, col] = startGridId.split("-").map(Number);
  let cells = [];
  
  for (let i = 0; i < length; i++) {
    let currentRow = row;
    let currentCol = col;
    
    if (direction === "up") {
      currentRow = row - i;
    } else if (direction === "down") {
      currentRow = row + i;
    } else if (direction === "left") {
      currentCol = col - i;
    } else if (direction === "right") {
      currentCol = col + i;
    }
    
    cells.push(`${currentRow}-${currentCol}`);
  }
  
  return cells;
};

// Validate ship placement
// Returns invalid cells when placement is out of bounds or overlapping existing ships.
const validateShipPlacement = (shipCells, placedShipCells, gridRows = 10, gridCols = 10) => {
  let invalidCells = [];
  
  for (const cellId of shipCells) {
    const [row, col] = cellId.split("-").map(Number);
    
    if (
      row < 0 || row >= gridRows ||
      col < 0 || col >= gridCols ||
      placedShipCells.includes(cellId)
    ) {
      invalidCells.push(cellId);
    }
  }
  
  return invalidCells;
};

// Fleet management screen component for placing all player ships before battle.
export default function Index() {
  const { ailevel } = useLocalSearchParams();
  const router = useRouter();
  const gameInstance = useMemo(() => createInstance(ailevel), [ailevel]);
  
  // Ship placement state
  const shipLengths = [2, 3, 4, 5];
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [shipDirection, setShipDirection] = useState("right");
  const [placedShips, setPlacedShips] = useState([]);
  const [previewCells, setPreviewCells] = useState([]);
  const [previewValid, setPreviewValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Calculate all currently placed ship cells
  const placedShipCells = placedShips.flat();
  
  const flatgridData = (size) => {
    let grid = [];
    for (let i = 0; i < size; i++)
      for (let j = 0; j < size; j++)
        grid.push({ id: `${i}-${j}`, row: i, col: j });
    return grid;
  };
  
  // Previews a ship placement at the tapped cell and updates validity state.
  const handleCellPress = (cellId) => {
    if (currentShipIndex >= shipLengths.length) return;
    
    const currentLength = shipLengths[currentShipIndex];
    const preview = shipCordsFromStartDirectionLength(cellId, shipDirection, currentLength);
    const invalid = validateShipPlacement(preview, placedShipCells);
    
    setPreviewCells(preview);
    setPreviewValid(invalid.length === 0);
    
    if (invalid.length > 0) {
      setErrorMessage("Invalid placement - out of bounds or overlapping!");
    } else {
      setErrorMessage("");
    }
  };
  
  // Commits the current preview to game state and advances to the next ship.
  const handleConfirmPlacement = () => {
    if (!previewValid || previewCells.length === 0) {
      Alert.alert("Invalid Placement", "Please select a valid location for your ship.");
      return;
    }
    
    // Convert preview cells to Battle.js format and deploy
    const startCell = previewCells[0];
    const startCord = gridIdToCord(startCell);
    const currentLength = shipLengths[currentShipIndex];
    
    // Call Battle.deployShip via action method
    const playerId = gameInstance.player1Id;
    const result = gameInstance.action(playerId, "deploy", [startCord, shipDirection, currentLength]);
    
    if (result && result.actionData && result.actionData.length > 0) {
      // Successfully placed ship
      setPlacedShips([...placedShips, previewCells]);
      setCurrentShipIndex(currentShipIndex + 1);
      setPreviewCells([]);
      setErrorMessage("");
    } else {
      Alert.alert("Placement Failed", "Unable to place ship. Please try again.");
    }
  };
  
  // Clears all placed ships and resets local and game placement state.
  const handleResetFleet = () => {
    Alert.alert(
      "Reset Fleet",
      "Are you sure you want to reset all ship placements?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setPlacedShips([]);
            setCurrentShipIndex(0);
            setPreviewCells([]);
            setErrorMessage("");
            // Reset the game instance
            gameInstance.p1ShipData = {};
            gameInstance.p1ShipList = {};
          }
        }
      ]
    );
  };
  
  // Routes to the battle screen once all ships are placed.
  const handleStartGame = () => {
    router.push({
      pathname: "/BattleScreen",
      params: { gameInstanceId: gameInstance.gameId }
    });
  };
  
  // Rotates placement direction and recalculates preview validity.
  const toggleDirection = () => {
    const directions = ["right", "down", "left", "up"];
    const currentIndex = directions.indexOf(shipDirection);
    const nextIndex = (currentIndex + 1) % directions.length;
    setShipDirection(directions[nextIndex]);
    
    // Update preview if exists
    if (previewCells.length > 0) {
      const startCell = previewCells[0];
      const currentLength = shipLengths[currentShipIndex];
      const preview = shipCordsFromStartDirectionLength(startCell, directions[nextIndex], currentLength);
      const invalid = validateShipPlacement(preview, placedShipCells);
      
      setPreviewCells(preview);
      setPreviewValid(invalid.length === 0);
      
      if (invalid.length > 0) {
        setErrorMessage("Invalid placement - out of bounds or overlapping!");
      } else {
        setErrorMessage("");
      }
    }
  };
  
  const allShipsPlaced = currentShipIndex >= shipLengths.length;

  return (
    <SafeAreaView style={{ flex: 1, padding: 10 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Place Your Fleet</Text>
        {!allShipsPlaced && (
          <Text style={styles.shipInfo}>
            Ship {currentShipIndex + 1} of {shipLengths.length} - Length: {shipLengths[currentShipIndex]}
          </Text>
        )}
        {allShipsPlaced && (
          <Text style={styles.completeText}>All ships placed! Ready to start battle.</Text>
        )}
      </View>
      
      {errorMessage !== "" && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
      
      <View style={styles.controlsContainer}>
        {!allShipsPlaced && (
          <>
            <Pressable 
              style={styles.directionButton}
              onPress={toggleDirection}
            >
              <Text style={styles.buttonText}>Direction: {shipDirection.toUpperCase()}</Text>
            </Pressable>
            
            <Pressable 
              style={[styles.confirmButton, !previewValid && styles.buttonDisabled]}
              onPress={handleConfirmPlacement}
              disabled={!previewValid || previewCells.length === 0}
            >
              <Text style={styles.buttonText}>Confirm Placement</Text>
            </Pressable>
          </>
        )}
        
        <Pressable 
          style={styles.resetButton}
          onPress={handleResetFleet}
        >
          <Text style={styles.buttonText}>Reset Fleet</Text>
        </Pressable>
        
        {allShipsPlaced && (
          <Pressable 
            style={styles.startButton}
            onPress={handleStartGame}
          >
            <Text style={styles.buttonText}>Start Battle</Text>
          </Pressable>
        )}
      </View>
      
      <FlatGrid 
        data={flatgridData(10)}
        onCellPress={handleCellPress}
        placedShipCells={placedShipCells}
        previewCells={previewCells}
        previewValid={previewValid}
        disabled={allShipsPlaced}
      />
      
      <FleetList fleet={gameInstance?.p1ShipList} />
    </SafeAreaView>
  );
}

// Single grid cell component with colors for placed and preview states.
function GridSquare({ clickhandler, squareId, size, isPlaced, isPreview, isPreviewValid }) {
  let backgroundColor = "lightblue"; // Empty cell
  
  if (isPlaced) {
    backgroundColor = "#4a90e2"; // Placed ship (blue)
  } else if (isPreview) {
    backgroundColor = isPreviewValid ? "#ffd700" : "#ff6b6b"; // Yellow for valid, red for invalid
  }
  
  return (
    <Pressable
      onPress={() => clickhandler && clickhandler(squareId)}
      style={{ margin: 0, padding: 0 }}
      disabled={!clickhandler}
    >
      <View
        style={{
          width: size,
          height: size,
          backgroundColor: backgroundColor,
          borderWidth: 0.5,
          borderColor: "#333",
        }}
      />
    </Pressable>
  );
}

// Reusable 10x10 board renderer for placement interactions.
function FlatGrid({ data, onCellPress, placedShipCells = [], previewCells = [], previewValid = true, disabled = false }) {
  // size based on screen width / columns
  const [gridSize, setGridSize] = useState(10);
  const windowWidth = Dimensions.get("window").width;
  const cellSize = Math.floor(windowWidth / gridSize) - 1;

  const clickhandler = disabled ? null : (id) => {
    onCellPress && onCellPress(id);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={data}
        key={`gridSize:${gridSize}`}
        numColumns={gridSize}
        columnWrapperStyle={{ justifyContent: 'flex-start', margin: 0, padding: 0 }}
        ItemSeparatorComponent={null}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ alignItems: "center" }}
        renderItem={({ item }) => (
          <GridSquare
            clickhandler={clickhandler}
            squareId={item.id}
            size={cellSize}
            isPlaced={placedShipCells.includes(item.id)}
            isPreview={previewCells.includes(item.id)}
            isPreviewValid={previewValid}
          />
        )}
      />
    </SafeAreaView>
  );
}

// Displays the player's currently placed ships in a compact list preview.
function FleetList({fleet = {}}) {
  let ships = [];
  for(let ship in fleet) {
    let shipSquares = [];
    for(let i = 0; i < fleet[ship].length; i++) {
      const battleCord = String(fleet[ship][i]); // Battle.js format "col:row" or "x:y"
      const gridId = cordToGridId(battleCord); // Convert to grid format "row-col"
      shipSquares.push(<GridSquare key={`${ship}-${i}`} squareId={gridId} size={20} isPlaced={true}/>);
    }
    ships.push(<View key={ship}>
      <Text>{ship}</Text>
      <View style={{flexDirection: "row"}}>
        {shipSquares}
      </View>
    </View>);
  }
  return (
    <View style={styles.fleetListContainer}>
      <Text style={styles.fleetListTitle}>Your Fleet:</Text>
      {ships}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  shipInfo: {
    fontSize: 16,
    color: "#333",
  },
  completeText: {
    fontSize: 18,
    color: "#28a745",
    fontWeight: "bold",
  },
  errorContainer: {
    backgroundColor: "#ff6b6b",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  errorText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  controlsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10,
    gap: 10,
  },
  directionButton: {
    backgroundColor: "#6c757d",
    padding: 10,
    borderRadius: 5,
    minWidth: 120,
  },
  confirmButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
    minWidth: 120,
  },
  resetButton: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 5,
    minWidth: 120,
  },
  startButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    minWidth: 120,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  fleetListContainer: {
    padding: 10,
    backgroundColor: "#f8f9fa",
    marginTop: 10,
  },
  fleetListTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
});