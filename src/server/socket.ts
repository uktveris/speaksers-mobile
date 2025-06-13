import io from "socket.io-client";
import { getBackendUrl } from "@/src/config/urlConfig";

let socket: SocketIOClient.Socket | null = null;

function getSocket() {
  if (!socket) {
    const url = getBackendUrl();
    socket = io(url, { autoConnect: false });
  }
  return socket;
}

export { getSocket };
