import { GlobalStyles } from "@/src/constants/StyleConstants";
import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { Appearance } from "react-native";
import { View } from "react-native";

const theme = Appearance.getColorScheme();

export default function SignUpErrorMessage({ message }: { message: string }) {
  return (
    <View>
      <View style={GlobalStyles.verticalSpacerMedium} />
      <View style={styles.container}>
        <Text style={GlobalStyles.smallTextBold}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#870b05",
    borderRadius: 30,
    borderWidth: 2,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(135, 11, 5, 0.3)",
  },
});
