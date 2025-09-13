import { Text } from "react-native";
import { Colors } from "@/src/constants/Colors";
import { Appearance } from "react-native";
import { StyleSheet } from "react-native";
import { ColorSchemeName } from "react-native";
import { View } from "react-native";

function GlobalChat() {
  const theme = Appearance.getColorScheme();
  return (
    <View>
      <Text>this is global chat</Text>
    </View>
  );
}

export default GlobalChat;
