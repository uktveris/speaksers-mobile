import io from "socket.io-client";
import { getBackendUrl } from "@/config/urlConfig";

const url = getBackendUrl();
console.log("backend url from env: " + url);

const socket = io(url);

export default socket;
