import { Platform } from "react-native";
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

const peerConns = new Map<string, RTCPeerConnection>();
const createPeerConn = (
  remoteSocketId: string,
  onStreamUpdate: (stream: MediaStream) => void,
) => {
  const peerConn = new RTCPeerConnection({ iceServers: iceServers });
  console.log("creating new rtc peerconn");
  peerConn.onicecandidate = (event) => {
    console.log("onicecandidate triggered");
    if (event.candidate) {
      socket.emit("ice-candidate", {
        recipient: remoteSocketId,
        candidate: event.candidate,
      });
      console.log("emitted ice candidate to recipient");
    } else {
      console.log("ice candidate gathering complete");
    }
  };

  peerConn.ontrack = (event) => {
    if (Platform.OS === "web") {
      // navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      //   stream
      //     .getTracks()
      //     .forEach((track) => peerConn.addTrack(track, stream));
      // });
      console.log("ontrack triggered on web");
    } else {
      if (event.streams && event.streams[0]) {
        console.log("received remote audio stream");
        const remoteStream = event.streams[0] as unknown as MediaStream;
        onStreamUpdate(remoteStream);
      }
    }
  };
  peerConns.set(remoteSocketId, peerConn);
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
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    stream.getTracks().forEach((track) => peerConn.addTrack(track, stream));
  });
};

const createAnswer = async (
  remoteSocketId: string,
  offer: RTCSessionDescriptionInit,
  peerConn: RTCPeerConnection,
) => {
  await peerConn.setRemoteDescription(offer);
  const answer = await peerConn.createAnswer();
  await peerConn.setLocalDescription(answer);
  socket.emit("answer", { recipient: remoteSocketId, answer: answer });
  console.log("emitted answer to recipient");
};

const addAnswer = async (
  peerConn: RTCPeerConnection,
  answer: RTCSessionDescriptionInit,
) => {
  console.log("trying set answer desc, peerConn exists: " + !!peerConn);
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

// socket.on("offer", async (data) => {
//   console.log("offer received, proceeding");
//   const peerConn = createPeerConn(remoteSocketId as string, onStreamUpdate);
//   console.log("connection created, proceeding");
//   await createAnswer(data.from, data.offer, peerConn);
//   console.log("answer ceated, proceeding");
// });

// socket.on("answer", (data) => {
//   console.log("trying to add answer to desc");
//   addAnswer(peerConns.get(data.from)!, data.answer);
// });
// socket.on("ice-candidate", async (data) => {
//   console.log("ice candidate received");
//   await addCandidate(peerConns.get(data.from)!, data.candidate);
// });
export { initPeerCall, createPeerConn, createAnswer, addAnswer, addCandidate };
