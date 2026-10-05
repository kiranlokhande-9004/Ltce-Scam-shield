/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#365856",
          dark: "#2B4745",
          light: "#456966",
          soft: "#5C807C",
        },
        app: "#EAF4F3",
        surface: "#F4FAF9",
        ink: "#263A39",
        muted: "#7A8A89",
        gold: {
          DEFAULT: "#D8A928",
          soft: "#E8C65A",
        },
        safe: "#4F9D69",
        warn: "#D9A52B",
        danger: "#C95757",
        line: "#E3EDEC",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
        xl4: "2.25rem",
      },
      boxShadow: {
        soft: "0 10px 30px -16px rgba(38,58,57,0.20)",
        card: "0 24px 50px -30px rgba(38,58,57,0.40)",
        gold: "0 14px 30px -14px rgba(216,169,40,0.65)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease both",
      },
    },
  },
  plugins: [],
};