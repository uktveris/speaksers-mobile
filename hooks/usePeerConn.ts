import socket from "@/server/socket";
import { useEffect, useRef, useState } from "react";

const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "STUN:freestun.net:3478" },
];

function usePeerConn(remoteSocketId: string, initCall: boolean) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [activeCall, setActiveCall] = useState(false);
  const peerConnRef = useRef<RTCPeerConnection | null>(null);
  const offerHandled = useRef(false);
  const answerHandled = useRef(false);

  const resetCallState = () => {
    console.log("Resetting call state completely");
    offerHandled.current = false;
    answerHandled.current = false;
    if (peerConnRef.current) {
      console.log("Closing existing peer connection");
      peerConnRef.current.close();
      peerConnRef.current = null;
    }
    remoteStream?.getTracks().forEach((t) => t.stop());
    setRemoteStream(null);
    setActiveCall(false);
    // callIdRef.current = uuidv4();  // Generate new call ID for next potential call
  };

  useEffect(() => {
    console.log("usePeerConn MOUNTED");
    if (!remoteSocketId) return;

    resetCallState();

    const createPeerConn = () => {
      const conn = new RTCPeerConnection({ iceServers: iceServers });
      conn.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            recipient: remoteSocketId,
            candidate: event.candidate,
          });
        }
      };

      conn.ontrack = (event) => {
        const stream = event.streams[0] as unknown as MediaStream;
        setRemoteStream(stream);
        console.log("set remote stream: " + event.streams[0]);
      };

      conn.onsignalingstatechange = () => {
        console.log("signalign state change, current: " + conn.signalingState);
      };

      conn.onconnectionstatechange = () => {
        if (conn.connectionState === "connected") {
          console.log("connected successfully!");
        }
      };
      peerConnRef.current = conn;
      return conn;
    };

    const beginCall = async () => {
      const conn = createPeerConn();
      // TODO: change to use phone media devices (microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      // TODO: on production change to mobile speakers
      stream.getTracks().forEach((track) => {
        conn.addTrack(track, stream);
      });
      const offer = await conn.createOffer();
      await conn.setLocalDescription(new RTCSessionDescription(offer));
      console.log("local description (offer) set: " + offer);
      socket.emit("offer", { recipient: remoteSocketId, offer: offer });
      setActiveCall(true);
    };

    const onOffer = async (offer: RTCSessionDescription) => {
      if (offerHandled.current) {
        console.log("OFFER ALREADY HANDLED, RETURNING");
        return;
      }
      offerHandled.current = true;
      const conn = createPeerConn();
      await conn.setRemoteDescription(new RTCSessionDescription(offer));
      console.log("remote desc (offer) set");
      // TODO: change to use phone media devices (microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      // TODO: on production change to mobile speakers
      stream.getTracks().forEach((track) => {
        conn.addTrack(track, stream);
      });
      const answer = await conn.createAnswer();
      await conn.setLocalDescription(answer);
      console.log("local desc (answer) set");
      socket.emit("answer", { recipient: remoteSocketId, answer: answer });
      setActiveCall(true);
    };

    const onAnswer = async (answer: RTCSessionDescription) => {
      if (answerHandled.current) {
        console.log("ANSWER ALREADY HANDLED, RETURNING");
        return;
      }
      answerHandled.current = true;
      const conn = peerConnRef.current;
      if (!conn || conn.signalingState === "closed") {
        console.log("ON ANSWER: connection is closed, returning...");
        return;
      }
      await conn.setRemoteDescription(new RTCSessionDescription(answer));
      console.log("remote desc (answer) set");
    };

    const onIceCandidate = async (candidate: RTCIceCandidate) => {
      const conn = peerConnRef.current;
      if (!conn || conn.signalingState === "closed") {
        console.log("ON ICE-CANDIDATE: connection is closed, returning...");
        return;
      }
      if (candidate) {
        try {
          console.log("incoming new ice candidate");
          await conn.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.log(
            "error while adding ice candidate: " + (error as Error).message,
          );
        }
      }
    };

    const cleanUp = () => {
      setActiveCall(false);
      // offerHandled.current = false;
      // answerHandled.current = false;
      peerConnRef.current?.close();
      peerConnRef.current = null;
      remoteStream?.getTracks().forEach((t) => t.stop());
      setRemoteStream(null);
    };

    socket.off("offer");
    socket.off("answer");
    socket.off("ice-candidate");
    socket.off("end-call");

    socket.on("offer", (data) => onOffer(data.offer));
    socket.on("answer", (data) => onAnswer(data.answer));
    socket.on("ice-candidate", (data) => onIceCandidate(data.candidate));
    socket.on("end-call", () => cleanUp());

    if (initCall) {
      beginCall();
    }

    return () => {
      console.log("usePeerConn UNMOUNTED");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("end-call");
      cleanUp();
    };
  }, [remoteSocketId, initCall]);

  const endCall = () => {
    socket.emit("end-call", { recipient: remoteSocketId });
    resetCallState();
    setActiveCall(false);
  };

  return { remoteStream, activeCall, endCall };
}

export { usePeerConn };
