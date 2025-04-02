import { useEffect, useState } from "react";
import { View } from "react-native";
import { Audio } from "expo-av";
import { MediaStream } from "react-native-webrtc";
import { Pressable } from "react-native";
import { Text } from "react-native";
import socket from "@/server/socket";
import { useLocalSearchParams } from "expo-router";

function DialogCall() {
  const { remoteSocketId, initCall } = useLocalSearchParams();
  console.log("remote socketId from params: " + remoteSocketId);
  console.log("initcall from params: " + initCall);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const iceServers = [
    // { urls: "stun:stun.l.google.com:19302" },
    // { urls: "stun:stun.l.google.com:5349" },
    // { urls: "stun:stun1.l.google.com:3478" },
    // { urls: "stun:stun1.l.google.com:5349" },
    // { urls: "stun:stun2.l.google.com:19302" },
    // { urls: "stun:stun2.l.google.com:5349" },
    // { urls: "stun:stun3.l.google.com:3478" },
    // { urls: "stun:stun3.l.google.com:5349" },
    // { urls: "stun:stun4.l.google.com:19302" },
    // { urls: "stun:stun4.l.google.com:5349" },
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:3478" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:3478" },
    // { urls: "stun:stun4.l.google.com:19302" },
  ];

  const onStreamUpdate = async (stream: MediaStream) => {
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: stream.toURL() },
      { shouldPlay: true },
    );
    setSound(newSound);
  };

  const createPeerConn = (
    remoteSocketId: string,
    onStreamUpdate: (stream: MediaStream) => void,
  ) => {
    const peerConn = new RTCPeerConnection({ iceServers: iceServers });
    console.log("creating new rtc peerconn");
    peerConn.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          recipient: remoteSocketId,
          candidate: event.candidate,
        });
        console.log("emitted ice candidate to recipient");
      }
    };

    peerConn.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        console.log("received remote audio stream");
        // const remoteStream = event.streams[0] as unknown as MediaStream;
        const remoteStream = event.streams[0] as unknown as MediaStream;
        onStreamUpdate(remoteStream);
      }
    };
    return peerConn;
  };

  const initPeerCall = async (
    remoteSocketId: string,
    onStreamUpdate: (stream: MediaStream) => void,
  ) => {
    const peerConn = createPeerConn(remoteSocketId, onStreamUpdate);
    const offer = await peerConn.createOffer();
    await peerConn.setLocalDescription(offer);
    socket.emit("offer", { recipient: remoteSocketId, offer: offer });
    console.log("emitted offer to recipient");
  };

  const createAnswer = async (
    remoteSocketId: string,
    offer: RTCSessionDescriptionInit,
    onStreamUpdate: (stream: MediaStream) => void,
  ) => {
    const peerConn = createPeerConn(remoteSocketId, onStreamUpdate);
    await peerConn.setRemoteDescription(offer);
    const answer = await peerConn.createAnswer();
    await peerConn.setLocalDescription(answer);
    socket.emit("answer", { recipient: remoteSocketId, answer });
    console.log("emitted answer to recipient");
  };

  const addAnswer = async (
    peerConn: RTCPeerConnection,
    answer: RTCSessionDescriptionInit,
  ) => {
    if (!peerConn.remoteDescription) {
      peerConn.setRemoteDescription(answer);
      console.log("added answer");
    }
  };

  const addCandidate = async (
    peerConn: RTCPeerConnection,
    candidate: RTCIceCandidateInit,
  ) => {
    if (peerConn) {
      peerConn.addIceCandidate(candidate);
      console.log("added ice candidate");
    }
  };

  socket.on("offer", async (data) => {
    console.log("offer received, proceeding");
    const peerConn = createPeerConn(data.from, onStreamUpdate);
    console.log("connection created, proceeding");
    await createAnswer(data.from, data.offer, onStreamUpdate);
    console.log("answer created, proceeding");
    socket.on("answer", async (data) => addAnswer(peerConn, data.answer));
    socket.on("ice-candidate", async (data) =>
      addCandidate(peerConn, data.candidate),
    );
  });

  if (initCall === "true") {
    console.log("initiating call");
    initPeerCall(remoteSocketId as string, onStreamUpdate);
  }
  return (
    <View>
      {/* <Pressable onPress={}>
        <Text>start call</Text>
      </Pressable> */}
      <Text>this is dialog call screen</Text>
    </View>
  );
}

export default DialogCall;
