export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Plus Jakarta Sans", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        navy: "#081C46",
        "navy-light": "#1a3a7a",
        gold: "#FFC005",
        "gold-deep": "#C8920A",
        "light-bg": "#F5F7FF",
        "card-border": "#E5E7EB",
      },
      boxShadow: {
        card: "0 8px 24px rgba(0, 0, 0, 0.08)",
        gold: "0 4px 20px rgba(255, 192, 5, 0.35)",
        navy: "0 4px 20px rgba(8, 28, 70, 0.25)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease forwards",
        fadeIn: "fadeIn 0.4s ease forwards",
        slideIn: "slideIn 0.3s ease forwards",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
}