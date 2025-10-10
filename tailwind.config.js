/** @type {import('tailwindcss').Config} */
import { theme } from "./theme";
module.exports = {
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        button_text: theme.colors.button_text,

        contrast: {
          light: theme.colors.contrast.light,
          dark: theme.colors.contrast.dark,
        },
        background: {
          light: theme.colors.background.light,
          dark: theme.colors.background.dark,
        },
        text: {
          light: theme.colors.text.light,
          dark: theme.colors.text.dark,
          light_dimmed: theme.colors.text.light_dimmed,
          dark_dimmed: theme.colors.text.dark_dimmed,
        },
      },
    },
  },
  plugins: [],
};
