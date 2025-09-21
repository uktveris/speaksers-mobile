import { useEffect, useState } from "react";
import { getSocket } from "../server/socket";
import { Device } from "mediasoup-client";

export function useMediasoup() {
  const socket = getSocket("/calls");
  if (!socket.connected) socket.connect();
  const [capabilities, setCapabilities] = useState<any>(null);
  const [device, setDevice] = useState<Device | null>(null);
  useEffect(() => {
    const setup = async () => {
      getCapabilities();
      createDevice();
    };

    setup();

    return () => {
      socket.off("router_capabilities");
    };
  }, []);

  const getCapabilities = async () => {
    socket.emit("get_router_capabilities");
    socket.on("router_capabilities", (data: any) => {
      setCapabilities(data.routerRtpCapabilities);
      console.log("router capabilities set");
    });
  };

  const createDevice = async () => {
    const device = new Device();
    setDevice(device);
    await device.load({ routerRtpCapabilities: capabilities });
  };

  // const createSendTransport = () => {
  //   socket.emit("create_transport", { isSender: true });
  //   socket.on("transport", (data) => {
  //     let transport = device?.createSendTransport()
  //   })
  // }
}
