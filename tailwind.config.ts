import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          glow: "hsl(var(--secondary-glow))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-hero': 'var(--gradient-hero)',
      },
      boxShadow: {
        'primary': 'var(--shadow-primary)',
        'secondary': 'var(--shadow-secondary)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "glow-pulse": {
          "0%, 100%": { 
            opacity: "1",
            boxShadow: "0 0 20px var(--glow-color, currentColor), 0 0 40px var(--glow-color, currentColor)"
          },
          "50%": { 
            opacity: "0.8",
            boxShadow: "0 0 30px var(--glow-color, currentColor), 0 0 60px var(--glow-color, currentColor)"
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "shine": {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "slide-in-up": {
          "0%": { 
            opacity: "0",
            transform: "translateY(20px)"
          },
          "100%": { 
            opacity: "1",
            transform: "translateY(0)"
          },
        },
        "scale-in": {
          "0%": { 
            opacity: "0",
            transform: "scale(0.95)"
          },
          "100%": { 
            opacity: "1",
            transform: "scale(1)"
          },
        },
        "aurora": {
          "0%, 100%": { 
            opacity: "0.3",
            transform: "translateY(0) rotate(0deg) scale(1)" 
          },
          "33%": { 
            opacity: "0.5",
            transform: "translateY(-30px) rotate(60deg) scale(1.1)" 
          },
          "66%": { 
            opacity: "0.4",
            transform: "translateY(30px) rotate(-60deg) scale(0.9)" 
          },
        },
        "neon-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 5px currentColor, 0 0 20px currentColor, 0 0 40px currentColor",
            opacity: "1"
          },
          "50%": { 
            boxShadow: "0 0 10px currentColor, 0 0 30px currentColor, 0 0 60px currentColor",
            opacity: "0.8"
          },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-up": {
          "0%": { 
            opacity: "0",
            transform: "translateY(40px)"
          },
          "100%": { 
            opacity: "1",
            transform: "translateY(0)"
          },
        },
        "border-flow": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "breathe": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "50%": { transform: "scale(1.05)", opacity: "0.8" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "shine": "shine 3s linear infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
        "slide-in-up": "slide-in-up 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "aurora": "aurora 8s ease-in-out infinite",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
        "border-flow": "border-flow 3s ease infinite",
        "breathe": "breathe 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
