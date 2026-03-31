import type { Config } from "tailwindcss";

/**
 * Référence palette — la config effective Tailwind v4 est dans `app/globals.css` (@theme).
 * Ce fichier sert à l’alignement avec `docs/ARCHITECTURE.md` et aux outils qui le lisent.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        deep: "hsl(220 40% 18%)",
        steel: "hsl(215 30% 35%)",
        surface: "hsl(210 20% 96%)",
        accent: "hsl(195 70% 45%)",
        success: "hsl(145 55% 40%)",
        warning: "hsl(38 90% 50%)",
        error: "hsl(0 70% 50%)",
        border: "hsl(215 20% 85%)",
        muted: "hsl(215 15% 60%)",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
