import Timer from "@/src/components/Timer";
import { useMediasoup } from "@/src/hooks/useMediasoup";
import { routerReplace, ROUTES } from "@/src/utils/navigation";
import { useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RTCView } from "react-native-webrtc";
import { theme } from "@/theme";

export default function DialogCall() {
  const { colorScheme } = useColorScheme();
  const { peerId, callId, topicId, role } = useLocalSearchParams();
  const { remoteStream, mute, unMute, hangUp, loading } = useMediasoup(peerId as string, callId as string);
  const [muted, setMuted] = useState(false);
  const [timerData, setTimerData] = useState<{
    endTime: number | null;
    counting: boolean;
  } | null>(null);

  const handleGoBack = () => {
    hangUp();
    routerReplace(ROUTES.homeScreen);
  };

  const toggleMute = () => {
    if (muted) {
      unMute();
    } else {
      mute();
    }
    setMuted((prev) => !prev);
  };

  // const stopTimer = () => {
  //   socket.emit("stop_timer", { callId: callId });
  //   setReady(true);
  // };

  return (
    <SafeAreaView>
      <View>
        {loading && (
          <ActivityIndicator
            color={colorScheme === "light" ? theme.colors.text.light : theme.colors.text.dark}
            size="large"
          />
        )}
        {remoteStream && !loading && (
          <View className="flex justify-center items-center border border-red-500">
            {remoteStream && <RTCView streamURL={remoteStream.toURL()} style={{ width: 10, height: 10 }} />}
            {/*{callId && timerData && (
              <Timer
                endTime={timerData.endTime}
                counting={timerData.counting}
                callId={callId as string}
                // onStopTimer={stopTimer}
                onStopTimer={() => console.log("timer stopped")}
              />
            )}*/}
            <Pressable
              className="mt-5 bg-primary w-2/4 p-3 px-5 flex items-center rounded-3xl"
              onPress={() => toggleMute()}
            >
              <Text className="text-text-dark font-bold">{muted ? "Unmute" : "Mute"}</Text>
            </Pressable>
            <Pressable
              className="mt-5 bg-primary w-2/4 p-3 px-5 flex items-center rounded-3xl"
              onPress={() => handleGoBack()}
            >
              <Text className="text-text-dark font-bold">end call</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
