import { DeviceEventEmitter, View } from "react-native";
import { Text } from "react-native";
import { Pressable } from "react-native";
import { manageMicrophonePermissions } from "@/src/config/permissionUtils";
import { Alert } from "react-native";
import { Linking } from "react-native";
import { routerReplace } from "../utils/navigation";
import { useEffect, useState } from "react";
import InCallManager from "react-native-incall-manager";

interface GameBoxProps {
  name: string;
  backgroundColor: string;
  link: string;
}

function GameBox({ name, backgroundColor, link }: GameBoxProps) {
  const [canStartCall, setCanStartCall] = useState(true);
  useEffect(() => {
    DeviceEventEmitter.addListener("onAudioFocusChange", (event) => {
      if (event === "AUDIOFOCUS_LOSS" || event === "AUDIOFOCUS_LOSS_TRANSIENT") {
        console.log("lost audio focus - other app possibly started an audio call");
        setCanStartCall(false);
      } else if (event === "AUDIOFOCUS_GAIN") {
        console.log("audio focus regained");
        setCanStartCall(true);
      }
    });
  });

  const handleNavigateWithPermissions = async () => {
    if (await manageMicrophonePermissions()) {
      if (!canStartCall) {
        Alert.alert("Ongoing call", "Cannot start dialog call while on another call.", [
          {
            text: "Dismiss",
            style: "default",
          },
        ]);
      }
      routerReplace(link);
    } else {
      Alert.alert(
        "Microphone access",
        "microphone permissios were not granted. You can open settings to grant them later.",
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
    <Pressable style={{ backgroundColor }} className="p-6 py-10 rounded-2xl" onPress={handleNavigateWithPermissions}>
      <View className="flex justify-center items-center">
        <Text className="font-bold text-text-dark text-xl">{name}</Text>
      </View>
    </Pressable>
  );
}

export default GameBox;
