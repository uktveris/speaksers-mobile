import { useEffect, useState } from "react";
import { View } from "react-native";
import { Audio } from "expo-av";
import { MediaStream } from "react-native-webrtc";
import { Pressable } from "react-native";
import { Text } from "react-native";
import socket from "@/server/socket";
import { useLocalSearchParams } from "expo-router";
import { Platform } from "react-native";
import Constants from "expo-constants";

function DialogCall() {
  const { remoteSocketId, initCall } = useLocalSearchParams();
  console.log("remote socketId from params: " + remoteSocketId);
  console.log("initcall from params: " + initCall);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const iceServers = [
    // { urls: "stunserver.org" },
    // { urls: "stun:stun4.l.google.com:5349" },
    // { urls: "stun:stun.l.google.com:19302" },
    { urls: "STUN:freestun.net:3478" },
    // { urls: "TURN:freestun.net:3478" },
  ];
  const peerConn = new RTCPeerConnection({ iceServers: iceServers });

  const onStreamUpdate = async (stream: MediaStream) => {
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: stream.toURL() },
      { shouldPlay: true },
    );
    setSound(newSound);
  };

  const initPeerCall = async (remoteSocketId: string) => {
    // peerConns.set(remoteSocketId, peerConn);
    const offer = await peerConn.createOffer();
    await peerConn.setLocalDescription(offer);
    socket.emit("offer", { recipient: remoteSocketId, offer: offer });
  };

  socket.on("offer", async (data) => {
    console.log("offer received, proceeding");
    // const peerConn = new RTCPeerConnection({ iceServers: iceServers });
    // peerConns.set(data.from, peerConn);
    console.log("connection created, proceeding");
    peerConn.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peerConn.createAnswer();
    await peerConn.setLocalDescription(answer);
    console.log("answer ceated, proceeding");
    socket.emit("answer", { recipient: remoteSocketId, answer: answer });
  });

  socket.on("answer", (data) => {
    console.log("trying to add answer to desc");
    // const peerConn = peerConns.get(remoteSocketId as string);
    peerConn.setRemoteDescription(new RTCSessionDescription(data.answer));
  });
  socket.on("ice-candidate", async (data) => {
    if (data.candidate) {
      try {
        console.log("incoming new ice candidate");
        await peerConn.addIceCandidate(data.candidate);
      } catch (error) {
        console.log(
          "error while adding ice candidate: " + (error as Error).message,
        );
      }
    }
  });
  peerConn.addEventListener("icecandidate", (event) => {
    if (event.candidate) {
      console.log("Found ICE Candidate:", event.candidate);
      socket.emit("ice-candidate", {
        recipient: remoteSocketId,
        candidate: event.candidate,
      });
    }
  });
  peerConn.addEventListener("connectionstatechange", (event) => {
    if (peerConn.connectionState === "connected") {
      console.log("connection established!!");
    }
  });
  // socket.on("ice-candidate", async (data) => {
  //   console.log("ice candidate received");
  //   await addCandidate(peerConns.get(data.from)!, data.candidate);
  // });

  // if (initCall === "true") {
  //   console.log("initiating call");
  //   initPeerCall(remoteSocketId as string, onStreamUpdate);
  // } else {
  //   const peerConn = createPeerConn(remoteSocketId as string, onStreamUpdate);
  // }
  if (initCall === "true") {
    initPeerCall(remoteSocketId as string);
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
