import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between max-w-7xl">
        <Link href="/" className="text-2xl font-black text-gray-900 tracking-tighter">
          Nhà Na<span className="text-orange-500">.</span>
        </Link>
        <nav className="hidden md:flex gap-8">
          <Link href="/products" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Sản phẩm</Link>
          <Link href="/blog" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Câu chuyện</Link>
          <Link href="/about" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Về chúng tôi</Link>
        </nav>
        <div className="flex items-center gap-6">
          <Link href="/account" className="text-gray-600 hover:text-orange-500 transition-colors">
            <User className="w-6 h-6" />
          </Link>
          <Link href="/cart" className="flex items-center justify-center bg-gray-900 hover:bg-orange-500 text-white w-10 h-10 rounded-full transition-colors relative">
            <ShoppingCart className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
