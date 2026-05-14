import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/data/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17211f",
        muted: "#5d6b66",
        paper: "#fbfaf7",
        line: "#e5e1d8",
        moss: "#2f5f4f"
      }
    }
  },
  plugins: []
};

export default config;
