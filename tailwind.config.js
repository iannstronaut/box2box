/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ---- Surfaces ----
        canvas: "var(--canvas)",
        "surface-soft": "var(--surface-soft)",
        "surface-card": "var(--surface-card)",
        "surface-elevated": "var(--surface-elevated)",
        "carbon-gray": "var(--surface-elevated)",
        hairline: "var(--hairline)",
        "hairline-strong": "var(--hairline-strong)",

        // ---- Text ----
        "on-dark": "var(--text-strong)",
        body: "var(--text-body)",
        "body-strong": "var(--text-strong)",
        muted: "var(--text-muted)",

        // ---- Brand accent (replaces the old tricolor) ----
        accent: "var(--accent)",
        "accent-strong": "var(--accent-strong)",
        "accent-soft": "var(--accent-soft)",
        violet: "var(--violet)",

        // ---- Backwards-compatible aliases used across the app ----
        "m-blue-light": "var(--accent)",
        "m-blue-dark": "var(--accent)",
        "m-red": "var(--rose)",
        "bmw-blue": "var(--accent)",
        "electric-blue": "var(--violet)",

        // ---- Semantic ----
        warning: "var(--warning)",
        success: "var(--success)",
        danger: "var(--rose)",
      },
      fontFamily: {
        display: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        "display-xl": ["56px", { lineHeight: "1.04", letterSpacing: "-0.025em" }],
        "display-lg": ["40px", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
        "display-md": ["30px", { lineHeight: "1.15", letterSpacing: "-0.018em" }],
        "display-sm": ["24px", { lineHeight: "1.2", letterSpacing: "-0.015em" }],
        "title-lg": ["20px", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "title-md": ["17px", { lineHeight: "1.4", letterSpacing: "-0.005em" }],
        "title-sm": ["15px", { lineHeight: "1.45" }],
        "label-uppercase": [
          "11px",
          { lineHeight: "1.3", letterSpacing: "0.09em" },
        ],
        "body-md": ["15px", { lineHeight: "1.6" }],
        "body-sm": ["13.5px", { lineHeight: "1.55" }],
        caption: ["12px", { lineHeight: "1.45", letterSpacing: "0.01em" }],
        button: ["13.5px", { lineHeight: "1.0", letterSpacing: "0.005em" }],
        "nav-link": ["14px", { lineHeight: "1.4" }],
      },
      fontWeight: {
        display: 650,
        body: 400,
        regular: 450,
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "40px",
        xxl: "64px",
        section: "88px",
      },
      borderRadius: {
        none: "0px",
        xs: "4px",
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "18px",
        "2xl": "24px",
        "3xl": "32px",
        full: "9999px",
      },
      boxShadow: {
        soft: "0 1px 2px var(--shadow-sm), 0 6px 20px -8px var(--shadow-md)",
        card: "0 1px 2px var(--shadow-sm), 0 12px 32px -14px var(--shadow-md)",
        pop: "0 8px 24px -6px var(--shadow-md), 0 24px 60px -24px var(--shadow-lg)",
        glow: "0 8px 30px -6px var(--accent-glow)",
      },
      backdropBlur: {
        glass: "20px",
        "glass-lg": "36px",
      },
      animation: {
        "fade-in": "fadeIn 200ms ease-out",
        "scale-in": "scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slideUp 260ms cubic-bezier(0.16, 1, 0.3, 1)",
        shimmer: "shimmer 8s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
    },
  },
  plugins: [],
};
