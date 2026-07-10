import { CatalogAPI } from '@/lib/api/server-public';
import Link from 'next/link';

export default async function HomePage() {
  const featured = await CatalogAPI.getFeaturedProducts().catch(() => []);

  return (
    <div>
      <section className="bg-orange-50 py-24 text-center">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">Hương Vị Bản Địa <br /> <span className="text-orange-500">Nha Trang</span></h1>
          <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
            Hơn cả một món ăn vặt, Bánh Tráng Nhà Na là câu chuyện về làng nghề truyền thống và tình yêu với ẩm thực quê hương.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/products" className="bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-orange-500 transition-colors">Mua ngay</Link>
            <Link href="/about" className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors shadow">Tìm hiểu thêm</Link>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">Sản phẩm nổi bật</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.length > 0 ? (
              featured.map((product) => (
                <Link key={product.slug} href={`/products/${product.slug}`} className="group block">
                  <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden mb-6 relative">
                    <img src={product.images[0]?.url || 'https://picsum.photos/400/500'} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-orange-500 transition-colors">{product.name}</h3>
                  <p className="text-gray-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.promoPrice || product.basePrice)}</p>
                </Link>
              ))
            ) : (
              <p className="col-span-4 text-center text-gray-500 py-12">Đang tải sản phẩm...</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
