import { useEffect, useState } from "react";
import { View } from "react-native";
import { RTCView } from "react-native-webrtc";
import { Pressable } from "react-native";
import { Text } from "react-native";
import { getSocket } from "@/src/server/socket";
import { useLocalSearchParams } from "expo-router";
import { usePeerConn } from "@/src/hooks/usePeerConn";
import { routerReplace, ROUTES } from "@/src/utils/navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import Timer from "@/src/components/Timer";

export interface TopicTask {
  id: number;
  topic: string;
  type: string;
  question: string;
}

function DialogCall() {
  const { remoteSocketId, initCall } = useLocalSearchParams();
  const socket = getSocket("/calls");
  const [timerData, setTimerData] = useState<{
    endTime: number | null;
    counting: boolean;
  } | null>(null);
  const [peerReady, setPeerReady] = useState(false);
  const [ready, setReady] = useState(false);
  if (!socket.connected) socket.connect();
  const {
    remoteStream,
    activeCall,
    endCall,
    setCallId,
    callId,
    toggleMute,
    isMuted,
  } = usePeerConn(remoteSocketId as string, initCall === "true");

  useEffect(() => {
    console.log("MOUNTED: DIALOGCALL");

    const onCallStarted = (data: {
      callId: string;
      role: string[];
      topic: TopicTask;
    }) => {
      console.log("received callId: ", data.callId);
      setCallId(data.callId);
    };

    const onTimerStarted = (data: { endTime: number }) => {
      setTimerData({ endTime: data.endTime, counting: true });
    };

    const onTimerStopped = () => {
      console.log("timer_stop initiated, resetting data..");
      setTimerData({ endTime: null, counting: false });
    };

    socket.on("timer_started", (data: { endTime: number }) =>
      onTimerStarted(data),
    );
    socket.on("timer_stopped", () => onTimerStopped());
    socket.on("topic_sent", (data) => onCallStarted(data));
    socket.on("peer_ready", () => setPeerReady(true));
    return () => {
      socket.off("topic_sent");
      socket.off("timer_started");
      socket.off("timer_stopped");
      socket.off("peer_ready");
    };
  }, []);

  const handleGoBack = () => {
    routerReplace(ROUTES.homeScreen);
  };

  const stopTimer = () => {
    socket.emit("stop_timer", { callId: callId });
    setReady(true);
  };

  return (
    <SafeAreaView className="h-full bg-background-light dark:bg-background-dark flex justify-center items-center">
      {activeCall ? (
        <View className="flex justify-center items-center border border-red-500">
          <View className="flex justify-center items-center">
            <Text className="text-text-light dark:text-text-dark font-bold">
              peer ready: {peerReady ? "READY" : "NOT READY"}
            </Text>
            <Text className="text-text-light dark:text-text-dark font-bold">
              you ready: {ready ? "READY" : "NOT READY"}
            </Text>
          </View>
          {remoteStream && (
            <RTCView
              streamURL={remoteStream.toURL()}
              style={{ width: 10, height: 10 }}
            />
          )}
          {callId && timerData && (
            <Timer
              endTime={timerData.endTime}
              counting={timerData.counting}
              callId={callId}
              onStopTimer={stopTimer}
            />
          )}
          <Pressable
            className="mt-5 bg-primary w-2/4 p-3 px-5 flex items-center rounded-3xl"
            onPress={() => toggleMute()}
          >
            <Text className="text-text-dark font-bold">
              {isMuted ? "Unmute" : "Mute"}
            </Text>
          </Pressable>
          <Pressable
            className="mt-5 bg-primary w-2/4 p-3 px-5 flex items-center rounded-3xl"
            onPress={() => endCall()}
          >
            <Text className="text-text-dark font-bold">end call</Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex justify-center items-center">
          <Pressable
            className="mt-5 bg-primary w-2/4 p-3 px-5 flex items-center rounded-3xl"
            onPress={handleGoBack}
          >
            <Text className="text-text-dark font-bold">
              call ended, go back
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

export default DialogCall;
