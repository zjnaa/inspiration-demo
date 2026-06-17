/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: {
          900: "#1A1A1A",
          700: "#4D4D4D",
          500: "#8A8A8A",
        },
      },
      boxShadow: {
        glow: "0 8px 32px 0 rgba(59, 130, 246, 0.45)",
        soft: "0 4px 20px 0 rgba(0, 0, 0, 0.06)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang SC",
          "Microsoft YaHei",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(var(--tw-rotate, 0deg))" },
          "50%": { transform: "translateY(-6px) rotate(var(--tw-rotate, 0deg))" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        fadeUp: "fadeUp 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};
