import type { Metadata } from 'next';
import { Outfit, Bitter, Quicksand } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap'
});

const bitter = Bitter({
  variable: '--font-bitter',
  subsets: ['latin'],
  display: 'swap'
});

const quicksand = Quicksand({
  variable: '--font-quicksand',
  subsets: ['latin'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Obojima Utilities',
  description: 'Sistema de utilidades para Obojima - Forrageamento, Poções e Ingredientes',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg'
  }
};

import { ThemeProvider } from '@/components/ThemeProvider';

import { SettingsProvider } from '@/contexts/SettingsContext';

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${bitter.variable} ${quicksand.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SettingsProvider>{children}</SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
