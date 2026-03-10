import { Pressable, Text, View, FlatList, Dimensions, StyleSheet, Modal, Alert } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { getInstance, getAIInstance } from "./../assets/scripts/localCommand.js";
import { useLocalSearchParams, useRouter } from "expo-router";

// Coordinate converter utilities
const gridIdToCord = (id) => {
  // Converts "row-col" format to "x:y" format (where x=col, y=row for Battle.js)
  const [row, col] = id.split("-");
  return `${col}:${row}`; // Swap to col:row because Battle.js uses x:y where x=column, y=row
};

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
    setCurrentTurn(gameInstance.playerTurn);

    // Ensure AI has placed all 4 ships
    if (aiInstance) {
      console.log(`[BattleScreen] Starting AI ship placement loop`);
      let shipCount = Object.keys(gameInstance.p2ShipList || {}).length;
      console.log(`[BattleScreen] Initial ship count: ${shipCount}, AI shipsPlaced: ${aiInstance.shipsPlaced}`);
      let attempts = 0;

      while (shipCount < 4 && attempts < 50) {
        console.log(`[BattleScreen] Loop iteration ${attempts + 1}: calling takeTurn`);
        aiInstance.takeTurn(gameInstance);
        shipCount = Object.keys(gameInstance.p2ShipList || {}).length;
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
    if (currentTurn === 2 && !gameOver && gameInstance && aiInstance) {
      setIsAIThinking(true);
      
      // Add delay for better UX
      const aiTurnTimeout = setTimeout(() => {
        aiInstance.takeTurn(gameInstance);
        
        // Update state after AI turn
        setPlayerShipData({ ...gameInstance.p1ShipData });
        setAiShipData({ ...gameInstance.p2ShipData });
        setCurrentTurn(gameInstance.playerTurn);
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

  const flatgridData = (size) => {
    let grid = [];
    for (let i = 0; i < size; i++)
      for (let j = 0; j < size; j++)
        grid.push({ id: `${i}-${j}`, row: i, col: j });
    return grid;
  };

  const handleAttack = (cellId) => {
    if (currentTurn !== 1 || gameOver || isAIThinking) return;
    
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

    if (result && result.actionData) {
      const attackResult = result.actionData[0]; // "hit" or "miss"
      
      // Update state with attack result
      setPlayerAttackData({ ...result.attacks });
      setAiShipData({ ...gameInstance.p2ShipData });
      setCurrentTurn(result.playerTurn);
      
      setLastAttackResult(attackResult === "hit" ? "HIT!" : "Miss");
      
      // Check game over after player turn
      const gameOverResult = gameInstance.checkGameOver();
      if (gameOverResult !== 0) {
        setGameOver(true);
        setWinner(gameOverResult);
      }
    }
  };

  const handlePlayAgain = () => {
    router.push("/");
  };

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
      <View style={styles.header}>
        <Text style={styles.title}>Battle in Progress</Text>
        {!gameOver && (
          <Text style={[styles.turnIndicator, currentTurn === 1 ? styles.yourTurn : styles.aiTurn]}>
            {isAIThinking ? "🤖 AI Thinking..." : currentTurn === 1 ? "🎯 Your Turn" : "⏳ AI's Turn"}
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
            disabled={currentTurn !== 1 || gameOver || isAIThinking}
          />
        </View>
      </View>

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

function GridSquare({ clickhandler, squareId, size, cellType }) {
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

function FleetGrid({ data, shipData }) {
  const [gridSize] = useState(10);
  const windowWidth = Dimensions.get("window").width;
  const cellSize = Math.floor(windowWidth / gridSize) - 2;

  const getCellType = (cellId) => {
    const cord = gridIdToCord(cellId);
    const cellValue = shipData[cord];
    
    if (cellValue === "ship") return "ship";
    if (cellValue === "hit") return "hit";
    if (cellValue === "miss") return "miss";
    return "water";
  };

  return (
    <View style={styles.gridWrapper}>
      <FlatList
        data={data}
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
          />
        )}
      />
    </View>
  );
}

function AttackGrid({ data, attackData, onAttack, disabled }) {
  const [gridSize] = useState(10);
  const windowWidth = Dimensions.get("window").width;
  const cellSize = Math.floor(windowWidth / gridSize) - 2;

  const getCellType = (cellId) => {
    const cord = gridIdToCord(cellId);
    const cellValue = attackData[cord];
    
    if (cellValue === "hit") return "attacked-hit";
    if (cellValue === "miss") return "attacked-miss";
    return "water";
  };

  const clickhandler = (id) => {
    if (disabled) return;
    onAttack && onAttack(id);
  };

  return (
    <View style={styles.gridWrapper}>
      <FlatList
        data={data}
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
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
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
