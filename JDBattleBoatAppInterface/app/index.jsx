/**
 * Battleship Game Component
 * 
 * A React Native battleship game interface with ship deployment and attack mechanics.
 * Features responsive grid sizing, ship placement validation, and turn-based gameplay.
 * 
 * @component
 * @returns {React.ReactElement} The main game interface with two grids (My Ships and Opponent's Grid)
 * 
 * @state {string} gameState - Current game phase: "setup", "deploy", or "playing"
 * @state {Object} myShips - Ships placed by player, keyed by ship name (ship1-ship4)
 * @state {Object} myAttacks - Attack results on opponent's grid, keyed by coordinate
 * @state {string} deployMode - Current ship being deployed (ship1, ship2, ship3, ship4)
 * @state {string[]} selectedCells - Currently selected cells for ship placement (format: "x:y")
 * @state {string} message - User-facing message for current game state
 * @state {Object} sizes - Responsive cell dimensions based on screen orientation
 * 
 * @function validateShipPlacement - Validates that selected cells form a valid ship
 * @function handleCellPress - Handles user interaction with grid cells
 * @function deployShip - Places current ship and advances to next deployment phase
 * @function startGame - Initiates ship deployment phase
 * @function resetGame - Resets all game state to initial setup
 */
import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GRID_SIZE = 10;
const ALPHABET = "ABCDEFGHIJ";

// Get responsive cell size based on screen dimensions
const getResponsiveSizes = () => {
  const { width, height } = Dimensions.get("window");
  const isPortrait = height > width;
  
  if (isPortrait) {
    // Portrait mode - smaller cells to fit on screen
    return { cellSize: 20, padding: 8 };
  } else {
    // Landscape mode - larger cells
    return { cellSize: 30, padding: 10 };
  }
};

const initialSizes = getResponsiveSizes();

