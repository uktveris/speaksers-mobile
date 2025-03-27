import io from "socket.io-client";
import Constants from "expo-constants";

// const url = process.env.BACKEND_URL!;
const url = Constants.expoConfig?.extra?.BACKEND_URL as string;
console.log("backend url from env: " + url);

const socket = io(url);

export default socket;
