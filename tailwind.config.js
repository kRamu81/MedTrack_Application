/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "var(--bg-surface)",
        card: "var(--bg-card)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        subtle: "var(--border-subtle)",
        strong: "var(--border-strong)",
        hover: "var(--bg-hover)",
      },
      keyframes: {
        'scroll-up': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fadeSlideIn': {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        }
      },
      animation: {
        'scroll-up': 'scroll-up 60s linear infinite',
        'scroll-left': 'scroll-left 40s linear infinite',
        'fadeSlideIn': 'fadeSlideIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      }
    },
  },
  plugins: [],
};
