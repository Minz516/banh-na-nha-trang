import { CatalogAPI } from '@/lib/api/server-public';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';

type ProductsSearchParams = { category?: string; search?: string };

function buildHref(base: ProductsSearchParams) {
  const qs = new URLSearchParams();
  if (base.category) qs.set('category', base.category);
  if (base.search) qs.set('search', base.search);
  const query = qs.toString();
  return `/products${query ? `?${query}` : ''}`;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<ProductsSearchParams> }) {
  const { category, search } = await searchParams;

  const [products, categories] = await Promise.all([
    CatalogAPI.getProducts({ category, search, limit: 60 }).catch(() => []),
    CatalogAPI.getCategories().catch(() => []),
  ]);

  return (
    <div className="py-16">
      <div className="container mx-auto px-6 max-w-7xl">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Tất cả sản phẩm</h1>
          <p className="text-lg text-gray-600">Khám phá các loại bánh tráng đặc sắc từ Nhà Na.</p>
        </header>

        <form action="/products" method="get" className="mb-12 flex flex-col sm:flex-row gap-3 max-w-xl">
          {category && <input type="hidden" name="category" value={category} />}
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Tìm sản phẩm..."
            className="flex-1 h-12 px-4 rounded-full border border-gray-200 outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="h-12 px-8 rounded-full bg-gray-900 text-white font-bold hover:bg-orange-500 transition-colors"
          >
            Tìm kiếm
          </button>
        </form>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">Danh Mục</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href={buildHref({ search })}
                  className={!category ? 'text-orange-500 font-medium' : 'text-gray-600 hover:text-gray-900 transition-colors'}
                >
                  Tất cả
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={buildHref({ category: cat.slug, search })}
                    className={category === cat.slug ? 'text-orange-500 font-medium' : 'text-gray-600 hover:text-gray-900 transition-colors'}
                  >
                    {cat.name}
                  </Link>
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
                <div className="col-span-3 text-center py-24 text-gray-500">
                  {search || category ? 'Không tìm thấy sản phẩm phù hợp.' : 'Chưa có sản phẩm nào.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
