import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(214 32% 91%)',
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(222 47% 11%)',
        muted: {
          DEFAULT: 'hsl(210 40% 96%)',
          foreground: 'hsl(215 16% 47%)',
        },
        primary: {
          DEFAULT: 'hsl(221 83% 53%)',
          foreground: 'hsl(210 40% 98%)',
        },
      },
      boxShadow: {
        soft: '0 1px 2px hsl(222 47% 11% / 0.06), 0 1px 3px hsl(222 47% 11% / 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;
