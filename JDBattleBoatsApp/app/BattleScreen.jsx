/*
File Summary:
This screen runs the live battle phase between the player and AI. It initializes
board state, handles player attacks, triggers AI turns, tracks win conditions,
and renders both fleet and attack grids with turn/status UI.
*/

import { Pressable, Text, View, FlatList, Dimensions, StyleSheet, Modal, Alert, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { getInstance, getAIInstance } from "./../assets/scripts/localCommand.js";
import { useLocalSearchParams, useRouter } from "expo-router";

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

// Main battle screen component for game loop control and battle rendering.
export default function Index() {
  const { gameInstanceId } = useLocalSearchParams();
  const router = useRouter();
  const gameInstance = getInstance(gameInstanceId);
  const aiInstance = getAIInstance(gameInstanceId);

  console.log(`[BattleScreen] Initializing - GameID: ${gameInstanceId}, GameInstance exists: ${!!gameInstance}, AIInstance exists: ${!!aiInstance}`);
  if (aiInstance) {
    console.log(`[BattleScreen] AI Instance details - shipsPlaced: ${aiInstance.shipsPlaced}, keys: ${Object.keys(aiInstance)}`);
  }

  const [playerShipData, setPlayerShipData] = useState({});
  const [playerAttackData, setPlayerAttackData] = useState({});
  const [aiShipData, setAiShipData] = useState({});
  const [currentTurn, setCurrentTurn] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(0);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [lastAttackResult, setLastAttackResult] = useState("");
  const isPlayerTurn = Number(currentTurn) === 1;

  // Initialize game state and ensure AI ships are placed
  useEffect(() => {
    if (!gameInstance) {
      Alert.alert("Error", "Game instance not found. Returning to home.");
      router.push("/");
      return;
    }

    // Initialize player data
    setPlayerShipData({ ...gameInstance.p1ShipData });
    setPlayerAttackData({ ...gameInstance.p1AttackData });
    setCurrentTurn(Number(gameInstance.playerTurn));

    // Ensure AI has placed all 4 ships
    if (aiInstance) {
      console.log(`[BattleScreen] Starting AI ship placement loop`);
      //let shipCount = Object.keys(gameInstance.p2ShipList || {}).length;
      let shipCount = 0; 
      console.log(`[BattleScreen] Initial ship count: ${shipCount}, AI shipsPlaced: ${aiInstance.shipsPlaced}`);
      let attempts = 0;


      /*
      TODO: ship count is always 0 fix or check differently
      */
      while (shipCount < 4 && attempts < 50) {
        console.log(`[BattleScreen] Loop iteration ${attempts + 1}: calling takeTurn`);
        aiInstance.takeTurn(gameInstance);
        //shipCount = Object.keys(gameInstance.p2ShipList || {}).length;
        shipCount = aiInstance.shipsPlaced; // Use AI's internal count of placed ships
        console.log(`[BattleScreen] After takeTurn #${attempts + 1}: shipCount=${shipCount}, AI.shipsPlaced=${aiInstance.shipsPlaced}`);
        attempts++;
      }
      
      console.log(`[BattleScreen] Finished placement loop after ${attempts} attempts. Final ship count: ${shipCount}`);
    }
    
    // Update AI ship data after placement
    setAiShipData({ ...gameInstance.p2ShipData });
  }, [gameInstance, aiInstance, gameInstanceId, router]);

  // Auto-trigger AI turn
  useEffect(() => {
    if (Number(currentTurn) === 2 && !gameOver && gameInstance && aiInstance) {
      setIsAIThinking(true);
      
      // Add delay for better UX
      const aiTurnTimeout = setTimeout(() => {
        aiInstance.takeTurn(gameInstance);
        
        // Update state after AI turn
        setPlayerShipData({ ...gameInstance.p1ShipData });
        setAiShipData({ ...gameInstance.p2ShipData });
        setCurrentTurn(Number(gameInstance.playerTurn));
        setIsAIThinking(false);
        
        // Check game over after AI turn
        const gameOverResult = gameInstance.checkGameOver();
        if (gameOverResult !== 0) {
          setGameOver(true);
          setWinner(gameOverResult);
        }
      }, 800);

      return () => clearTimeout(aiTurnTimeout);
    }
  }, [currentTurn, gameOver]);

  // Builds flat grid data used by FlatList to render a square board.
  const flatgridData = (size) => {
    let grid = [];
    for (let i = 0; i < size; i++)
      for (let j = 0; j < size; j++)
        grid.push({ id: `${i}-${j}`, row: i, col: j });
    return grid;
  };

  // Executes a player attack after validating turn state and duplicate shots.
  const handleAttack = (cellId) => {
    if (Number(currentTurn) !== 1 || gameOver || isAIThinking || !gameInstance) return;
    
    // Convert grid ID to Battle.js coordinate
    const cord = gridIdToCord(cellId);
    
    // Check if already attacked
    if (playerAttackData[cord]) {
      Alert.alert("Invalid Attack", "You've already attacked this position!");
      return;
    }

    // Execute attack
    const playerId = gameInstance.player1Id;
    const result = gameInstance.action(playerId, "attack", [cord]);
    console.log(`[BattleScreen] Player attack sent: ${cord}`, result);

    if (result && result.actionData) {
      const attackResult = result.actionData[0]; // "hit" or "miss"
      
      // Update state with attack result
      setPlayerAttackData({ ...(result.attacks || gameInstance.p1AttackData || {}) });
      setAiShipData({ ...gameInstance.p2ShipData });
      setCurrentTurn(Number(result.playerTurn));
      
      setLastAttackResult(attackResult === "hit" ? "HIT!" : "Miss");
      
      // Check game over after player turn
      const gameOverResult = gameInstance.checkGameOver();
      if (gameOverResult !== 0) {
        setGameOver(true);
        setWinner(gameOverResult);
      }
    } else {
      Alert.alert("Attack Failed", "Could not process attack. Please try again.");
    }
  };

  // Sends the player back to the home screen to start a new match.
  const handlePlayAgain = () => {
    router.push("/");
  };

  // Counts intact ship cells to display remaining fleet status.
  const countRemainingShips = (shipData) => {
    let count = 0;
    for (const cord in shipData) {
      if (shipData[cord] === "ship") {
        count++;
      }
    }
    return count;
  };

  const playerShipsRemaining = countRemainingShips(playerShipData);
  const enemyShipsRemaining = countRemainingShips(aiShipData);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Battle in Progress</Text>
          {!gameOver && (
            <Text style={[styles.turnIndicator, isPlayerTurn ? styles.yourTurn : styles.aiTurn]}>
              {isAIThinking ? "🤖 AI Thinking..." : isPlayerTurn ? "🎯 Your Turn" : "⏳ AI's Turn"}
            </Text>
          )}
          {lastAttackResult && !gameOver && (
            <Text style={styles.attackResult}>{lastAttackResult}</Text>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Your Ships</Text>
            <Text style={styles.statValue}>{playerShipsRemaining} remaining</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Enemy Ships</Text>
            <Text style={styles.statValue}>{enemyShipsRemaining} remaining</Text>
          </View>
        </View>

        <View style={styles.gridsContainer}>
          <View style={styles.gridSection}>
            <Text style={styles.gridTitle}>Your Fleet</Text>
            <FleetGrid 
              data={flatgridData(10)}
              shipData={playerShipData}
            />
          </View>

          <View style={styles.gridSection}>
            <Text style={styles.gridTitle}>Attack Grid</Text>
            <AttackGrid 
              data={flatgridData(10)}
              attackData={playerAttackData}
              onAttack={handleAttack}
              disabled={!isPlayerTurn || gameOver || isAIThinking}
            />
          </View>
        </View>
      </ScrollView>

      {/* Game Over Modal */}
      <Modal
        visible={gameOver}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {winner === 1 ? "🎉 Victory!" : "💥 Defeat"}
            </Text>
            <Text style={styles.modalMessage}>
              {winner === 1 
                ? "You destroyed all enemy ships!" 
                : "The AI destroyed all your ships!"}
            </Text>
            <View style={styles.modalButtons}>
              <Pressable 
                style={styles.playAgainButton}
                onPress={handlePlayAgain}
              >
                <Text style={styles.buttonText}>Play Again</Text>
              </Pressable>
              <Pressable 
                style={styles.exitButton}
                onPress={() => router.push("/")}
              >
                <Text style={styles.buttonText}>Exit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Renders one board cell with color based on gameplay state.
function GridSquare({ clickhandler, squareId, size, cellType, disabled = false }) {
  let backgroundColor = "#87CEEB"; // Default: light blue water
  
  if (cellType === "ship") {
    backgroundColor = "#4a90e2"; // Blue ship (not hit)
  } else if (cellType === "hit") {
    backgroundColor = "#ff4444"; // Red hit
  } else if (cellType === "miss") {
    backgroundColor = "#cccccc"; // Gray miss
  } else if (cellType === "attacked-hit") {
    backgroundColor = "#ff6b6b"; // Light red for attack grid hits
  } else if (cellType === "attacked-miss") {
    backgroundColor = "#e0e0e0"; // Light gray for attack grid misses
  } else if (cellType === "water") {
    backgroundColor = "#b3d9ff"; // Lighter blue for water
  }

  return (
    <Pressable
      onPress={() => clickhandler && clickhandler(squareId)}
      style={{ margin: 0, padding: 0 }}
      disabled={disabled || !clickhandler}
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

// Displays the player's own fleet board including hits, misses, and intact ships.
function FleetGrid({ data, shipData }) {
  const [gridSize] = useState(10);
  const windowWidth = Dimensions.get("window").width;
  const boardWidth = Math.min(windowWidth - 30, 320);
  const cellSize = Math.max(18, Math.floor(boardWidth / gridSize));

  // Maps underlying ship cell values to renderable visual cell types.
  const getCellType = (cellId) => {
    const cord = gridIdToCord(cellId);
    const cellValue = shipData?.[cord];
    
    if (cellValue === "ship") return "ship";
    if (cellValue === "hit") return "hit";
    if (cellValue === "miss") return "miss";
    return "water";
  };

  return (
    <View style={[styles.gridWrapper, { width: cellSize * gridSize + 10 }]}>
      <FlatList
        data={data || []}
        key={`fleet-${gridSize}`}
        numColumns={gridSize}
        columnWrapperStyle={{ justifyContent: 'flex-start', margin: 0, padding: 0 }}
        ItemSeparatorComponent={null}
        keyExtractor={(item) => `fleet-${item.id}`}
        contentContainerStyle={{ alignItems: "center" }}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <GridSquare
            clickhandler={null}
            squareId={item.id}
            size={cellSize}
            cellType={getCellType(item.id)}
            disabled={true}
          />
        )}
      />
    </View>
  );
}

// Displays the player's attack board and forwards valid taps as attack actions.
function AttackGrid({ data, attackData, onAttack, disabled }) {
  const [gridSize] = useState(10);
  const windowWidth = Dimensions.get("window").width;
  const boardWidth = Math.min(windowWidth - 30, 320);
  const cellSize = Math.max(18, Math.floor(boardWidth / gridSize));

  // Maps attack history values to visual cell state for the attack grid.
  const getCellType = (cellId) => {
    const cord = gridIdToCord(cellId);
    const cellValue = attackData?.[cord];
    
    if (cellValue === "hit") return "attacked-hit";
    if (cellValue === "miss") return "attacked-miss";
    return "water";
  };

  // Guards attack clicks when the grid is disabled.
  const clickhandler = (id) => {
    if (disabled) return;
    onAttack && onAttack(id);
  };

  return (
    <View style={[styles.gridWrapper, { width: cellSize * gridSize + 10 }]}>
      <FlatList
        data={data || []}
        key={`attack-${gridSize}`}
        numColumns={gridSize}
        columnWrapperStyle={{ justifyContent: 'flex-start', margin: 0, padding: 0 }}
        ItemSeparatorComponent={null}
        keyExtractor={(item) => `attack-${item.id}`}
        contentContainerStyle={{ alignItems: "center" }}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <GridSquare
            clickhandler={clickhandler}
            squareId={item.id}
            size={cellSize}
            cellType={getCellType(item.id)}
            disabled={disabled}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  turnIndicator: {
    fontSize: 18,
    fontWeight: "bold",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  yourTurn: {
    backgroundColor: "#28a745",
    color: "white",
  },
  aiTurn: {
    backgroundColor: "#6c757d",
    color: "white",
  },
  attackResult: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff4444",
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  statBox: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    minWidth: 150,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  gridsContainer: {
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 10,
  },
  gridSection: {
    alignItems: "center",
    marginBottom: 10,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  gridWrapper: {
    backgroundColor: "white",
    padding: 5,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    minWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  modalMessage: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 25,
    color: "#666",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 15,
  },
  playAgainButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  exitButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
