import { useEffect } from "react";
import { View } from "react-native";
import { RTCView } from "react-native-webrtc";
import { Pressable } from "react-native";
import { Text } from "react-native";
import { getSocket } from "@/src/server/socket";
import { useLocalSearchParams } from "expo-router";
import { usePeerConn } from "@/src/hooks/usePeerConn";
import { routerReplace, ROUTES } from "@/src/utils/navigation";

export interface TopicTask {
  id: number;
  topic: string;
  type: string;
  question: string;
}

function DialogCall() {
  const socket = getSocket();
  if (!socket.connected) socket.connect();
  const { remoteSocketId, initCall } = useLocalSearchParams();
  useEffect(() => {
    console.log("remote socketId from params: " + remoteSocketId);
    console.log("initcall from params: " + initCall);
  }, []);
  const { remoteStream, activeCall, endCall, setCallId } = usePeerConn(
    remoteSocketId as string,
    initCall === "true",
  );

  useEffect(() => {
    console.log("MOUNTED: DIALOGCALL");

    const onCallStarted = (data: {
      callId: string;
      role: string[];
      topic: TopicTask;
    }) => {
      console.log("received callId: ", data.callId);
      console.log("received roles: ", data.role);
      console.log("received topic: ", data.topic.type);
      setCallId(data.callId);
    };

    socket.on("topic_sent", (data) => onCallStarted(data));
    return () => {
      socket.off("call_started");
      socket.off("topic_sent");
    };
  }, []);

  const handleGoBack = () => {
    routerReplace(ROUTES.homeScreen);
  };

  return activeCall ? (
    <View>
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={{ width: 0, height: 0 }}
        />
      )}
      <Text>this is dialog call screen</Text>
      <Pressable onPress={() => endCall()}>
        <Text>end call</Text>
      </Pressable>
    </View>
  ) : (
    <View>
      <Text>this is dialog call screen</Text>
      <Pressable onPress={handleGoBack}>
        <Text>call ended, go back</Text>
      </Pressable>
    </View>
  );
}

export default DialogCall;
