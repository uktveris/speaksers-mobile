import axiosConfig from "../config/axiosConfig";
import { getBackendUrl } from "../config/urlConfig";

export async function sendLog(context: string, message: string) {
  try {
    const url = getBackendUrl();
    const response = await axiosConfig.post(url + "/api/logs", {
      context: context,
      message: message,
    });
    console.log("log posted:", response);
  } catch (error) {
    console.log("error while posting a log:", error);
  }
}
