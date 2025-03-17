import { ThemedText } from "@/components/ThemedText";
import { StyleSheet, View } from "react-native";

function Info() {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.text}>This is the info screen</ThemedText>
    </View>
  );
}

export default Info;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "pink",
  },
  text: {
    color: "black",
  },
});
