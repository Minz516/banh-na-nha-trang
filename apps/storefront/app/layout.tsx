import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={`${inter.className} min-h-screen flex flex-col bg-white text-gray-900 border-none m-0 p-0`}>
        <Header />
        <main className="flex-1 block overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
