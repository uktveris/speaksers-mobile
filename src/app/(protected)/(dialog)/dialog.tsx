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
import { BackHandler } from "react-native";
import { routerReplace, ROUTES } from "@/src/utils/navigation";
import LoadingDots from "@/src/components/ui/LoadingDots";
import { theme } from "@/theme";

function Dialog() {
  const socket = getSocket("/calls");
  if (!socket.connected) socket.connect();

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
      const route =
        ROUTES.dialogCall + "?remoteSocketId=" + peerId + "&initCall=false";
      console.log("second peer: trying to navigate to route:", route);
      routerReplace(route);
    };

    const onInitCall = (peerId: string) => {
      const route =
        ROUTES.dialogCall + "?remoteSocketId=" + peerId + "&initCall=true";
      console.log("first peer: trying to navigate to route:", route);
      routerReplace(route);
    };

    const onCallCancelled = () => {
      console.log("exited the call queue");
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

  return (
    <SafeAreaView className="h-full bg-background-light dark:bg-background-dark flex justify-center items-center">
      <Text className="text-text-light dark:text-text-dark text-2xl font-bold">
        Searching for a dialogue partner
      </Text>
      <View className="py-5 pt-10">
        <LoadingDots
          dotColor={theme.colors.secondary}
          dotSize={20}
          dotSpacing={12}
        />
      </View>
      <Pressable
        onPress={() => socket.emit("cancel_call")}
        className="mt-5 bg-primary w-2/4 p-3 px-5 flex items-center rounded-3xl"
      >
        <Text className="text-text-dark font-bold text-xl">Cancel search</Text>
      </Pressable>
    </SafeAreaView>
  );
}

export default Dialog;
