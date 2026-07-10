import type { Metadata } from 'next';
import { Newsreader, Public_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

// Section 4.1 — Newsreader (display/heading) + Public Sans (body/UI). Both subsets
// include Vietnamese: diacritics must render cleanly at every weight (non-negotiable, 4.1).
const newsreader = Newsreader({
  subsets: ['latin', 'vietnamese'],
  weight: ['500', '600'],
  variable: '--font-newsreader',
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-public-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bánh Tráng Nhà Na',
  description: 'Đặc sản bánh tráng Nha Trang chính gốc, hương vị bản địa.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${newsreader.variable} ${publicSans.variable} min-h-screen flex flex-col bg-background text-text-primary m-0 p-0`}
      >
        <Header />
        <main className="flex-1 block overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
