import { Platform } from "react-native";
import Constants from "expo-constants";

const getBackendUrl = () => {
  if (Platform.OS === "web") {
    return "http://localhost:8081";
  } else {
    return Constants.expoConfig?.extra?.BACKEND_URL!;
  }
};

export { getBackendUrl };
