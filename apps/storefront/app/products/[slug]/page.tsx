import { CatalogAPI } from '@/lib/api/server-public';
import { generateSeoMetadata } from '@/lib/seo/metadata';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await CatalogAPI.getProductBySlug(slug).catch(() => null);
  if (!product) return generateSeoMetadata('Sản phẩm không tồn tại');
  return generateSeoMetadata(product.name, product.description, product.images[0]?.url);
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await CatalogAPI.getProductBySlug(slug).catch(() => null);

  if (!product) {
    notFound();
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="w-full lg:w-1/2">
            <div className="aspect-[4/5] bg-gray-100 rounded-3xl overflow-hidden relative">
              <img src={product.images[0]?.url || 'https://picsum.photos/800/1000'} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="w-full lg:w-1/2 lg:py-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">{product.name}</h1>
            
            <div className="flex items-end gap-4 mb-8 pb-8 border-b border-gray-100">
              <span className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.promoPrice || product.basePrice)}
              </span>
              {product.promoPrice && (
                <span className="text-xl text-gray-400 line-through mb-1">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.basePrice)}
                </span>
              )}
            </div>

            <div className="prose prose-lg text-gray-600 mb-12">
              <p>{product.description}</p>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-gray-900 text-white h-14 rounded-full font-bold hover:bg-orange-500 transition-colors text-lg">
                Thêm vào giỏ hàng
              </button>
            </div>

            <div className="mt-12 bg-gray-50 rounded-2xl p-8">
              <h3 className="font-bold text-gray-900 mb-4">Thông tin thêm</h3>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li className="flex justify-between"><span className="text-gray-500">Hương vị</span> <span className="font-medium text-gray-900">{product.flavor || 'Cơ bản'}</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Giao hàng</span> <span className="font-medium text-gray-900">Toàn quốc (2-3 ngày)</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Tình trạng</span> <span className="font-medium text-gray-900">{product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
