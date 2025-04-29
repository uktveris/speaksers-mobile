import { getLocalizationAsync } from "expo-localization";
import { NativeModules, Platform } from "react-native";
import * as Localization from "expo-localization";

function getDateWithLocale(date: Date) {
  const userLocale = Localization.getLocales()[1];
}

export { getDateWithLocale };
