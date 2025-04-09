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
    peerConnRef.current = new RTCPeerConnection({ iceServers: iceServers });
    socket.on("offer", async (data) => onOffer(data));
    socket.on("answer", async (data) => onAnswer(data));
    socket.on("ice-candidate", (data) => onIceCandidate(data));
    socket.on("end-call", () => onEndCall());

    peerConnRef.current.ontrack = (event) => {
      const stream = event.streams[0] as unknown as MediaStream;
      setRemoteStream(stream);
      setRemoteStream(event.streams[0]);
      console.log("set remote stream: " + event.streams[0]);
    };

    const initPeerCall = async (remoteSocketId: string) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      // TODO: on production change to mobile speakers
      stream.getTracks().forEach((track) => {
        peerConnRef.current.addTrack(track, stream);
      });
      const offer = await peerConnRef.current.createOffer();
      await peerConnRef.current.setLocalDescription(offer);
      socket.emit("offer", { recipient: remoteSocketId, offer: offer });
    };

    const onOffer = async (data) => {
      console.log("offer received, proceeding");
      console.log("connection created, proceeding");
      console.log("offer: ");
      console.log(data.offer);
      peerConnRef.current.setRemoteDescription(
        new RTCSessionDescription(data.offer),
      );
      const answer = await peerConnRef.current.createAnswer();
      await peerConnRef.current.setLocalDescription(answer);
      console.log("answer ceated, proceeding");
      socket.emit("answer", { recipient: remoteSocketId, answer: answer });
    };

    const onAnswer = async (data) => {
      console.log("trying to add answer to desc: answer");
      console.log(data.answer);
      await peerConnRef.current.setRemoteDescription(
        new RTCSessionDescription(data.answer),
      );
    };

    const onIceCandidate = async (data) => {
      if (data.candidate) {
        try {
          console.log("incoming new ice candidate");
          // await peerConn.addIceCandidate(data.candidate);
          await peerConnRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate),
          );
        } catch (error) {
          console.log(
            "error while adding ice candidate: " + (error as Error).message,
          );
        }
      }
    };

    peerConnRef.current.addEventListener("connectionstatechange", (event) => {
      if (peerConnRef.current.connectionState === "connected") {
        console.log("connection established!!");
      }
    });

    if (initCall === "true") {
      initPeerCall(remoteSocketId as string);
    }

    peerConnRef.current.addEventListener("icecandidate", (event) => {
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
      <Pressable onPress={handleEndCall}>
        <Text>end call</Text>
      </Pressable>
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
