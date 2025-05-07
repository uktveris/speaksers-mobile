/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "orange";
const tintColorDark = "#fff";
const primaryColor = "#ff6600";
const darkTint = "rgba(89, 89, 89, 0.2)";
const darkPrimaryTint = "rgba(255, 102, 0, 0.7)";

export const Colors = {
  base: {
    darkTint: darkTint,
    darkPrimaryTint: darkPrimaryTint,
  },
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    primary: primaryColor,
    border: "#11181C",
    textField: "rgba(156, 156, 156, 0.2)",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "blue",
    tabIconSelected: tintColorDark,
    primary: primaryColor,
    border: "#ECEDEE",
    textField: "rgba(156, 156, 156, 0.2)",
  },
};
