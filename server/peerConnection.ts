import { Platform } from "react-native";
import socket from "./socket";
import { MediaStream } from "react-native-webrtc";

const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:5349" },
];

const initPeerCall = async (
  remoteSocketId: string,
  peerConn: RTCPeerConnection,
) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
  // TODO: on production change to mobile speakers
  stream.getTracks().forEach((track) => {
    peerConn.addTrack(track, stream);
  });
  const offer = await peerConn.createOffer();
  await peerConn.setLocalDescription(offer);
  socket.emit("offer", { recipient: remoteSocketId, offer: offer });
};

const onOffer = async (
  offer: RTCSessionDescription,
  peerConn: RTCPeerConnection,
  remoteSocketId: string,
) => {
  console.log("offer received, proceeding");
  console.log("connection created, proceeding");
  console.log("offer: ");
  console.log(offer);
  peerConn.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConn.createAnswer();
  await peerConn.setLocalDescription(answer);
  console.log("answer ceated, proceeding");
  socket.emit("answer", { recipient: remoteSocketId, answer: answer });
};

const onAnswer = async (
  answer: RTCSessionDescription,
  peerConn: RTCPeerConnection,
) => {
  console.log("trying to add answer to desc: answer");
  console.log(answer);
  await peerConn.setRemoteDescription(new RTCSessionDescription(answer));
};

const onIceCandidate = async (
  candidate: RTCIceCandidate,
  peerConn: RTCPeerConnection,
) => {
  if (candidate) {
    try {
      console.log("incoming new ice candidate");
      await peerConn.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.log(
        "error while adding ice candidate: " + (error as Error).message,
      );
    }
  }
};

export { initPeerCall, onOffer, onAnswer, onIceCandidate };
