import { useEffect, useState } from "react";
import { View } from "react-native";
import { Pressable } from "react-native";
import { Text } from "react-native";
import { getSocket } from "@/src/server/socket";
import { useLocalSearchParams } from "expo-router";
import { routerReplace, ROUTES } from "@/src/utils/navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import Timer from "@/src/components/Timer";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export interface StudentTopic {
  id: string;
  title: string;
  role: string;
  arg: string;
  tip: string;
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
  const [topic, setTopic] = useState<StudentTopic | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [callId, setCallId] = useState<string | null>(null);

  useEffect(() => {
    console.log("MOUNTED: dialogPrep");

    const onCallStarted = (data: { callId: string; role: string; topic: StudentTopic }) => {
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
    socket.on("topic_sent", (data: { callId: string; role: string; topic: StudentTopic }) => onCallStarted(data));
    socket.on("peer_ready", () => setPeerReady(true));
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
      <View className="flex h-full px-2 items-center">
        <Text className=" text-text-light dark:text-text-dark text-3xl font-bold">Preparation</Text>
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
        <View className="flex flex-1 gap-4 justify-center">
          {topic && role && (
            <View className="flex bg-background-dimmed rounded-3xl p-5">
              <Text className="text-text-light dark:text-text-dark text-2xl font-bold text-center mb-2">
                {topic.title}
              </Text>
              <Text className="text-text-light dark:text-text-dark font-bold mb-2">Role: {topic.role}</Text>
              <Text className="text-text-light dark:text-text-dark mb-2">{topic.arg}</Text>
              <Text className="text-text-light dark:text-text-dark">Tip: {topic.tip}</Text>
            </View>
          )}
          <View className="flex flex-row gap-4 justify-center items-center">
            <Pressable
              disabled={ready}
              onPress={() => stopTimer()}
              className={`bg-primary w-2/4 p-3 px-5 flex items-center rounded-3xl ${ready ? "bg-background-dimmed" : ""}`}
            >
              <Text className="text-text-light dark:text-text-dark font-bold">
                {peerReady ? "Start practice" : "Ready"}
              </Text>
            </Pressable>
            {peerReady ? (
              <View className="bg-background-dimmed flex flex-row p-3 rounded-3xl justify-center">
                <Ionicons name="checkmark-circle" size={22} color="green" />
                <Text className="text-text-light dark:text-text-dark self-center">Partner ready</Text>
              </View>
            ) : (
              <View className="bg-background-dimmed flex flex-row p-3 rounded-3xl justify-center">
                <FontAwesome6 name="circle-xmark" size={22} color="red" />
                <Text className="text-text-light dark:text-text-dark self-center">Partner not ready</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
