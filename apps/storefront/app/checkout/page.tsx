"use client";

import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, total } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Không thể thanh toán</h1>
        <p className="text-gray-600 mb-8">Giỏ hàng của bạn đang trống.</p>
        <Link href="/cart" className="bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800">Quay lại giỏ hàng</Link>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Thanh toán</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">1. Thông tin giao hàng</h2>
              
              {!isAuthenticated && (
                <div className="mb-6 bg-blue-50 text-blue-800 p-4 rounded-lg flex items-center justify-between">
                  <p className="text-sm font-medium">Bạn đã có tài khoản?</p>
                  <Link href="/login?redirect=/checkout" className="text-sm font-bold underline">Đăng nhập ngay</Link>
                </div>
              )}

              <form className="space-y-4 text-left block w-full m-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" defaultValue={user?.name || ''} placeholder="Nhập họ và tên" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input type="tel" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" placeholder="09xxxx..." />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" defaultValue={user?.email || ''} placeholder="Để nhận thông báo đơn hàng" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ (Số nhà, đường...)</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" placeholder="Nhập địa chỉ giao hàng" />
                </div>
              </form>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">2. Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="payment" defaultChecked className="w-4 h-4 text-orange-500" />
                  <span className="ml-3 font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="payment" className="w-4 h-4 text-orange-500" />
                  <span className="ml-3 font-medium text-gray-900">Chuyển khoản / Quẹt thẻ POS</span>
                </label>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>
              <ul className="space-y-4 mb-6">
                {items.map((item) => (
                  <li key={item.productId} className="flex justify-between items-start text-sm">
                    <span className="text-gray-600 flex-1 pr-4">{item.quantity}x {item.name}</span>
                    <span className="font-medium text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500">Tạm tính</span>
                  <span className="font-medium text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Phí giao hàng</span>
                  <span className="font-medium text-gray-900">Miễn phí</span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 mb-8 flex justify-between items-end">
                <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                <span className="text-2xl font-black text-orange-500">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
              </div>
              <button className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-colors shadow-lg shadow-orange-500/30">
                ĐẶT HÀNG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
