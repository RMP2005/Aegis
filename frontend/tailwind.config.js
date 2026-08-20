/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aegis: {
          bg: "#F3EFE6",
          dark: "#0A0A0B",
          "dark-surface": "#141416",
          "dark-card": "#1C1C1F",
          "dark-border": "#2A2A2E",
          text: "#111111",
          "text-secondary": "#666666",
          accent: "#C4993C",
          "accent-light": "#D4AA4C",
          critical: "#C94D4D",
          "critical-bg": "#2D1A1A",
          high: "#E08C3A",
          "high-bg": "#2D2015",
          medium: "#C4993C",
          "medium-bg": "#2D2715",
          low: "#5A9E6F",
          "low-bg": "#1A2D1E",
          success: "#5A9E6F",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scan-line": "scanLine 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scanLine: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(4px)" },
        },
      },
    },
  },
  plugins: [],
};
