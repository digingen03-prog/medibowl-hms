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
        background: "#F8FAFC",
        foreground: "#475569",
        heading: "#0F172A",
        card: "#FFFFFF",
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          light: "#EFF6FF",
        },
        secondary: {
          DEFAULT: "#64748B",
          light: "#F1F5F9",
        },
        border: "#E2E8F0",
        success: {
          DEFAULT: "#16A34A",
          light: "#DCFCE7",
        },
        warning: {
          DEFAULT: "#D97706",
          light: "#FEF3C7",
        },
        danger: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-plus-jakarta-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        "2xs": "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
        xs: "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px 0 rgba(15, 23, 42, 0.03)",
      },
    },
  },
  plugins: [],
};
export default config;
