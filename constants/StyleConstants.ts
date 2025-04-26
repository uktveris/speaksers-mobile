import { Appearance } from "react-native";
import { StyleSheet } from "react-native";
import { Colors } from "./Colors";
import { Dimensions } from "react-native";

const theme = Appearance.getColorScheme();

const dimensions = Dimensions.get("window");

const FontSizes = {
  small: 14,
  medium: 20,
  large: 40,
};

const GlobalStyles = StyleSheet.create({
  titleText: {
    color: theme === "light" ? Colors.light.text : Colors.dark.text,
    fontSize: FontSizes.large,
    fontWeight: "bold",
    textAlign: "center",
  },
  smallText: {
    color: theme === "light" ? Colors.light.text : Colors.dark.text,
    fontSize: FontSizes.small,
  },
  smallTextBold: {
    color: theme === "light" ? Colors.light.text : Colors.dark.text,
    fontSize: FontSizes.small,
    fontWeight: "bold",
  },
  mediumBoldText: {
    color: theme === "light" ? Colors.light.text : Colors.dark.text,
    fontSize: FontSizes.medium,
    fontWeight: "bold",
  },
  verticalSpacerLarge: {
    paddingVertical: 20,
  },
  verticalSpacerMedium: {
    paddingVertical: 10,
  },
  verticalSpacerSmall: {
    paddingVertical: 5,
  },
  container: {
    flex: 1,
    backgroundColor:
      theme === "light" ? Colors.light.background : Colors.dark.background,
  },
  primaryButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    padding: 10,
  },
  secondaryButton: {
    justifyContent: "center",
    alignItems: "center",
    borderColor: theme === "light" ? Colors.light.border : Colors.dark.border,
    borderWidth: 2,
    borderRadius: 20,
    padding: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export { FontSizes, GlobalStyles };
