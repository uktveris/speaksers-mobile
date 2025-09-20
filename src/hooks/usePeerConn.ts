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
  const socket = getSocket("/calls");
  if (!socket.connected) socket.connect();
  const localStreamRef = useRef<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
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
      localStreamRef.current = await mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStreamRef.current.getTracks().forEach((track) => {
        conn.addTrack(track, localStreamRef.current!);
      });
      const offer = await conn.createOffer(sessionConstraints);
      await conn.setLocalDescription(new RTCSessionDescription(offer));
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
      localStreamRef.current = await mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStreamRef.current.getTracks().forEach((track) => {
        conn.addTrack(track, localStreamRef.current!);
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
    socket.on("end_call", () => cleanUp());

    if (initCall) {
      beginCall();
    }

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("end_call");
      cleanUp();
    };
  }, [remoteSocketId, initCall]);

  const toggleMute = () => {
    if (!localStreamRef.current) return;
    const newMuteState = !isMuted;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !newMuteState;
    });
    setIsMuted(newMuteState);
  };

  const endCall = () => {
    socket.emit("end_call", { recipient: remoteSocketId, callId: callId });
    resetCallState();
    setActiveCall(false);
    InCallManager.stop();
  };

  return {
    remoteStream,
    activeCall,
    endCall,
    setCallId,
    callId,
    toggleMute,
    isMuted,
  };
}

export { usePeerConn };
