import type { Config } from "tailwindcss";

// ============================================================
// Belenay Mobilya - Tailwind CSS v4 Yapılandırması
// Kurumsal renkler: Turuncu (#e75f0d), Lacivert (#191833)
// ============================================================

const config: Config = {
  // ---- İçerik Tarama Yolları ----
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  // ---- Tema Ayarları ----
  theme: {
    extend: {
      // ---- Kurumsal Renk Paleti ----
      colors: {
        // Ana turuncu renk - Belenay kurumsal rengi
        primary: {
          DEFAULT: "#e75f0d",
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#e75f0d",
          600: "#c2410c",
          700: "#9a3412",
          800: "#7c2d12",
          900: "#431407",
          foreground: "#ffffff",
        },
        // Ana lacivert renk - Belenay kurumsal rengi
        secondary: {
          DEFAULT: "#191833",
          50: "#f0f0f9",
          100: "#e0e0f3",
          200: "#c2c2e7",
          300: "#9393ce",
          400: "#6464b0",
          500: "#191833",
          600: "#141430",
          700: "#0f0f26",
          800: "#0a0a1c",
          900: "#050512",
          foreground: "#ffffff",
        },
        // Aksan rengi
        accent: {
          DEFAULT: "#e75f0d",
          foreground: "#ffffff",
        },
      },

      // ---- Font Ailesi ----
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },

      // ---- Animasyonlar ----
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "fade-out": "fadeOut 0.3s ease-in-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-up": "slideInUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },

      // ---- Keyframe Tanımlamaları ----
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideInUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },

      // ---- Kenar Yarıçapları ----
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // ---- Container Boyutları ----
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
    },
  },

  // ---- Eklentiler ----
  plugins: [],
};

export default config;
