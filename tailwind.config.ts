import type { Config } from 'tailwindcss';
export default {content:['./src/**/*.{js,ts,jsx,tsx,mdx}'],theme:{extend:{colors:{ink:'#080c14',panel:'#101722',line:'#233044',mint:'#5ee9b5',purple:'#a78bfa',muted:'#8895a7'},fontFamily:{sans:['var(--font-inter)','sans-serif'],mono:['var(--font-mono)','monospace']}}},plugins:[]} satisfies Config;
