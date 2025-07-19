import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TheChessWire.news - Where Chess Meets AI. Daily.',
  description: 'The most secure, intelligent, and visionary chess journalism platform. Experience chess through AI narration, cinematic storytelling, and emotional analysis.',
  keywords: 'chess, AI, journalism, analysis, training, voice, narration, security',
  authors: [{ name: 'TheChessWire Team' }],
  creator: 'TheChessWire.news',
  publisher: 'TheChessWire.news',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://thechesswire.news'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TheChessWire.news - Where Chess Meets AI. Daily.',
    description: 'Experience chess through AI narration, cinematic storytelling, and emotional analysis.',
    url: 'https://thechesswire.news',
    siteName: 'TheChessWire.news',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TheChessWire.news - AI-Powered Chess Journalism',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TheChessWire.news - Where Chess Meets AI. Daily.',
    description: 'Experience chess through AI narration, cinematic storytelling, and emotional analysis.',
    images: ['/og-image.jpg'],
    creator: '@thechesswire',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#1a1a2e" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1a1a2e',
                  color: '#fff',
                  border: '1px solid #a855f7',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 