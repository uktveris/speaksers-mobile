import { useEffect, useState } from "react";
import { getSocket } from "../server/socket";
import { Device } from "mediasoup-client";
import { AppData, Producer, ProducerOptions, RtpCapabilities, Transport } from "mediasoup-client/types";
import { mediaDevices, MediaStream, MediaStreamTrack, registerGlobals } from "react-native-webrtc";
import InCallManager from "react-native-incall-manager";

export function useMediasoup(peerId: string) {
  registerGlobals();
  const socket = getSocket("/calls");
  if (!socket.connected) socket.connect();
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [producer, setProducer] = useState<Producer<AppData> | undefined>(undefined);
  const [producerTransport, setProducerTransport] = useState<Transport<AppData> | null>(null);
  const [consumerTransport, setConsumerTransport] = useState<Transport<AppData> | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [device, setDevice] = useState<Device | null>(null);

  const initDevice = async (capabilities: RtpCapabilities) => {
    const device = new Device();
    await device.load({ routerRtpCapabilities: capabilities });
    console.log("device can produce audio?: ", device.canProduce("audio"));
    return device;
  };

  const getCapabilities = async (): Promise<RtpCapabilities> => {
    return new Promise((resolve, reject) => {
      socket.emit("get_router_capabilities", (capabilities: RtpCapabilities) => {
        if (!capabilities) {
          reject(new Error("No capabilities received"));
          return;
        }
        resolve(capabilities);
      });
    });
  };

  const createSendTransport = async (device: Device) => {
    console.log("creating send transport");
    const { params } = await new Promise<{ params: any }>((resolve, reject) => {
      socket.emit("create_transport", { sender: true }, (response: any) => {
        if (response.params.error) {
          console.log("no params received: ", response.params.error);
          reject(response.params.error);
        } else {
          console.log("resolving response:", { response });
          resolve(response);
        }
      });
    });
    console.log("received transport params: ", params);

    const producerTransport = device.createSendTransport(params);
    producerTransport.on("connect", async ({ dtlsParameters }, callback, errback) => {
      try {
        socket.emit("connect_transport", {
          transportId: producerTransport.id,
          dtlsParameters: dtlsParameters,
        });
        console.log("connecting send transport");
        callback();
      } catch (error) {
        errback(error as Error);
      }
    });

    producerTransport.on("produce", async (parameters, callback, errback) => {
      console.log("produce parameters: ", parameters);
      try {
        socket.emit(
          "transport_produce",
          {
            transportId: producerTransport.id,
            kind: parameters.kind,
            rtpParameters: parameters.rtpParameters,
          },
          ({ id }: { id: any }) => {
            console.log("client: transport_produce ack received, id:", id);
            callback(id);
          },
        );
      } catch (error) {
        errback(error as Error);
      }
    });
    return producerTransport;
  };

  const connectSendTransport = async (producerTransport: Transport<AppData>, stream: MediaStream) => {
    const opts: ProducerOptions = {
      codecOptions: { videoGoogleStartBitrate: 1000 },
      track: stream.getAudioTracks()[0] as unknown as globalThis.MediaStreamTrack,
    };
    console.log("connectSendTransport: options created: ", { opts });

    try {
      const producer = await producerTransport.produce(opts);
      console.log("connectSendTransport: producer created: ", { producer });
      producer.on("trackended", () => {
        console.log("track ended");
      });
      return producer;
    } catch (error) {
      console.log("error when creating producer: ", { error });
      return;
    }
  };

  const createRecvTransport = async (device: Device) => {
    const { params } = await new Promise<{ params: any }>((resolve, reject) => {
      socket.emit("create_transport", { sender: false }, (response: any) => {
        if (response.params.error) {
          console.log("no params received: ", response.params.error);
          reject(response.params.error);
        } else {
          console.log("params from recv transport: ", { response });
          resolve(response);
        }
      });
    });

    const consumerTransport = device.createRecvTransport(params);

    consumerTransport.on("connect", async ({ dtlsParameters }, callback, errback) => {
      try {
        socket.emit("connect_transport_recv", {
          transportId: consumerTransport.id,
          dtlsParameters: dtlsParameters,
        });
        console.log("connecting recv transport");
        callback();
      } catch (error) {
        errback(error as Error);
      }
    });
    return consumerTransport;
  };

  const connectRecvTransport = async (
    consumerTransport: Transport<AppData>,
    capabilities: RtpCapabilities,
    // producerId: string,
  ) => {
    const params = await new Promise<any>((resolve, reject) => {
      socket.emit(
        "transport_consume",
        {
          transportId: consumerTransport.id,
          rtpCapabilities: capabilities,
          // producerId: producerId,
        },
        (response: any) => {
          if (response.error) {
            console.log("transport_consume: error", response.error);
            reject(response.error);
          } else {
            console.log("consume params: ", response);
            resolve(response);
          }
        },
      );
    });

    console.log("transport_consume: received params", { params });

    const consumer = await consumerTransport.consume({
      id: params.id,
      producerId: params.producerId,
      kind: params.kind,
      rtpParameters: params.rtpParameters,
    });

    const { track } = consumer;
    console.log("consumer.track.kind:", track.kind, "readyState:", track.readyState);
    const remote = new MediaStream([track as MediaStreamTrack]);
    setRemoteStream(remote);
    socket.emit("consume_resume", { consumerId: consumer.id });
    console.log("remote ref set: ", remote);
  };

  const fetchProducerAndConsume = async () => {
    try {
      socket.emit("get_producers", async (producers: any[]) => {
        if (!producers || producers.length === 0) return;
        for (let p of producers) {
          let ct = consumerTransport;
          if (!ct) {
            ct = await createRecvTransport(device!);
            setConsumerTransport(ct);
          }
          await consumeProducer(ct, p.producerId, device!.rtpCapabilities);
        }
      });
    } catch (error) {
      console.log("error while fetching producers:", error);
    }
  };

  const consumeProducer = async (consumerTransport: Transport, producerId: string, capabilities: RtpCapabilities) => {
    const params = await new Promise<any>((resolve, reject) => {
      socket.emit(
        "transport_consume",
        {
          transportId: consumerTransport.id,
          producerId: producerId,
          rtpCapabilities: capabilities,
        },
        (response: any) => {
          if (response.error) {
            console.log("transport_consume error:", response.error);
            reject(response.error);
          } else {
            resolve(response);
          }
        },
      );
    });

    console.log("transport_consume: received params:", { params });
    const consumer = await consumerTransport.consume({
      id: params.id,
      producerId: params.producerId,
      kind: params.kind,
      rtpParameters: params.rtpParameters,
    });
    const { track } = consumer;
    const remote = new MediaStream([track as MediaStreamTrack]);
    setRemoteStream(remote);

    setTimeout(() => {
      setupSpeaker();
    }, 80);

    socket.emit("consume_resume", { consumerId: consumer.id });
  };

  const setupSpeaker = (attempts = 5, delay = 200) => {
    let i = 0;
    const tick = () => {
      try {
        InCallManager.setForceSpeakerphoneOn(true);
        InCallManager.setSpeakerphoneOn(true);
      } catch (error) {
        console.log("setupSpeaker: InCallManager call failed:", error);
      }
      i++;
      if (i < attempts) setTimeout(tick, delay);
    };
    tick();
  };

  const mute = () => {
    localStream?.getAudioTracks().forEach((t) => (t.enabled = false));
  };

  const unMute = () => {
    localStream?.getAudioTracks().forEach((t) => (t.enabled = true));
  };

  const hangUp = () => {
    console.log("hanging up...");
    socket.emit("end_call", { recipient: peerId, callId: callId });
    cleanUp();
  };

  const cleanUp = () => {
    console.log("mediasoup cleanup");
    InCallManager.stop();
    remoteStream?.getTracks().forEach((t) => t.stop());
    localStream?.getTracks().forEach((t) => t.stop());
    producer?.close();
    producerTransport?.close();
    consumerTransport?.close();

    setConsumerTransport(null);
    setProducerTransport(null);
    setRemoteStream(null);
    setLocalStream(null);
    setProducer(undefined);
    setDevice(null);
  };

  useEffect(() => {
    const setup = async () => {
      try {
        InCallManager.start({ media: "audio" });
        console.log("getting user media");
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setLocalStream(stream);
        console.log("stream: ", { stream });
        const capabilities = await getCapabilities();
        console.log("capabilities: ", { capabilities });
        const d = await initDevice(capabilities);
        setDevice(d);

        const pt = await createSendTransport(d);
        setProducerTransport(pt);
        console.log("producer transport created: ", pt.id);
        const producer = await connectSendTransport(pt, stream);
        setProducer(producer);

        const ct = await createRecvTransport(d);
        setConsumerTransport(ct);
        console.log("consumer transport created: ", ct.id);
        // await connectRecvTransport(ct, capabilities, produce);
        // await connectRecvTransport(ct, capabilities);
      } catch (error) {
        console.log("error occurred: ", (error as Error).message);
      }
    };

    setup();

    return () => {
      console.log("setup useeffect cleaning");
      cleanUp();
    };
  }, []);

  useEffect(() => {
    fetchProducerAndConsume();

    socket.on("end_call", () => cleanUp());
    socket.on("new_producer", async ({ producerId, peerProducerId, kind }) => {
      console.log("new_producer: event received, producer id:", producerId);
      let ct = consumerTransport;
      if (!ct) {
        ct = await createRecvTransport(device!);
        setConsumerTransport(ct);
      }
      await consumeProducer(ct, producerId, device!.rtpCapabilities);
    });

    return () => {
      socket.off("end_call");
      socket.off("new_producer");
    };
  }, [device, consumerTransport]);

  return { remoteStream, localStream, mute, unMute, hangUp, callId, setCallId };
}
