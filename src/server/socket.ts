import io from "socket.io-client";
import { getBackendUrl } from "@/src/config/urlConfig";

const sockets = new Map<string, SocketIOClient.Socket>();

function getSocket(nsp: string = "") {
  if (!sockets.get(nsp)) {
    const url = nsp ? getBackendUrl() + nsp : getBackendUrl();
    const socket = io(url, {
      autoConnect: false,
      path: "/socket.io/",
      transports: ["websocket", "polling"],
    });
    sockets.set(nsp, socket);
  }
  return sockets.get(nsp)!;
}

export { getSocket };
