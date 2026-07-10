import { CustomerAPI, OrderAPI } from '@/lib/api/server-authenticated';
import Link from 'next/link';

export default async function AccountPage() {
  const me = await CustomerAPI.getMe().catch(() => null);
  const { orders } = await OrderAPI.getMyOrders().catch(() => ({ orders: [] }));

  if (!me) {
    return <div className="text-center py-20">Không thể tải thông tin.</div>;
  }

  const { customer, stats } = me;

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl">
        <header className="mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Tài khoản của tôi</h1>
          <p className="text-gray-600">Xin chào, <span className="font-bold text-gray-900">{customer.fullName || customer.userId}</span></p>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Thông tin cá nhân</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex flex-col"><span className="text-gray-500 text-xs uppercase tracking-wider mb-1">Họ tên</span> <span className="font-medium text-gray-900">{customer.fullName || 'Chưa cập nhật'}</span></li>
                <li className="flex flex-col"><span className="text-gray-500 text-xs uppercase tracking-wider mb-1">Số điện thoại</span> <span className="font-medium text-gray-900">{customer.phone}</span></li>
                <li className="flex flex-col"><span className="text-gray-500 text-xs uppercase tracking-wider mb-1">Hạng thành viên</span> 
                  <span className="inline-block mt-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold w-max">
                    {stats.rank.toUpperCase()}
                  </span>
                </li>
                <li className="flex flex-col mt-2 pt-4 border-t border-gray-50"><span className="text-gray-500 text-xs uppercase tracking-wider mb-1">Chi tiêu tích lũy</span> <span className="font-bold text-gray-900">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalSpent)}
                </span></li>
              </ul>
              <button className="mt-6 w-full py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Chỉnh sửa thông tin
              </button>
            </div>
            
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="w-full text-left text-red-500 font-medium p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                Đăng xuất
              </button>
            </form>
          </div>
          
          <div className="w-full md:w-2/3">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center justify-between">
                Lịch sử đơn hàng
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{orders.length} đơn</span>
              </h3>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào.</p>
                  <Link href="/products" className="text-orange-500 font-bold hover:underline">Khám phá sản phẩm</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.orderNumber} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-gray-900 mb-1">#{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')} • {new Date(order.createdAt).toLocaleTimeString('vi-VN')}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-600">{order.items.length} sản phẩm</span>
                        <span className="font-bold text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
