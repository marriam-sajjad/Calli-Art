import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f6f6f7",
          100: "#e1e3e7",
          200: "#c3c7d0",
          300: "#9ba3b2",
          400: "#717c91",
          500: "#545f75",
          600: "#414b5e",
          700: "#343d4d",
          800: "#222733",
          900: "#13161d",
          950: "#0b0d12",
        },
        parchment: {
          50: "#fdfbf7",
          100: "#f8f4ec",
          200: "#f0e7d5",
          300: "#e5d5b7",
          400: "#d6bc92",
          500: "#c7a36f",
        },
        gold: {
          50: "#fbf8ea",
          100: "#f5eecb",
          200: "#ecdc97",
          300: "#dfc45e",
          400: "#d3ab2e",
          500: "#b88e1a",
          600: "#9c6f14",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
