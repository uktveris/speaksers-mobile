import io from "socket.io-client";
import { getBackendUrl } from "@/config/urlConfig";

const url = getBackendUrl();

const socket = io(url);

export default socket;
