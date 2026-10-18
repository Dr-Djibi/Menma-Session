import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/landing/Navbar';
import AmbientSpotlight from '@/components/ui/AmbientSpotlight';
import MobileBottomNav from '@/components/ui/MobileBottomNav';

export const metadata: Metadata = {
  title: 'Menma Session Generator | WhatsApp Protocol',
  description: 'Générateur de Session WhatsApp pour le bot Menma-MD. Code de jumelage, scan QR et configuration .env.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0c',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark scroll-smooth">
      <body className="bg-mesh-pattern antialiased min-h-screen flex flex-col relative selection:bg-gold/30 selection:text-gold-light">
        <AmbientSpotlight />
        <Navbar />

        <main className="flex-1 pb-20 md:pb-8 relative z-10">
          {children}
        </main>

        <footer className="w-full border-t border-white/5 py-8 px-4 text-center text-xs text-neutral-400 relative z-10 mb-14 md:mb-0">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>
              © {new Date().getFullYear()} <strong className="text-neutral-300">Menma Session Protocol</strong>. Tous droits réservés.
            </p>
            <p>
              Créé avec passion par{' '}
              <a
                href="https://github.com/Dr-Djibi/Menma-MD"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-light hover:text-gold font-medium transition-colors"
              >
                DR DJIBI
              </a>
            </p>
          </div>
        </footer>

        <MobileBottomNav />
      </body>
    </html>
  );
}
