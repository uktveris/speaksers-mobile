import { useEffect, useState } from "react";
import { View } from "react-native";
import { RTCView } from "react-native-webrtc";
import { Pressable } from "react-native";
import { Text } from "react-native";
import { getSocket } from "@/src/server/socket";
import { useLocalSearchParams } from "expo-router";
import { routerReplace, ROUTES } from "@/src/utils/navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import Timer from "@/src/components/Timer";
import { useMediasoup } from "@/src/hooks/useMediasoup";

export interface TopicTask {
  id: number;
  topic: string;
  type: string;
  question: string;
}

export default function DialogPrep() {
  const { remoteSocketId } = useLocalSearchParams();
  const socket = getSocket("/calls");
  if (!socket.connected) socket.connect();
  const [timerData, setTimerData] = useState<{
    endTime: number | null;
    counting: boolean;
  } | null>(null);
  const [peerReady, setPeerReady] = useState(false);
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(false);
  // const { remoteStream, mute, unMute, hangUp, callId, setCallId } = useMediasoup(remoteSocketId as string, callId);
  const [topic, setTopic] = useState<TopicTask | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [callId, setCallId] = useState<string | null>(null);

  useEffect(() => {
    console.log("MOUNTED: dialogPrep");

    const onCallStarted = (data: { callId: string; role: string; topic: TopicTask }) => {
      console.log("data:", { data });
      setCallId(data.callId);
      setTopic(data.topic);
      setRole(data.role);
    };

    const onTimerStarted = (data: { endTime: number }) => {
      setTimerData({ endTime: data.endTime, counting: true });
    };

    socket.on("timer_started", (data: { endTime: number }) => onTimerStarted(data));
    socket.on("timer_stopped", () => onTimerStopped());
    socket.on("topic_sent", (data: { callId: string; role: string; topic: TopicTask }) => onCallStarted(data));
    socket.on("peer_ready", () => setPeerReady(true));
    // socket.on("start_call", () => startCall());
    return () => {
      socket.off("topic_sent");
      socket.off("timer_started");
      socket.off("timer_stopped");
      socket.off("peer_ready");
    };
  }, []);

  useEffect(() => {
    const startCall = () => {
      if (!callId || !topic || !role) {
        console.log("fatal error occurred: no callId, no topic or no role");
        return;
      }
      routerReplace(
        ROUTES.dialogCall +
          "?peerId=" +
          remoteSocketId +
          "&callId=" +
          callId +
          "&topicId=" +
          topic.id +
          "&role=" +
          role,
      );
    };

    socket.on("start_call", startCall);

    return () => {
      socket.off("start_call", startCall);
    };
  }, [callId, topic, role]);

  const onTimerStopped = () => {
    console.log("timer_stop initiated, resetting data..");
    setTimerData({ endTime: null, counting: false });
    socket.emit("timer_ended", { callId });
  };

  const stopTimer = () => {
    socket.emit("stop_timer", { callId: callId });
    setReady(true);
  };

  return (
    <SafeAreaView className="h-full bg-background-light dark:bg-background-dark flex justify-center items-center">
      <View className="flex px-2 justify-center items-center">
        <Text className="text-text-light dark:text-text-dark text-3xl font-bold">Preparation</Text>
        <Text className="text-text-light dark:text-text-dark font-bold">Time to prepare:</Text>
        {timerData && (
          <Timer
            callId={callId as string}
            endTime={timerData.endTime}
            counting={timerData.counting}
            onStopTimer={stopTimer}
            onTimerEnded={onTimerStopped}
          />
        )}
        <Text className="text-text-light dark:text-text-dark">Peer {peerReady ? "Ready" : "Not ready"}</Text>)
      </View>
      {/*{remoteStream ? (
        <View className="flex justify-center items-center border border-red-500">
          <View className="flex justify-center items-center">
            <Text className="text-text-light dark:text-text-dark font-bold">
              peer ready: {peerReady ? "READY" : "NOT READY"}
            </Text>
            <Text className="text-text-light dark:text-text-dark font-bold">
              you ready: {ready ? "READY" : "NOT READY"}
            </Text>
          </View>
          {remoteStream && <RTCView streamURL={remoteStream.toURL()} style={{ width: 10, height: 10 }} />}
          {callId && timerData && (
            <Timer endTime={timerData.endTime} counting={timerData.counting} callId={callId} onStopTimer={stopTimer} />
          )}
          <Pressable
            className="mt-5 bg-primary w-2/4 p-3 px-5 flex items-center rounded-3xl"
            onPress={() => toggleMute()}
          >
            <Text className="text-text-dark font-bold">{muted ? "Unmute" : "Mute"}</Text>
          </Pressable>
          <Pressable className="mt-5 bg-primary w-2/4 p-3 px-5 flex items-center rounded-3xl" onPress={() => hangUp()}>
            <Text className="text-text-dark font-bold">end call</Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex justify-center items-center">
          <Pressable className="mt-5 bg-primary w-2/4 p-3 px-5 flex items-center rounded-3xl" onPress={handleGoBack}>
            <Text className="text-text-dark font-bold">call ended, go back</Text>
          </Pressable>
        </View>
      )}*/}
    </SafeAreaView>
  );
}
