import socket from "./socket";
import { MediaStream } from "react-native-webrtc";

const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun.l.google.com:5349" },
  { urls: "stun:stun1.l.google.com:3478" },
  { urls: "stun:stun1.l.google.com:5349" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:5349" },
  { urls: "stun:stun3.l.google.com:3478" },
  { urls: "stun:stun3.l.google.com:5349" },
  { urls: "stun:stun4.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:5349" },
];

const createPeerConn = (
  remoteSocketId: string,
  onStreamUpdate: (stream: MediaStream) => void,
) => {
  const peerConn = new RTCPeerConnection({ iceServers: iceServers });
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

const initCall = async (
  remoteSocketId: string,
  onStreamUpdate: (stream: MediaStream) => void,
) => {
  const peerConn = createPeerConn(remoteSocketId, onStreamUpdate);
  const offer = await peerConn.createOffer();
  await peerConn.setLocalDescription(offer);
  socket.emit("offer", { recipient: remoteSocketId, offer: offer });
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
};

const addAnswer = async (
  peerConn: RTCPeerConnection,
  answer: RTCSessionDescriptionInit,
) => {
  if (!peerConn.remoteDescription) {
    peerConn.setRemoteDescription(answer);
  }
};

const addCandidate = async (
  peerConn: RTCPeerConnection,
  candidate: RTCIceCandidateInit,
) => {
  if (peerConn) {
    peerConn.addIceCandidate(candidate);
  }
};

// socket.on("offer", async (data) => {
//   const peerConn = createPeerConn(data.from);
//   createAnswer(data.remoteSocketId, data.offer);
//   socket.on("answer", async (data) => addAnswer(peerConn, data.answer));
//   socket.on("ice-candidate", async (data) =>
//     addCandidate(peerConn, data.candidate),
//   );
// });

export { initCall, createPeerConn, createAnswer, addAnswer, addCandidate };
