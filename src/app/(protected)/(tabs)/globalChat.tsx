import { ThemedText } from "@/src/components/ThemedText";
import { Colors } from "@/src/constants/Colors";
import { Appearance } from "react-native";
import { StyleSheet } from "react-native";
import { ColorSchemeName } from "react-native";
import { View } from "react-native";

function GlobalChat() {
  const theme = Appearance.getColorScheme();
  const styles = setStyles(theme);
  return (
    <View style={styles.container}>
      <ThemedText>this is global chat</ThemedText>
    </View>
  );
}

function setStyles(theme: ColorSchemeName) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:
        theme === "light" ? Colors.light.background : Colors.dark.background,
    },
    text: {
      color: theme === "light" ? Colors.light.text : Colors.dark.text,
    },
  });
}

export default GlobalChat;
