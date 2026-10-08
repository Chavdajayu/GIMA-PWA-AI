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
        background: "var(--background)",
        foreground: "var(--foreground)",
        gima: {
          navy: {
            DEFAULT: "#1e3a5f",
            dark: "#0f233a",
            light: "#2b4c77",
            subtle: "#e9edf3",
          },
          gold: {
            DEFAULT: "#c99a2c",
            light: "#dfb248",
            dark: "#a57c1d",
            muted: "#fcf8ee",
          },
          slate: {
            DEFAULT: "#334155",
            muted: "#64748b",
            light: "#94a3b8",
            border: "#e2e8f0",
          },
          clinical: {
            teal: "#0d9488",
            tealLight: "#ccfbf1",
            surface: "#f8fafc",
            card: "#ffffff",
          },
          cream: {
            DEFAULT: "#faf9f6",
            subtle: "#f4f3ee",
            card: "#ffffff",
          }
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        editorial: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
        'card': '0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 1px 4px -1px rgba(15, 23, 42, 0.03)',
        'elevated': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
};

export default config;
