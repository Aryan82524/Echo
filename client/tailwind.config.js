/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  darkMode: "class",

  theme: {
    extend: {
      colors: {
        // WhatsApp-inspired Echo teal palette
        primary: {
          50: "#e6f7f2",
          100: "#ccefe5",
          200: "#99dfcb",
          300: "#66cfb1",
          400: "#33bf97",
          500: "#00A884",
          600: "#008f70",
          700: "#075E54",
          800: "#054d45",
          900: "#033c36",
          950: "#022b27",
        },
        // WhatsApp chat colors
        wa: {
          // Light mode
          "outgoing": "#D9FDD3",
          "incoming": "#FFFFFF",
          "bg": "#EFEAE2",
          "sidebar": "#FFFFFF",
          "header": "#F0F2F5",
          // Dark mode
          "dark-outgoing": "#005C4B",
          "dark-incoming": "#202C33",
          "dark-bg": "#0B141A",
          "dark-sidebar": "#111B21",
          "dark-header": "#202C33",
          "dark-input": "#2A3942",
          "dark-border": "#2A3942",
          "dark-hover": "#2A3942",
          // Accent
          "green": "#00A884",
          "green-light": "#25D366",
          "blue-check": "#53BDEB",
          "time": "#667781",
        },
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },

      animation: {
        "bounce-dot": "bounceDot 1.4s infinite ease-in-out",
        "slide-up": "slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-left": "slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fadeIn 0.3s ease-out",
        "fade-in-up": "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "gradient-x": "gradientX 3s ease infinite",
        "shimmer": "shimmer 2s linear infinite",
        "wave": "wave 1.2s ease-in-out infinite",
        "ripple": "ripple 0.6s ease-out",
      },

      keyframes: {
        bounceDot: {
          "0%, 80%, 100%": { transform: "scale(0)", opacity: "0.3" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.5)" },
          "50%": { transform: "scaleY(1.5)" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.5" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
      },

      backgroundSize: {
        "300%": "300% 300%",
      },

      backdropBlur: {
        xs: "2px",
      },

      boxShadow: {
        "glow-sm": "0 0 15px -3px rgba(0, 168, 132, 0.3)",
        "glow": "0 0 30px -5px rgba(0, 168, 132, 0.4)",
        "glow-lg": "0 0 50px -10px rgba(0, 168, 132, 0.5)",
      },
    },
  },

  plugins: [],
};