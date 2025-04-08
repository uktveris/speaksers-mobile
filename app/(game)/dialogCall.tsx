import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Audio } from "expo-av";
// import { MediaStream } from "react-native-webrtc";
import { Pressable } from "react-native";
import { Text } from "react-native";
import socket from "@/server/socket";
import { useLocalSearchParams, useRouter } from "expo-router";

function DialogCall() {
  const { remoteSocketId, initCall } = useLocalSearchParams();
  console.log("remote socketId from params: " + remoteSocketId);
  console.log("initcall from params: " + initCall);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [activeCall, setActiveCall] = useState(true);
  const router = useRouter();
  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "STUN:freestun.net:3478" },
  ];
  // const peerConn = new RTCPeerConnection({ iceServers: iceServers });
  const peerConnRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    peerConnRef.current = new RTCPeerConnection({ iceServers: iceServers });
    socket.on("offer", async (data) => onOffer(data));
    socket.on("answer", async (data) => onAnswer(data));
    socket.on("ice-candidate", (data) => onIceCandidate(data));
    socket.on("end-call", () => onEndCall());

    peerConnRef.current.ontrack = (event) => {
      const remoteStream = new MediaStream();
      remoteStream.addTrack(event.track);

      // Store or use this remoteStream to play audio
      // For example, you can use Expo's `Audio.Sound.createAsync()` or similar
    };

    const initPeerCall = async (remoteSocketId: string) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
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
  });

  // socket.on("offer", async (data) => {
  //   console.log("offer received, proceeding");
  //   console.log("connection created, proceeding");
  //   console.log("offer: ");
  //   console.log(data.offer);
  //   peerConn.setRemoteDescription(new RTCSessionDescription(data.offer));
  //   const answer = await peerConn.createAnswer();
  //   await peerConn.setLocalDescription(answer);
  //   console.log("answer ceated, proceeding");
  //   socket.emit("answer", { recipient: remoteSocketId, answer: answer });
  // });

  // socket.on("answer", async (data) => {
  //   console.log("trying to add answer to desc: answer");
  //   console.log(data.answer);
  //   await peerConn.setRemoteDescription(new RTCSessionDescription(data.answer));
  // });

  // socket.on("ice-candidate", async (data) => {
  //   if (data.candidate) {
  //     try {
  //       console.log("incoming new ice candidate");
  //       // await peerConn.addIceCandidate(data.candidate);
  //       await peerConn.addIceCandidate(new RTCIceCandidate(data.candidate));
  //     } catch (error) {
  //       console.log(
  //         "error while adding ice candidate: " + (error as Error).message,
  //       );
  //     }
  //   }
  // });

  // socket.on("end-call", () => {
  //   setActiveCall(false);
  // });
  const handleGoBack = () => {
    router.navigate("/");
  };

  const onEndCall = () => {
    setActiveCall(false);
  };

  const handleEndCall = () => {
    socket.emit("end-call", { recipient: remoteSocketId });
    setActiveCall(false);
  };

  return activeCall ? (
    <View>
      <Text>this is dialog call screen</Text>
      <Pressable onPress={handleEndCall}>
        <Text>end call</Text>
      </Pressable>
    </View>
  ) : (
    <View>
      <Pressable onPress={handleGoBack}>
        <Text>call ended, go back</Text>
      </Pressable>
    </View>
  );
}

export default DialogCall;
