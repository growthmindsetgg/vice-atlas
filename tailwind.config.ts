import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vice City neon palette
        night: {
          950: "#0a0414",
          900: "#120726",
          800: "#1a0a36",
          700: "#241048",
          600: "#311660",
        },
        neon: {
          pink: "#ff2bd6",
          magenta: "#ff45a6",
          purple: "#8a2be2",
          teal: "#19f0d0",
          cyan: "#00e5ff",
          yellow: "#ffe156",
        },
      },
      fontFamily: {
        display: ["'Orbitron'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 12px rgba(255,43,214,0.55), 0 0 24px rgba(138,43,226,0.35)",
        "neon-teal": "0 0 12px rgba(25,240,208,0.55), 0 0 24px rgba(0,229,255,0.35)",
      },
      backgroundImage: {
        "vice-gradient":
          "radial-gradient(circle at 20% 10%, rgba(255,43,214,0.18), transparent 55%), radial-gradient(circle at 85% 90%, rgba(25,240,208,0.16), transparent 55%), linear-gradient(180deg, #0a0414 0%, #120726 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
