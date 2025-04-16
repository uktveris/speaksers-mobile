import {
  initPeerCall,
  onOffer,
  onAnswer,
  onIceCandidate,
} from "@/server/peerConnection";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
// import { RTCView, MediaStream } from "react-native-webrtc";
import { Pressable } from "react-native";
import { Text } from "react-native";
import socket from "@/server/socket";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Platform } from "react-native";

function DialogCall() {
  const { remoteSocketId, initCall } = useLocalSearchParams();
  console.log("remote socketId from params: " + remoteSocketId);
  console.log("initcall from params: " + initCall);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const [activeCall, setActiveCall] = useState(true);
  // web testing
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isWeb, setIsWeb] = useState(false);
  const router = useRouter();
  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "STUN:freestun.net:3478" },
  ];
  // const peerConn = new RTCPeerConnection({ iceServers: iceServers });
  const peerConnRef = useRef<RTCPeerConnection | null>(null);

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
    // peerConnRef.current = new RTCPeerConnection({ iceServers: iceServers });
    const peerConnection = new RTCPeerConnection({ iceServers: iceServers });
    peerConnRef.current = peerConnection;
    socket.on("offer", async (data) =>
      onOffer(data.offer, peerConnection, remoteSocketId as string),
    );
    socket.on("answer", async (data) => onAnswer(data.answer, peerConnection));
    socket.on("ice-candidate", (data) =>
      onIceCandidate(data.candidate, peerConnection),
    );
    socket.on("end-call", () => onEndCall());

    peerConnection.ontrack = (event) => {
      const stream = event.streams[0] as unknown as MediaStream;
      setRemoteStream(stream);
      // setRemoteStream(event.streams[0]);
      remoteStreamRef.current = stream;
      console.log("set remote stream: " + event.streams[0]);
    };

    peerConnection.addEventListener("connectionstatechange", (event) => {
      if (peerConnection.connectionState === "connected") {
        console.log("connection established!!");
      }
    });

    if (initCall === "true") {
      initPeerCall(remoteSocketId as string, peerConnection);
    }

    peerConnection.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        console.log("Found ICE Candidate:", event.candidate);
        socket.emit("ice-candidate", {
          recipient: remoteSocketId,
          candidate: event.candidate,
        });
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("end-call");
      peerConnRef.current?.close();
      peerConnRef.current = null;
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
        setRemoteStream(null);
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach((t) => t.stop());
        remoteStreamRef.current = null;
        setRemoteStream(null);
      }
    };
  }, []);

  const handleGoBack = () => {
    router.navigate("/");
  };

  const onEndCall = () => {
    console.log("ending the call");
    setActiveCall(false);
    if (peerConnRef.current) {
      peerConnRef.current.close();
      peerConnRef.current = null;
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }
  };

  const handleEndCall = () => {
    socket.emit("end-call", { recipient: remoteSocketId });
    onEndCall();
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
      <Pressable onPress={handleEndCall}>
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
