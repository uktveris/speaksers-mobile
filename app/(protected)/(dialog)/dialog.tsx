import { View } from "react-native";
import socket from "@/server/socket";
import { useEffect, useRef, useState } from "react";
import { Text } from "react-native";
import { Appearance } from "react-native";
import { ColorSchemeName } from "react-native";
import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Dimensions } from "react-native";
import { Animated } from "react-native";
import { Easing } from "react-native";
import { SafeAreaView } from "react-native";
import { FontSizes, GlobalStyles } from "@/constants/StyleConstants";

const screenWidth = Dimensions.get("window").width;
const boxSize = 100;
const padding = 10;

function Dialog() {
  const theme = Appearance.getColorScheme();
  const styles = setStyles(theme);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [matched, setMatched] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      console.log("socket connected!");
    };
    const onDisconnect = () => {
      setIsConnected(false);
      console.log("socket disconnected!");
    };
    const onMatched = (peerId: string) => {
      setMatched(true);
      setMessage(peerId);
      console.log("socket received peer id! - " + peerId);
      router.replace(
        "/dialogCall?remoteSocketId=" + peerId + "&initCall=false",
      );
    };

    const onInitCall = (peerId: string) => {
      setMatched(true);
      setMessage(peerId);
      console.log("socket received peer id! - " + peerId);
      router.replace("/dialogCall?remoteSocketId=" + peerId + "&initCall=true");
    };

    const onCallCancelled = () => {
      console.log("exited the call queue");
      setMatched(false);
      router.replace("../(tabs)");
    };

    socket.emit("join_call");
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("match_found", (peerId: string) => onMatched(peerId));
    socket.on("init_call", (peerId: string) => onInitCall(peerId));
    socket.on("call_cancelled", onCallCancelled);

    return () => {
      socket.off("join_call");
      socket.off("match_found");
      socket.off("init_call");
      socket.off("call_cancelled");
    };
  }, []);

  useEffect(() => {
    const maxTranslation = screenWidth - boxSize - padding;
    const beginAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: maxTranslation,
            duration: 1500,
            easing: Easing.inOut(Easing.exp),
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.exp),
            useNativeDriver: false,
          }),
        ]),
      ).start();
    };

    beginAnimation();
  }, [anim]);

  const slide = anim.interpolate({
    inputRange: [0, screenWidth],
    outputRange: [padding, screenWidth - padding],
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[GlobalStyles.titleText]}>Searching for a peer</Text>
      <View style={GlobalStyles.verticalSpacerLarge}></View>
      <Animated.View
        style={[
          styles.box,
          {
            transform: [{ translateX: slide }],
          },
        ]}
      />
      <View style={GlobalStyles.verticalSpacerLarge}></View>
      <Pressable
        style={GlobalStyles.secondaryButton}
        onPress={() => socket.emit("cancel_call")}
      >
        <Text style={GlobalStyles.mediumBoldText}>Cancel call</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function setStyles(theme: ColorSchemeName) {
  return StyleSheet.create({
    container: {
      alignItems: "center",
      flex: 1,
      backgroundColor:
        theme === "light" ? Colors.light.background : Colors.dark.background,
      justifyContent: "center",
    },
    box: {
      alignSelf: "flex-start",
      width: boxSize,
      height: boxSize,
      backgroundColor: Colors.light.primary,
      borderRadius: 20,
    },
  });
}

export default Dialog;
