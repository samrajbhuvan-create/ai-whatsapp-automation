/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary Brand: WhatsApp-inspired green
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Sidebar deep green
        sidebar: {
          DEFAULT: '#052e16',
          hover:   '#064e26',
          active:  '#16a34a',
          border:  '#0a4023',
          text:    '#86efac',
          muted:   '#4ade8099',
        },
        // WhatsApp specific
        wa: {
          green:   '#25D366',
          dark:    '#075E54',
          light:   '#DCF8C6',
          bubble:  '#EFEAE2',
          chatbg:  '#E5DDD5',
          sent:    '#d9fdd3',
          tick:    '#53bdeb',
        },
        // AI Purple accent
        ai: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        // Compliance states
        quality: {
          green:  '#16a34a',
          yellow: '#d97706',
          red:    '#dc2626',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        skeleton: "var(--skeleton)",
        border: "var(--btn-border)",
        input: "var(--input)",
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'brand':  '0 4px 24px 0 rgba(22,163,74,0.15)',
        'card':   '0 1px 4px 0 rgba(0,0,0,0.06)',
        'card-md':'0 4px 16px 0 rgba(0,0,0,0.08)',
        input: [
          "0px 2px 3px -1px rgba(0, 0, 0, 0.1)",
          "0px 1px 0px 0px rgba(25, 28, 33, 0.02)",
          "0px 0px 0px 1px rgba(25, 28, 33, 0.08)",
        ].join(", "),
      },
      animation: {
        'pulse-green': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in':    'slideIn 0.2s ease-out',
        'fade-in':     'fadeIn 0.15s ease-out',
        ripple: "ripple 2s ease calc(var(--i, 0) * 0.2s) infinite",
        orbit: "orbit calc(var(--duration) * 1s) linear infinite",
      },
      keyframes: {
        slideIn: {
          '0%':   { transform: 'translateX(-8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        ripple: {
          "0%, 100%": { transform: "translate(-50%, -50%) scale(1)" },
          "50%": { transform: "translate(-50%, -50%) scale(0.9)" },
        },
        orbit: {
          "0%": {
            transform:
              "rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)",
          },
          "100%": {
            transform:
              "rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)",
          },
        },
      },
    },
  },
  plugins: [],
}
