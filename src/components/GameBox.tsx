import { View } from "react-native";
import { Appearance } from "react-native";
import { ColorSchemeName } from "react-native";
import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { Pressable } from "react-native";
import { manageMicrophonePermissions } from "@/src/config/permissionUtils";
import { Alert } from "react-native";
import { Linking } from "react-native";
import { routerReplace } from "../utils/navigation";
import { theme } from "@/theme";
import { useColorScheme } from "nativewind";

interface GameBoxProps {
  name: string;
  backgroundColor: string;
  link: string;
}

function GameBox({ name, backgroundColor, link }: GameBoxProps) {
  const colorScheme = useColorScheme();

  const handleNavigateWithPermissions = async () => {
    if (await manageMicrophonePermissions()) {
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
    <Pressable
      style={{ backgroundColor }}
      className="p-6 rounded-2xl"
      onPress={handleNavigateWithPermissions}
    >
      <View>
        <Text
          className="font-bold text-xl"
          style={{
            color:
              colorScheme.colorScheme === "light"
                ? theme.colors.text.light
                : theme.colors.text.dark,
          }}
        >
          {name}
        </Text>
      </View>
    </Pressable>
  );
}

export default GameBox;
