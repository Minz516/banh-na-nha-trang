import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Đăng nhập</h1>
          <p className="text-gray-500">Chào mừng bạn quay lại với Bánh Tráng Nhà Na</p>
        </div>

        <form className="space-y-5 text-left w-full m-0">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email hoặc Số điện thoại</label>
            <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-gray-900 focus:bg-white transition-colors text-gray-900" placeholder="user@example.com" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
              <a href="#" className="text-sm font-medium text-orange-500 hover:underline">Quên mật khẩu?</a>
            </div>
            <input type="password" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-gray-900 focus:bg-white transition-colors text-gray-900" placeholder="••••••••" />
          </div>
          
          <button type="submit" className="w-full bg-gray-900 text-white rounded-xl py-4 font-bold text-lg hover:bg-orange-500 transition-colors mt-4">
            Đăng nhập
          </button>
        </form>

        <p className="text-center text-gray-600 mt-8">
          Chưa có tài khoản? <Link href="/register" className="font-bold text-gray-900 hover:underline">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}
