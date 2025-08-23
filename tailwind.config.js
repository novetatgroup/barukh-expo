/** @type {import('tailwindcss').Config} */
module.exports = {
content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#163330',
        secondary: '#CDFF00',
      }
    },
  },
  plugins: [],
}

