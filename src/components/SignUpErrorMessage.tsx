import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { Appearance } from "react-native";
import { View } from "react-native";

const theme = Appearance.getColorScheme();

export default function SignUpErrorMessage({ message }: { message: string }) {
  return (
    <View className="py-3">
      <Text className="font-bold text-red-800">{message}</Text>
    </View>
  );
}
