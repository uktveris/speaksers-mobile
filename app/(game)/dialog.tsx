import { View } from "react-native";
import socket from "@/server/socket";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { Appearance } from "react-native";
import { ColorSchemeName } from "react-native";
import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { Pressable } from "react-native";

function Dialog() {
  const theme = Appearance.getColorScheme();
  const styles = setStyles(theme);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [matched, setMatched] = useState(false);
  const [message, setMessage] = useState("");

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

    socket.emit("join_call");
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("match_found", (peerId: string) => onMatched(peerId));
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Connected status: {isConnected}</Text>
      <Text style={styles.text}>Matched status: {matched}</Text>
      <Text style={styles.text}>Match peer id: {message}</Text>
      <Pressable onPress={() => socket.disconnect()}>
        <Text style={styles.text}>disconnect</Text>
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
