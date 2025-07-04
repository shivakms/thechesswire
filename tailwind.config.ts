import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#0C162D", // Deep navy blue
          accent: "#40E0D0",  // Neon turquoise
          soft: "#1C2A3D",    // Soft surface layer
        },
      },
      backgroundImage: {
        "grid-overlay": "url('/assets/bg/grid.svg')",
      },
    },
  },
  plugins: [],
};

export default config;