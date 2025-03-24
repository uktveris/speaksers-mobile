import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { Appearance } from "react-native";
import { ColorSchemeName } from "react-native";
import { StyleSheet, View } from "react-native";

function Account() {
  const theme = Appearance.getColorScheme();
  const styles = setStyles(theme);
  return (
    <View style={styles.container}>
      <ThemedText style={styles.text}>This is the info screen</ThemedText>
    </View>
  );
}

export default Account;

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
