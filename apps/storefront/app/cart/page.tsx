"use client";

import { useCartStore } from '@/stores/cartStore';
import Link from 'next/link';

export default function CartPage() {
  const { items, total, removeItem, updateQuantity } = useCartStore();

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Giỏ hàng của bạn</h1>
        
        {items.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-8">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
            <Link href="/products" className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-500 transition-colors inline-block">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li key={item.productId} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                     <img src={item.image || 'https://picsum.photos/100/100'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-gray-500 font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-200">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 font-medium">-</button>
                      <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 font-medium">+</button>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-gray-500 block mb-1">Tổng cộng</span>
                <span className="text-3xl font-black text-gray-900">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                </span>
              </div>
              <div className="flex w-full md:w-auto gap-4">
                <Link href="/products" className="flex-1 md:flex-none text-center bg-white px-8 py-4 rounded-full font-bold border border-gray-200 hover:border-gray-900 transition-colors">Tiếp tục mua hàng</Link>
                <Link href="/checkout" className="flex-1 md:flex-none text-center bg-orange-500 text-white px-8 py-4 rounded-full font-bold hover:bg-gray-900 transition-colors shadow-lg shadow-orange-500/30">Thanh toán ngay</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
