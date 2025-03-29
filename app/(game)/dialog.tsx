import { View } from "react-native";
import socket from "@/server/socket";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { Appearance } from "react-native";
import { ColorSchemeName } from "react-native";
import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";

function Dialog() {
  const theme = Appearance.getColorScheme();
  const styles = setStyles(theme);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [matched, setMatched] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      console.log("socket connected!");
    };
    const onDisconnect = () => {
      setIsConnected(false);
      console.log("socket disconnected!");
    };
    const onMatched = (message: string) => {
      setMatched(true);
      setMessage(message);
      console.log("socket received peer id! - " + message);
    };

    const onCallCancelled = () => {
      console.log("exited the call queue");
      setMatched(false);
      router.replace("/(tabs)/");
    };

    socket.emit("join_call");
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("match_found", (peerId: string) => onMatched(peerId));
    socket.on("call_cancelled", onCallCancelled);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Connected status: {isConnected ? "it is!" : "it is not connected.."}
      </Text>
      <Text style={styles.text}>
        Matched status: {matched ? "it is matched!" : "not matched yet.."}
      </Text>
      <Text style={styles.text}>
        Match peer id: {message ? message : "no id received.."}
      </Text>
      <Pressable onPress={() => socket.emit("cancel_call")}>
        <Text style={styles.text}>Cancel call</Text>
      </Pressable>
    </View>
  );
}

function setStyles(theme: ColorSchemeName) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        theme === "light" ? Colors.light.background : Colors.dark.background,
    },
    text: {
      color: theme === "light" ? Colors.light.text : Colors.dark.text,
    },
  });
}

export default Dialog;
