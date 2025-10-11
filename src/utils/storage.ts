import AsyncStorage from "@react-native-async-storage/async-storage";

export async function setItem(key: string, value: string) {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.log("errorshile saving:", value, ":", error);
  }
}

export async function getItem(key: string) {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.log("error while retrieving:", key, ":", error);
    return null;
  }
}