export default function Index() {
  const [gameState, setGameState] = React.useState("menu"); // menu, deploy, playing
  const [aiDifficulty, setAiDifficulty] = React.useState(null); // null, "easy", "medium", "hard"
  const [myShips, setMyShips] = React.useState({});
  const [myAttacks, setMyAttacks] = React.useState({});
  const [deployMode, setDeployMode] = React.useState("ship1"); // which ship being deployed
  const [selectedStartCell, setSelectedStartCell] = React.useState(null);
  const [selectedDirection, setSelectedDirection] = React.useState("right");
  const [selectedLength, setSelectedLength] = React.useState(3);
  const [previewCells, setPreviewCells] = React.useState([]);
  const [previewValid, setPreviewValid] = React.useState(true);
  const [message, setMessage] = React.useState("Select AI difficulty to start");
  const [sizes, setSizes] = React.useState(initialSizes);

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setSizes(getResponsiveSizes());
    });

    return () => subscription?.remove?.();
  }, []);

  const generateShipCells = (startX, startY, direction, length) => {
    const cells = [];
    for (let i = 0; i < length; i++) {
      let x = startX;
      let y = startY;

      switch (direction) {
        case "up":
          y = startY - i;
          break;
        case "down":
          y = startY + i;
          break;
        case "left":
          x = startX - i;
          break;
        case "right":
          x = startX + i;
          break;
      }

      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
        return { cells: [], valid: false };
      }

      cells.push(`${x}:${y}`);
    }

    // Check for overlaps with existing ships
    const hasOverlap = cells.some(cell => {
      return Object.values(myShips).some(ship => ship.includes(cell));
    });

    return { cells, valid: !hasOverlap };
  };

  const updatePreview = (startX, startY, direction, length) => {
    if (startX !== null && startY !== null) {
      const { cells, valid } = generateShipCells(startX, startY, direction, length);
      setPreviewCells(cells);
      setPreviewValid(valid);
      setMessage(valid ? `Preview: ${length} cells ${direction}` : "Invalid placement - overlaps or out of bounds");
    }
  };

  const handleCellPress = (x, y) => {
    const cordKey = `${x}:${y}`;

    if (gameState === "deploy") {
      // Handle ship deployment - select start position
      setSelectedStartCell(cordKey);
      updatePreview(x, y, selectedDirection, selectedLength);
    } else if (gameState === "playing") {
      // Handle attack
      if (!myAttacks[cordKey]) {
        const result = Math.random() > 0.5 ? "hit" : "miss";
        setMyAttacks({ ...myAttacks, [cordKey]: result });
        setMessage(`Attack on ${ALPHABET[x]}${y + 1}: ${result.toUpperCase()}`);
      }
    }
  };

  const handleDirectionChange = (direction) => {
    setSelectedDirection(direction);
    if (selectedStartCell) {
      const [x, y] = selectedStartCell.split(":").map(Number);
      updatePreview(x, y, direction, selectedLength);
    }
  };

  const handleLengthChange = (length) => {
    setSelectedLength(length);
    if (selectedStartCell) {
      const [x, y] = selectedStartCell.split(":").map(Number);
      updatePreview(x, y, selectedDirection, length);
    }
  };

  const deployShip = () => {
    if (!selectedStartCell || previewCells.length === 0 || !previewValid) {
      setMessage("Select a valid start position and ensure ship placement is valid");
      return;
    }

    setMyShips({
      ...myShips,
      [deployMode]: previewCells,
    });

    // Reset selection
    setSelectedStartCell(null);
    setPreviewCells([]);
    
    const nextShip = deployMode === "ship1" ? "ship2" : deployMode === "ship2" ? "ship3" : "ship4";
    const shipCount = Object.keys(myShips).length + 1;
    
    if (shipCount === 5) {
      setGameState("playing");
      setMessage("Game started! Attack opponent's grid");
    } else {
      setDeployMode(nextShip);
      setMessage(`Place ${nextShip} (select start position)`);
    }
  };

  const selectAiDifficulty = (difficulty) => {
    setAiDifficulty(difficulty);
    setMessage(`Selected ${difficulty} difficulty. Click Start Game to begin.`);
  };

  const startGame = () => {
    if (!aiDifficulty) {
      setMessage("Please select AI difficulty first");
      return;
    }

    // Map string difficulty to numeric value for backend
    const difficultyMap = {
      "easy": 1,
      "medium": 2,
      "hard": 3
    };
    const numericDifficulty = difficultyMap[aiDifficulty];

    // TODO: Connect to LocalCommand.js backend
    // createInstance(numericDifficulty) should be called here
    // For now, just start the game locally
    console.log(`Starting game with AI difficulty: ${aiDifficulty} (numeric: ${numericDifficulty})`);

    setGameState("deploy");
    setMessage("Deploy ship1 (select start position, direction, and length)");
  };

  const resetGame = () => {
    setGameState("menu");
    setAiDifficulty(null);
    setMyShips({});
    setMyAttacks({});
    setSelectedStartCell(null);
    setPreviewCells([]);
    setDeployMode("ship1");
    setMessage("Select AI difficulty to start");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Battleship Game</Text>
        <Text style={styles.message}>{message}</Text>

        {gameState === "menu" && (
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Select AI Difficulty</Text>
            <View style={styles.difficultyButtons}>
              <TouchableOpacity
                style={[styles.difficultyButton, aiDifficulty === "easy" && styles.difficultyButtonActive]}
                onPress={() => selectAiDifficulty("easy")}
              >
                <Text style={[styles.difficultyButtonText, aiDifficulty === "easy" && styles.difficultyButtonTextActive]}>
                  Easy
                </Text>
                <Text style={styles.difficultyDescription}>
                  Random targeting
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.difficultyButton, aiDifficulty === "medium" && styles.difficultyButtonActive]}
                onPress={() => selectAiDifficulty("medium")}
              >
                <Text style={[styles.difficultyButtonText, aiDifficulty === "medium" && styles.difficultyButtonTextActive]}>
                  Medium
                </Text>
                <Text style={styles.difficultyDescription}>
                  Pattern-based targeting
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.difficultyButton, aiDifficulty === "hard" && styles.difficultyButtonActive]}
                onPress={() => selectAiDifficulty("hard")}
              >
                <Text style={[styles.difficultyButtonText, aiDifficulty === "hard" && styles.difficultyButtonTextActive]}>
                  Hard
                </Text>
                <Text style={styles.difficultyDescription}>
                  Intelligent hunting
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {gameState !== "menu" && (
          <View style={styles.gridsContainer}>
            {/* Opponent Grid (only show when not deploying ships) */}
            {gameState !== "deploy" && (
              <View style={styles.gridSection}>
                <Text style={styles.gridTitle}>Opponent's Grid</Text>
                <Grid
                  gridSize={GRID_SIZE}
                  cellSize={sizes.cellSize}
                  onCellPress={handleCellPress}
                  attackData={myAttacks}
                  isAttackGrid={gameState === "playing"}
                />
              </View>
            )}

            {/* My Ships Grid */}
            <View style={styles.gridSection}>
              <Text style={styles.gridTitle}>My Ships</Text>
              <Grid
                gridSize={GRID_SIZE}
                cellSize={sizes.cellSize}
                onCellPress={handleCellPress}
                shipData={myShips}
                selectedCells={gameState === "deploy" ? previewCells : []}
                previewCells={previewCells}
                startCell={selectedStartCell}
                previewValid={previewValid}
                isDeployMode={gameState === "deploy"}
              />
            </View>
          </View>
        )}

        {gameState === "deploy" && (
          <View style={styles.controlsContainer}>
            <Text style={styles.controlsTitle}>Ship Controls</Text>
            
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Direction:</Text>
              <View style={styles.buttonGroup}>
                {["up", "down", "left", "right"].map((dir) => (
                  <TouchableOpacity
                    key={dir}
                    style={[styles.controlButton, selectedDirection === dir && styles.controlButtonActive]}
                    onPress={() => handleDirectionChange(dir)}
                  >
                    <Text style={[styles.controlButtonText, selectedDirection === dir && styles.controlButtonTextActive]}>
                      {dir.charAt(0).toUpperCase() + dir.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Length:</Text>
              <View style={styles.buttonGroup}>
                {[2, 3, 4, 5].map((len) => (
                  <TouchableOpacity
                    key={len}
                    style={[styles.controlButton, selectedLength === len && styles.controlButtonActive]}
                    onPress={() => handleLengthChange(len)}
                  >
                    <Text style={[styles.controlButtonText, selectedLength === len && styles.controlButtonTextActive]}>
                      {len}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {gameState === "menu" && aiDifficulty && (
            <TouchableOpacity style={styles.button} onPress={startGame}>
              <Text style={styles.buttonText}>Start Game</Text>
            </TouchableOpacity>
          )}
          {gameState === "deploy" && (
            <TouchableOpacity style={styles.button} onPress={deployShip}>
              <Text style={styles.buttonText}>Deploy Ship</Text>
            </TouchableOpacity>
          )}
          {(gameState === "deploy" || gameState === "playing") && (
            <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetGame}>
              <Text style={styles.buttonText}>New Game</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Grid({
  gridSize,
  cellSize,
  onCellPress,
  shipData = {},
  attackData = {},
  selectedCells = [],
  previewCells = [],
  startCell = null,
  previewValid = true,
  isDeployMode = false,
  isAttackGrid = false,
}) {
  const getGridRows = () => {
    let rows = [];
    
    // Header with letters
    let headerRow = [];
    headerRow.push(
      <View key="corner" style={{ width: cellSize, height: cellSize }} />
    );
    for (let i = 0; i < gridSize; i++) {
      headerRow.push(
        <View
          key={`header-${i}`}
          style={[styles.headerCell, { width: cellSize, height: cellSize }]}
        >
          <Text style={styles.coordinate}>{ALPHABET[i]}</Text>
        </View>
      );
    }
    rows.push(
      <View key="header" style={{ flexDirection: "row" }}>
        {headerRow}
      </View>
    );

    // Grid cells with row numbers
    for (let y = 0; y < gridSize; y++) {
      let row = [];
      row.push(
        <View
          key={`row-${y}`}
          style={[styles.headerCell, { width: cellSize, height: cellSize }]}
        >
          <Text style={styles.coordinate}>{y + 1}</Text>
        </View>
      );

      for (let x = 0; x < gridSize; x++) {
        const cordKey = `${x}:${y}`;
        const isSelected = selectedCells.includes(cordKey);
        const isPreview = previewCells.includes(cordKey);
        const isStartCell = cordKey === startCell;
        const hasShip = Object.values(shipData).some(
          (ship) => ship && ship.includes(cordKey)
        );
        const attackStatus = attackData[cordKey];

        let cellStyle = [
          styles.cell,
          { width: cellSize, height: cellSize },
        ];

        if (isStartCell) {
          cellStyle.push(styles.startCell);
        } else if (isPreview) {
          cellStyle.push(previewValid ? styles.previewCell : styles.invalidPreviewCell);
        } else if (isSelected) {
          cellStyle.push(styles.selectedCell);
        } else if (hasShip && !isAttackGrid) {
          cellStyle.push(styles.shipCell);
        } else if (attackStatus === "hit") {
          cellStyle.push(styles.hitCell);
        } else if (attackStatus === "miss") {
          cellStyle.push(styles.missCell);
        }

        row.push(
          <TouchableOpacity
            key={cordKey}
            style={cellStyle}
            onPress={() => onCellPress(x, y)}
            disabled={isAttackGrid && attackStatus}
          >
            <Text style={styles.cellText}>
              {isStartCell ? "S" : attackStatus === "hit" ? "H" : attackStatus === "miss" ? "M" : ""}
            </Text>
          </TouchableOpacity>
        );
      }

      rows.push(
        <View key={`row-${y}-full`} style={{ flexDirection: "row" }}>
          {row}
        </View>
      );
    }

    return rows;
  };

  return <View style={styles.grid}>{getGridRows()}</View>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    padding: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
    color: "#666",
    textAlign: "center",
  },
  gridsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    gap: 10,
    flexWrap: "wrap",
  },
  gridSection: {
    alignItems: "center",
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  grid: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#333",
    padding: 5,
  },
  cell: {
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e8f4f8",
    margin: 1,
  },
  startCell: {
    backgroundColor: "#ff9800",
  },
  previewCell: {
    backgroundColor: "#fff176",
  },
  invalidPreviewCell: {
    backgroundColor: "#ef5350",
  },
  shipCell: {
    backgroundColor: "#90caf9",
  },
  hitCell: {
    backgroundColor: "#ef5350",
  },
  missCell: {
    backgroundColor: "#a5d6a7",
  },
  headerCell: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    margin: 1,
  },
  coordinate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  cellText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  controlsContainer: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    width: "100%",
    maxWidth: 400,
  },
  controlsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "space-between",
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    minWidth: 80,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 5,
  },
  controlButton: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: "center",
  },
  controlButtonActive: {
    backgroundColor: "#2196F3",
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  controlButtonTextActive: {
    color: "#fff",
  },
  startCellText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff9800",
    textAlign: "center",
    marginTop: 10,
  },
  menuContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 20,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  difficultyButtons: {
    width: "100%",
    gap: 12,
  },
  difficultyButton: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
  },
  difficultyButtonActive: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196F3",
  },
  difficultyButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  difficultyButtonTextActive: {
    color: "#2196F3",
  },
  difficultyDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  resetButton: {
    backgroundColor: "#f44336",
  },
});