import { AudioModule } from "expo-audio";
import { Platform } from "react-native";

const manageMicrophonePermissions = async () => {
  if (Platform.OS === "web") {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        console.log("Microphone permission denied ❌");
      }
      return false;
    }
  } else {
    const permissionResponse = await AudioModule.getRecordingPermissionsAsync();
    if (permissionResponse.status !== "granted") {
      const { status: newStatus } =
        await AudioModule.requestRecordingPermissionsAsync();
      return newStatus === "granted";
    }

    return true;
  }
};

export { manageMicrophonePermissions };
