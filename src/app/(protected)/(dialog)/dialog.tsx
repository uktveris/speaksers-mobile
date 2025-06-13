import { Alert, View } from "react-native";
import { getSocket } from "@/src/server/socket";
import { useEffect, useRef } from "react";
import { Text } from "react-native";
import { Appearance } from "react-native";
import { ColorSchemeName } from "react-native";
import { StyleSheet } from "react-native";
import { Colors } from "@/src/constants/Colors";
import { Pressable } from "react-native";
import { Dimensions } from "react-native";
import { Animated } from "react-native";
import { Easing } from "react-native";
import { SafeAreaView } from "react-native";
import { GlobalStyles } from "@/src/constants/StyleConstants";
import { BackHandler } from "react-native";
import { routerReplace, ROUTES } from "@/src/utils/navigation";

const screenWidth = Dimensions.get("window").width;
const boxSize = 100;
const padding = 10;

function Dialog() {
  const socket = getSocket();
  if (!socket.connected) socket.connect();
  const theme = Appearance.getColorScheme();
  const styles = setStyles(theme);
  // const [matched, setMatched] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const handleBackAction = () => {
    socket.emit("cancel_call");
  };

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Going back", "Going back will cancel the search", [
        {
          text: "Keep searching",
          onPress: () => null,
          style: "cancel",
        },
        {
          text: "Go back",
          onPress: handleBackAction,
          style: "destructive",
        },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => {
      backHandler.remove();
    };
  }, []);

  useEffect(() => {
    const onConnect = () => {
      console.log("socket connected!");
    };
    const onDisconnect = () => {
      console.log("socket disconnected!");
    };
    const onMatched = (peerId: string) => {
      // setMatched(true);
      console.log("socket received peer id! - " + peerId);
      const route =
        ROUTES.dialogCall + "?remoteSocketId=" + peerId + "&initCall=false";
      console.log("second peer: trying to navigate to route:", route);
      routerReplace(route);
    };

    const onInitCall = (peerId: string) => {
      // setMatched(true);
      console.log("socket received peer id! - " + peerId);
      const route =
        ROUTES.dialogCall + "?remoteSocketId=" + peerId + "&initCall=true";
      console.log("first peer: trying to navigate to route:", route);
      routerReplace(route);
    };

    const onCallCancelled = () => {
      console.log("exited the call queue");
      // setMatched(false);
      routerReplace(ROUTES.homeScreen);
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
            duration: 1000,
            easing: Easing.inOut(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.exp),
            useNativeDriver: true,
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
      <Text style={[GlobalStyles.titleText]}>
        Searching for a dialogue partner
      </Text>
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
