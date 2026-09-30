import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
const inter=Inter({subsets:['latin'],variable:'--font-inter'}); const mono=JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});
export const metadata:Metadata={title:'ThinkFirst — Learn algorithms by reasoning',description:'An interactive algorithm learning workspace.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en" className={`${inter.variable} ${mono.variable}`}><body>{children}</body></html>}
