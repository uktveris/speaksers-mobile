import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
// import { RTCView, MediaStream } from "react-native-webrtc";
import { Pressable } from "react-native";
import { Text } from "react-native";
import socket from "@/server/socket";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Platform } from "react-native";
import { usePeerConn } from "@/hooks/usePeerConn";

function DialogCall() {
  const { remoteSocketId, initCall } = useLocalSearchParams();
  useEffect(() => {
    console.log("remote socketId from params: " + remoteSocketId);
    console.log("initcall from params: " + initCall);
  }, []);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  // web testing
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isWeb, setIsWeb] = useState(false);
  const router = useRouter();
  const { remoteStream, activeCall, endCall } = usePeerConn(
    remoteSocketId as string,
    initCall === "true",
  );

  // TODO: on production remove this effect
  // TODO: stream needs to be played on mobile speakers
  useEffect(() => {
    if (Platform.OS === "web") setIsWeb(true);
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
      audioRef.current
        .play()
        .catch((error) =>
          console.log("error playing audio stream: " + error.message),
        );
    }
  }, [remoteStream]);

  useEffect(() => {
    console.log("MOUNTED: DIALOGCALL");
    return () => {
      console.log("UNMOUNTED: DIALOGCALL");
    };
  }, []);

  const handleGoBack = () => {
    router.replace("/");
  };

  const webAudio = (
    <div>
      <h2>Remote Audio</h2>
      <audio ref={audioRef} autoPlay controls />
    </div>
  );

  return activeCall ? (
    <View>
      {/* remoteStream ? ( */}
      {/* <RTCView
          streamURL={remoteStream.toURL()}
          style={{ width: 0, height: 0 }}
        /> */}
      {isWeb && webAudio}
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
  // : (
  //   <View></View>
  // );
}

export default DialogCall;
