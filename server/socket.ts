import io from "socket.io-client";
import { getBackendUrl } from "@/config/urlConfig";

const url = getBackendUrl();

// const socket = io(url);
let socket: SocketIOClient.Socket | null = null;

function getSocket() {
  if (!socket) {
    const url = getBackendUrl();
    socket = io(url, { autoConnect: false });
  }
  return socket;
}

export { getSocket };
