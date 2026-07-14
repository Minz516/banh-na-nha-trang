import { CatalogAPI } from '@/lib/api/server-public';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';

export default async function ProductsPage() {
  const products = await CatalogAPI.getProducts().catch(() => []);
  const categories = await CatalogAPI.getCategories().catch(() => []);

  return (
    <div className="py-16">
      <div className="container mx-auto px-6 max-w-7xl">
        <header className="mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Tất cả sản phẩm</h1>
          <p className="text-lg text-gray-600">Khám phá các loại bánh tráng đặc sắc từ Nhà Na.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">Danh Mục</h3>
            <ul className="space-y-4">
              <li><Link href="/products" className="text-orange-500 font-medium">Tất cả</Link></li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/products?category=${cat.slug}`} className="text-gray-600 hover:text-gray-900 transition-colors">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
              {products.length === 0 && (
                <div className="col-span-3 text-center py-24 text-gray-500">Chưa có sản phẩm nào.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
