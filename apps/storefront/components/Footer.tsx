import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-text-primary text-background/70 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-12 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">
        <div className="md:col-span-2">
          <h2 className="font-display text-2xl text-background mb-4">Bánh Tráng Nhà Na</h2>
          <p className="max-w-md text-sm leading-relaxed">
            Lưu giữ và lan tỏa hương vị bản địa Nha Trang thông qua nghệ thuật chế biến bánh tráng thủ công —
            làm mới mỗi ngày, không chất bảo quản.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-background mb-4 text-sm">Hỗ trợ</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/order-lookup" className="hover:text-accent transition-colors">Tra cứu đơn hàng</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-6 text-center text-xs text-background/50">
          &copy; {new Date().getFullYear()} Bánh Tráng Nhà Na. Đặc sản Nha Trang.
        </div>
      </div>
    </footer>
  );
}
