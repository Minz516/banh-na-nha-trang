import { CatalogAPI } from '@/lib/api/server-public';
import { generateSeoMetadata } from '@/lib/seo/metadata';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await CatalogAPI.getCategoryBySlug(slug).catch(() => null);
  if (!category) return generateSeoMetadata('Danh mục không tồn tại');
  return generateSeoMetadata(category.name, category.description ?? undefined, category.image ?? undefined);
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await CatalogAPI.getCategoryBySlug(slug).catch(() => null);

  if (!category) {
    notFound();
  }

  const products = await CatalogAPI.getProductsByCategorySlug(slug).catch(() => []);

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <header className="mb-12">
          <Link href="/products" className="text-sm font-medium text-primary hover:text-primary-hover">
            &larr; Tất cả sản phẩm
          </Link>
          <h1 className="font-display text-3xl md:text-5xl text-text-primary mt-4">{category.name}</h1>
          {category.description && (
            <p className="mt-4 text-lg text-text-secondary max-w-2xl">{category.description}</p>
          )}
        </header>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 rounded-lg bg-background-alt">
            <p className="text-text-secondary">Danh mục này chưa có sản phẩm nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
