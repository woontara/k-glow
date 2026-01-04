import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import SessionProvider from '@/components/providers/SessionProvider';

export const metadata: Metadata = {
  title: 'K-Glow - 한국 화장품 러시아 수출 플랫폼',
  description: '한국 중소 화장품 브랜드의 러시아/CIS 시장 진출을 지원하는 B2B 플랫폼',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased flex flex-col min-h-screen">
        <SessionProvider>
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
