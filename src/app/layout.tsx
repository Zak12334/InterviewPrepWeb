import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { MotionSettings } from '@/components/MotionSettings';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'ThinkFirst',
  description: 'Learn algorithm problems by reasoning first, then watching your own code run.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <MotionSettings />
        {children}
      </body>
    </html>
  );
}
