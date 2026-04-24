import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "var(--base)",
        surface: "var(--surface)",
        card: "var(--card)",
        overlay: "var(--overlay)",
        accent: "var(--accent)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
        md: "var(--border-md)",
        lg: "var(--border-lg)",
      },
      textColor: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
      },
      fontFamily: {
        sans: ["Geist", "sans-serif"],
        display: ["Syne", "sans-serif"],
      },
      borderRadius: {
        sm: "5px",
        md: "8px",
        lg: "10px",
        xl: "14px",
        "2xl": "18px",
      },
      ringColor: {
        DEFAULT: "var(--accent)",
      },
    },
  },
  plugins: [animate],
};

export default config;
