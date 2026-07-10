import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-6 py-16">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Đăng ký</h1>
          <p className="text-gray-500">Tạo tài khoản để nhận nhiều ưu đãi</p>
        </div>

        <form className="space-y-4 text-left w-full m-0">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-gray-900 focus:bg-white transition-colors text-gray-900" placeholder="user@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-gray-900 focus:bg-white transition-colors text-gray-900" placeholder="09xxxx..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
            <input type="password" required minLength={8} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-gray-900 focus:bg-white transition-colors text-gray-900" placeholder="Tối thiểu 8 ký tự" />
          </div>
          
          <div className="pt-2">
            <button type="submit" className="w-full bg-orange-500 text-white rounded-xl py-4 font-bold text-lg hover:bg-gray-900 transition-colors">
              Đăng ký tài khoản
            </button>
          </div>
        </form>

        <p className="text-center text-gray-600 mt-8">
          Đã có tài khoản? <Link href="/login" className="font-bold text-gray-900 hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
