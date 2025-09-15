import { getSocket } from "@/src/server/socket";
import { useEffect, useRef, useState } from "react";
import InCallManager from "react-native-incall-manager";
import {
  mediaDevices,
  MediaStream,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from "react-native-webrtc";

const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "STUN:freestun.net:3478" },
];

const sessionConstraints = {
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: false,
    VoiceActivityDetection: true,
  },
};

function usePeerConn(remoteSocketId: string, initCall: boolean) {
  const socket = getSocket();
  if (!socket.connected) socket.connect();
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [activeCall, setActiveCall] = useState(false);
  const peerConnRef = useRef<RTCPeerConnection | null>(null);
  const offerHandled = useRef(false);
  const answerHandled = useRef(false);
  const [callId, setCallId] = useState<string | null>(null);

  const resetCallState = () => {
    offerHandled.current = false;
    answerHandled.current = false;
    if (peerConnRef.current) {
      peerConnRef.current.close();
      peerConnRef.current = null;
    }
    remoteStream?.getTracks().forEach((t) => t.stop());
    setRemoteStream(null);
    setActiveCall(false);
  };

  useEffect(() => {
    if (!remoteSocketId) return;

    resetCallState();

    const createPeerConn = () => {
      const conn = new RTCPeerConnection({ iceServers: iceServers });

      conn.addEventListener("icecandidate", (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            recipient: remoteSocketId,
            candidate: event.candidate,
          });
        }
      });

      conn.addEventListener("track", (event) => {
        const stream = event.streams[0] as unknown as MediaStream;
        setRemoteStream(stream);
        console.log("set remote stream: " + event.streams[0]);
      });

      conn.addEventListener("signalingstatechange", () => {
        console.log("signalign state change, current: " + conn.signalingState);
      });

      conn.addEventListener("connectionstatechange", (event) => {
        if (conn.connectionState === "connected") {
          console.log("connected successfully!");
        }
      });
      peerConnRef.current = conn;
      return conn;
    };

    const beginCall = async () => {
      InCallManager.start({ media: "audio" });
      setTimeout(() => {
        InCallManager.setForceSpeakerphoneOn(true);
        InCallManager.setSpeakerphoneOn(true);
      }, 500);

      const conn = createPeerConn();
      const localStream = await mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStream.getTracks().forEach((track) => {
        conn.addTrack(track, localStream);
      });
      const offer = await conn.createOffer(sessionConstraints);
      await conn.setLocalDescription(new RTCSessionDescription(offer));
      console.log("local description (offer) set: " + offer);
      socket.emit("offer", { recipient: remoteSocketId, offer: offer });
      setActiveCall(true);
    };

    const onOffer = async (offer: RTCSessionDescription) => {
      if (offerHandled.current) {
        return;
      }
      offerHandled.current = true;
      const conn = createPeerConn();
      await conn.setRemoteDescription(new RTCSessionDescription(offer));
      const localStream = await mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStream.getTracks().forEach((track) => {
        conn.addTrack(track, localStream);
      });
      const answer = await conn.createAnswer();
      await conn.setLocalDescription(answer);
      socket.emit("answer", { recipient: remoteSocketId, answer: answer });
      setActiveCall(true);

      InCallManager.start({ media: "audio" });
      setTimeout(() => {
        InCallManager.setForceSpeakerphoneOn(true);
        InCallManager.setSpeakerphoneOn(true);
      }, 500);
    };

    const onAnswer = async (answer: RTCSessionDescription) => {
      if (answerHandled.current) {
        return;
      }
      answerHandled.current = true;
      const conn = peerConnRef.current;
      if (!conn || conn.signalingState === "closed") {
        return;
      }
      await conn.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const onIceCandidate = async (candidate: RTCIceCandidate) => {
      const conn = peerConnRef.current;
      if (!conn || conn.signalingState === "closed") {
        return;
      }
      if (candidate) {
        try {
          await conn.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {}
      }
    };

    const cleanUp = () => {
      setActiveCall(false);
      offerHandled.current = false;
      answerHandled.current = false;
      peerConnRef.current?.close();
      peerConnRef.current = null;
      remoteStream?.getTracks().forEach((t) => t.stop());
      setRemoteStream(null);
      InCallManager.stop();
    };

    socket.on("offer", (data) => onOffer(data.offer));
    socket.on("answer", (data) => onAnswer(data.answer));
    socket.on("ice-candidate", (data) => onIceCandidate(data.candidate));
    socket.on("end-call", () => cleanUp());

    if (initCall) {
      beginCall();
    }

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("end-call");
      cleanUp();
    };
  }, [remoteSocketId, initCall]);

  const endCall = () => {
    socket.emit("end-call", { recipient: remoteSocketId, callId: callId });
    resetCallState();
    setActiveCall(false);
    InCallManager.stop();
  };

  return { remoteStream, activeCall, endCall, setCallId };
}

export { usePeerConn };
