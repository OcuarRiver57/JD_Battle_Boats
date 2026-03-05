import { Pressable, Text, View, FlatList, Dimensions, TextInput} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slider } from "re-native-ui";
import { useLocalSearchParams } from "expo-router";
import { createInstance, deleteInstance, inputHandler } from "../GameFunctions/LocalCommand.js";

export default function Index() {
  const { ailevel } = useLocalSearchParams();
  let gameInstance = createInstance(ailevel);

    const flatgridData = (size) => {
    let grid = [];
      for (let i = 0; i < size; i++)
        for (let j = 0; j < size; j++)
          grid.push({ id: `${i}-${j}`, row: i, col: j, hit: false });
      return grid;
  }; 

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatGrid data={flatgridData(10)}/>
      <FlatGrid data={flatgridData(10)}/>
    </SafeAreaView>
  );
}

function GridSquare({ clickhandler, hits, squareId, size }) {
  const hit = hits.includes(squareId);
  return (
    <Pressable onPress={() => clickhandler(squareId)} style={{ margin: 0, padding: 0 }}>
      <View
        style={{
          width: size,
          height: size,
          backgroundColor: hit ? "red" : "lightblue",
        }}
      />
    </Pressable>
  );
}

function FlatGrid({data}) {
  const [hits, setHits] = useState([]);

  // size based on screen width / columns
  const [gridSize, setGridSize] = useState(10);
  const windowWidth = Dimensions.get("window").width;
  const cellSize = Math.floor(windowWidth / gridSize) - 1;

  const clickhandler = (id) => {
    hits.includes(id) ? 
    setHits(hits.filter(hit => hit !== id)) : 
    setHits([...hits, id]);
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
        contentContainerStyle={{ alignItems: "center" }} // optional
        renderItem={({ item }) => (
          <GridSquare
            clickhandler={clickhandler}
            hits={hits}
            squareId={item.id}
            size={cellSize}
          />
        )}
      />
    </SafeAreaView>
  );
}
