/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // "./**/*.{js,jsx,ts,tsx}",
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#893a34",
        secondary: "#d69e49",
        button_text: "#11150d",

        background: {
          light: "#eadaa0",
          dark: "#2c3e50",
        },
        text: {
          light: "#11150d",
          dark: "#eadaa0",
        },
      },
    },
  },
  plugins: [],
};
