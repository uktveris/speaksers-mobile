import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { Appearance } from "react-native";
import { View } from "react-native";

const theme = Appearance.getColorScheme();

export default function SignUpErrorMessage({ message }: { message: string }) {
  return (
    <View>
      <View />
      <View>
        <Text>{message}</Text>
      </View>
    </View>
  );
}
