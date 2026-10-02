import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0e16',
        panel: '#111826',
        raised: '#182132',
        line: '#25324a',
        text: '#e6ebf3',
        muted: '#8a97ab',
        mint: '#5ee9b5',
        iris: '#a78bfa',
        gold: '#fbbf24',
        coral: '#fb7185',
        aqua: '#7dd3fc',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
