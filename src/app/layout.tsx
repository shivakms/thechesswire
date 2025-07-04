// File: /src/app/layout.tsx
import { Toaster } from 'react-hot-toast';
import { Orbitron, Space_Grotesk, Inter, Space_Mono } from 'next/font/google';

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${orbitron.variable} ${spaceGrotesk.variable} ${inter.variable} ${spaceMono.variable}`}>
      <body>
        {children}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            // Default options
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              borderRadius: '0.75rem',
              padding: '1rem',
              fontFamily: "'Space Grotesk', sans-serif",
              border: '1px solid rgba(64, 224, 208, 0.2)',
              boxShadow: '0 10px 30px -10px rgba(64, 224, 208, 0.3)',
            },
            // Custom styles per type
            success: {
              iconTheme: {
                primary: '#40E0D0',
                secondary: '#000',
              },
              style: {
                background: 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)',
                border: '1px solid rgba(64, 224, 208, 0.3)',
              },
            },
            error: {
              iconTheme: {
                primary: '#EC4899',
                secondary: '#fff',
              },
              style: {
                background: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
              },
            },
          }}
        />
      </body>
    </html>
  );
}