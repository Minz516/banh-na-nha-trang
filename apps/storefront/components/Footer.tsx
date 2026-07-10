export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16 mt-auto">
      <div className="container mx-auto px-6 max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12 text-sm leading-relaxed">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-4">Bánh Tráng Nhà Na</h2>
          <p className="max-w-md">
            Lưu giữ và lan tỏa hương vị bản địa Nha Trang thông qua nghệ thuật chế biến bánh tráng thủ công.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-4 text-base">Liên kết</h3>
          <ul className="space-y-3">
            <li><a href="/products" className="hover:text-orange-400 transition">Sản phẩm</a></li>
            <li><a href="/blog" className="hover:text-orange-400 transition">Câu chuyện</a></li>
            <li><a href="/about" className="hover:text-orange-400 transition">Về chúng tôi</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-4 text-base">Hỗ trợ</h3>
          <ul className="space-y-3">
            <li><a href="/faq" className="hover:text-orange-400 transition">FAQ</a></li>
            <li><a href="/shipping" className="hover:text-orange-400 transition">Giao hàng</a></li>
            <li><a href="/returns" className="hover:text-orange-400 transition">Đổi trả</a></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-6 max-w-7xl mt-16 pt-8 border-t border-gray-800 text-center">
        <p>&copy; {new Date().getFullYear()} Bánh Tráng Nhà Na. Đặc sản Nha Trang.</p>
      </div>
    </footer>
  );
}
