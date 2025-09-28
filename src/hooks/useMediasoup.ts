import { useEffect, useRef, useState } from "react";
import { getSocket } from "../server/socket";
import { Device } from "mediasoup-client";
import {
  AppData,
  Producer,
  ProducerOptions,
  RtpCapabilities,
  Transport,
} from "mediasoup-client/types";
import {
  mediaDevices,
  MediaStream,
  MediaStreamTrack,
  registerGlobals,
} from "react-native-webrtc";
import InCallManager from "react-native-incall-manager";
import inCallManager from "react-native-incall-manager";

export function useMediasoup() {
  registerGlobals();
  const socket = getSocket("/calls");
  if (!socket.connected) socket.connect();
  // const remoteAudioRef = useRef<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const initDevice = async (capabilities: RtpCapabilities) => {
    console.log("initDevice");
    console.log("received: ", { capabilities });
    const device = new Device();
    await device.load({ routerRtpCapabilities: capabilities });
    console.log("device loaded with capabilities: ", device.rtpCapabilities);
    console.log("device can produce audio?: ", device.canProduce("audio"));
    return device;
  };

  const getCapabilities = async (): Promise<RtpCapabilities> => {
    return new Promise((resolve, reject) => {
      socket.emit(
        "get_router_capabilities",
        (capabilities: RtpCapabilities) => {
          if (!capabilities) {
            reject(new Error("No capabilities received"));
            return;
          }
          resolve(capabilities);
        },
      );
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
          console.log("params: ", { response });
          resolve(response);
        }
      });
    });
    console.log("received transport params: ", params);

    const producerTransport = device.createSendTransport(params);
    producerTransport.on(
      "connect",
      // async ({ dtlsParameters }, callback, errback) => {
      async ({ dtlsParameters }, callback, errback) => {
        try {
          socket.emit("connect_transport", {
            // TODO: perhaps send transport id for better transport management in the future server side
            // transportId: producerTransport.id,
            dtlsParameters: dtlsParameters,
          });
          callback();
        } catch (error) {
          errback(error);
        }
      },
    );

    producerTransport?.on("produce", async (parameters, callback, errback) => {
      console.log("produce parameters: ", parameters);
      try {
        socket.emit(
          "transport_produce",
          {
            // transportId: producerTransport.id,
            kind: parameters.kind,
            rtpParameters: parameters.rtpParameters,
            appData: parameters.appData,
          },
          ({ id }: { id: any }) => {
            console.log("client: transport_produce ack received, id:", id);
            callback(id);
          },
        );
      } catch (error) {
        errback(error);
      }
    });
    return producerTransport;
  };

  const connectSendTransport = async (
    producerTransport: Transport<AppData>,
    stream: MediaStream,
  ) => {
    const opts: ProducerOptions = {
      codecOptions: { videoGoogleStartBitrate: 1000 },
      track:
        stream.getAudioTracks()[0] as unknown as globalThis.MediaStreamTrack,
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

    consumerTransport.on(
      "connect",
      async ({ dtlsParameters }, callback, errback) => {
        try {
          socket.emit("connect_transport_recv", {
            // transportId: consumerTransport.id,
            dtlsParameters: dtlsParameters,
          });
          callback();
        } catch (error) {
          errback(error);
        }
      },
    );
    return consumerTransport;
  };

  const connectRecvTransport = async (
    consumerTransport: Transport<AppData>,
    capabilities: RtpCapabilities,
  ) => {
    console.log("connecting recv transport");
    const params = await new Promise<{ params: any }>((resolve, reject) => {
      socket.emit(
        "transport_consume",
        {
          rtpCapabilities: capabilities,
        },
        (response: any) => {
          if (response.error) {
            console.log("transport_consume: error", response.params.error);
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
    const remote = new MediaStream([track as MediaStreamTrack]);
    setRemoteStream(remote);
    socket.emit("consume_resume");
    console.log("remote audio ref set: ", remoteStream);
  };

  useEffect(() => {
    let producerTransport: Transport<AppData> | null = null;
    let consumerTransport: Transport<AppData> | null = null;
    let producer: Producer<AppData> | undefined = undefined;

    const setup = async () => {
      try {
        console.log("getting user media");
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        console.log("stream: ", { stream });
        console.log("getting capabilities:");
        const capabilities = await getCapabilities();
        console.log("capabilities: ", { capabilities });
        const device = await initDevice(capabilities);
        console.log("device initialized");

        producerTransport = await createSendTransport(device);
        console.log("producer transport created: ", producerTransport.id);
        producer = await connectSendTransport(producerTransport, stream);

        consumerTransport = await createRecvTransport(device);
        console.log("consumer transport created: ", consumerTransport.id);
        await connectRecvTransport(consumerTransport, capabilities);
      } catch (error) {
        console.log("error occurred: ", (error as Error).message);
      }
    };

    setup();

    return () => {
      console.log("mediasoup cleanup");

      remoteStream?.getTracks().forEach((t) => t.stop());
      producer?.close();
      producerTransport?.close();
      consumerTransport?.close();

      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    InCallManager.start({ media: "audio" });
    InCallManager.start({ media: "audio" });
    setTimeout(() => {
      InCallManager.setForceSpeakerphoneOn(true);
      InCallManager.setSpeakerphoneOn(true);
    }, 500);

    return () => {
      InCallManager.stop();
    };
  }, []);

  return { remoteStream };
}
