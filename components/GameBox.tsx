import { View } from "react-native";
import { ThemedText } from "./ThemedText";
import { Appearance } from "react-native";
import { ColorSchemeName } from "react-native";
import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { Colors } from "@/constants/Colors";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";

interface GameBoxProps {
  name: string;
  backgroundColor: string;
  link: string;
}

function GameBox({ name, backgroundColor, link }: GameBoxProps) {
  const router = useRouter();
  const theme = Appearance.getColorScheme();
  const styles = setStyles(theme, backgroundColor);
  return (
    <Pressable onPress={() => router.replace(link)}>
      <View style={styles.container}>
        {/* <ThemedText style={styles.text}>{name}</ThemedText> */}
        <Text style={styles.text}>{name}</Text>
      </View>
    </Pressable>
  );
}

function setStyles(theme: ColorSchemeName, backgroundColor: string) {
  return StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
      aspectRatio: 1,
      backgroundColor: backgroundColor,
    },
    text: {
      color: theme === "light" ? Colors.light.text : Colors.dark.text,
      fontSize: 40,
      fontWeight: "bold",
    },
  });
}

export default GameBox;
