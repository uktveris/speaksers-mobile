import { View } from "react-native";
import { Appearance } from "react-native";
import { ColorSchemeName } from "react-native";
import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { Colors } from "@/src/constants/Colors";
import { Pressable } from "react-native";
import { manageMicrophonePermissions } from "@/src/config/permissionUtils";
import { Alert } from "react-native";
import { Linking } from "react-native";
import { routerReplace } from "../utils/navigation";

interface GameBoxProps {
  name: string;
  backgroundColor: string;
  link: string;
}

function GameBox({ name, backgroundColor, link }: GameBoxProps) {
  const theme = Appearance.getColorScheme();
  const styles = setStyles(theme, backgroundColor);

  const handleNavigateWithPermissions = async () => {
    if (await manageMicrophonePermissions()) {
      // router.navigate(link);
      routerReplace(link);
    } else {
      Alert.alert(
        "Microphone access",
        "microphone permissios were not granted. You can open settings to grant them manually.",
        [
          {
            text: "Cancel",
            onPress: () => console.log("permissions alert cancelled"),
            style: "cancel",
          },
          {
            text: "Open settings",
            onPress: () => Linking.openSettings(),
            style: "default",
          },
        ],
      );
      return;
    }
  };

  return (
    <Pressable onPress={handleNavigateWithPermissions}>
      <View style={styles.container}>
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
