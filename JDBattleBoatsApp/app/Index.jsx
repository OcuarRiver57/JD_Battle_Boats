import { Pressable, Text, View, StyleSheet} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from 'react-native-element-dropdown';
import { router } from "expo-router";

//made by Jacob Dykstra 3/10/26

export default function Index() {
    const [dropValue, setDropValue] = useState(null);
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Text style={styles.title}>JD Battle Boats</Text>
            <AiDropDown value={dropValue} setValue={setDropValue}/>
            <Pressable style={styles.button} onPressOut={() => startGame(dropValue)}>
                <Text style={styles.buttonText}>Start Game</Text>
            </Pressable>
        </SafeAreaView>
    )
}

function AiDropDown({value, setValue}) {
    const [isFocus, setIsFocus] = useState(false);

    const aiDifficulties = [
    {label: "Very Easy", value: 1},
    {label: "Easy", value: 2},
    {label: "Medium", value: 3},
    {label: "Hard", value: 4},
    {label: "Very Hard", value: 5},
    {label: "Impossible", value: 6},
    ]
    const renderLabel = () => {
      if (value || isFocus) {
        return (
          <Text style={[isFocus && { color: 'blue' }]}>
            Ai Dificulty
          </Text>
        );
      }
      return null;
    };
    return (
        <View style={styles.container}>
            {renderLabel()}
            <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}       
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}            
                data={aiDifficulties}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select item' : '...'}
                searchPlaceholder="Search..."
                value={value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                    setValue(item.value);
                    setIsFocus(false);
                }}
            />
        </View>
    )
}

function startGame(aiDifficulty) {
    router.push({
        pathname: "/ManageFleetScreen",
    params: {ailevel: aiDifficulty ?? 1},
    });
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: 'white',
      padding: 16,
    },
    dropdown: {
      height: 50,
      borderColor: 'gray',
      borderWidth: 0.5,
      borderRadius: 8,
      paddingHorizontal: 8,
    },
    icon: {
      marginRight: 5,
    },
    label: {
      position: 'absolute',
      backgroundColor: 'white',
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
    },
    placeholderStyle: {
      fontSize: 16,
    },
    selectedTextStyle: {
      fontSize: 16,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    button: {
        backgroundColor: "blue",
        padding: 10,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});