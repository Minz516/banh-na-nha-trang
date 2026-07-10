import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Truck, RotateCcw, HeartHandshake, Hand, Leaf } from 'lucide-react';
import { CatalogAPI } from '@/lib/api/server-public';
import { ProductCard } from '@/components/ProductCard';
import { JsonLd } from '@/lib/seo/json-ld';
import { generateSeoMetadata, siteMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateSeoMetadata(
  'Trang chủ',
  'Bánh tráng thủ công đậm vị Nha Trang — làm mới mỗi ngày, không chất bảo quản. Đặt hàng giao tận nơi trên toàn quốc.'
);

const TRUST_SIGNALS = [
  { icon: Sparkles, label: 'Làm mới mỗi ngày' },
  { icon: Truck, label: 'Giao hàng toàn quốc' },
  { icon: RotateCcw, label: 'Đổi trả nếu lỗi sản xuất' },
];

const VALUES = [
  {
    icon: Leaf,
    title: 'Thật',
    body: 'Nguyên liệu và quy trình đúng như những gì chúng tôi kể — không chỉnh sửa hình ảnh, không thổi phồng.',
  },
  {
    icon: Hand,
    title: 'Thủ công',
    body: 'Từng chiếc bánh tráng vẫn được tráng và phơi bằng tay, theo cách cả gia đình đã làm nhiều năm nay.',
  },
  {
    icon: HeartHandshake,
    title: 'Ấm áp',
    body: 'Chúng tôi muốn mỗi đơn hàng đến tay khách như một món quà từ nhà, không phải một giao dịch.',
  },
];

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    CatalogAPI.getFeaturedProducts().catch(() => []),
    CatalogAPI.getCategories().catch(() => []),
  ]);

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteMetadata.title,
    url: siteMetadata.siteUrl,
    description: siteMetadata.description,
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteMetadata.title,
    url: siteMetadata.siteUrl,
    areaServed: 'VN',
  };

  return (
    <div>
      <JsonLd schema={organizationSchema} />
      <JsonLd schema={localBusinessSchema} />

      {/* Hero — Section 16.1: lifestyle photo, one-sentence value prop, single primary CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://picsum.photos/seed/banh-trang-nha-na-hero/1600/1200"
            alt="Bánh tráng phơi nắng trên giàn tre tại Nha Trang"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-text-primary/80 via-text-primary/30 to-text-primary/10" />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 max-w-7xl min-h-[520px] md:min-h-[600px] flex flex-col justify-end pt-16 pb-12 md:pb-16">
          <h1 className="font-display text-4xl md:text-6xl leading-[1.15] text-background max-w-2xl">
            Bánh tráng thủ công, đậm đà vị Nha Trang
          </h1>
          <p className="mt-4 max-w-lg text-base md:text-lg text-background/90 leading-relaxed">
            Làm thủ công mỗi ngày từ gạo quê Nha Trang, giòn rụm, đậm vị, không chất bảo quản.
          </p>
          <div className="mt-8">
            <Link
              href="/products"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-primary text-white font-semibold text-[15px] shadow-sm hover:bg-primary-hover active:bg-primary-active active:scale-[0.98] transition-all"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        </div>
      </section>

      {/* Trust strip — immediately below the hero, above the fold on desktop */}
      <section className="border-b border-divider bg-background-alt">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {TRUST_SIGNALS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center justify-center sm:justify-start gap-3">
              <Icon className="w-5 h-5 text-secondary shrink-0" strokeWidth={1.5} />
              <span className="text-sm font-medium text-text-secondary">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured product grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex items-end justify-between mb-8 md:mb-12">
            <h2 className="font-display text-2xl md:text-4xl text-text-primary">Sản phẩm nổi bật</h2>
            <Link href="/products" className="hidden sm:inline text-sm font-medium text-primary hover:text-primary-hover">
              Xem tất cả
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6 rounded-lg bg-background-alt">
              <p className="text-text-secondary">
                Sản phẩm đang được chuẩn bị. Ghé lại sau hoặc xem toàn bộ danh mục nhé.
              </p>
              <Link
                href="/products"
                className="inline-block mt-4 text-sm font-semibold text-primary hover:text-primary-hover"
              >
                Xem danh mục sản phẩm
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Brand story moment — Section 11.5, 16.1 */}
      <section className="py-16 md:py-24 bg-background-alt">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="relative aspect-[4/5] md:aspect-[4/3] rounded-lg overflow-hidden">
            <Image
              src="https://picsum.photos/seed/banh-trang-nha-na-craft-hands/900/700"
              alt="Đôi tay tráng bánh tráng thủ công"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="max-w-md">
            <h2 className="font-display text-2xl md:text-3xl text-text-primary mb-4">
              Từ bếp nhà đến bàn ăn của bạn
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Nhà Na bắt đầu từ gian bếp nhỏ ở Nha Trang, nơi công thức tráng bánh được truyền qua nhiều thế hệ.
              Chúng tôi giữ nguyên cách làm thủ công ấy khi lớn dần, vì đó là thứ làm nên hương vị thật của bánh tráng quê.
            </p>
            <Link href="/about" className="inline-block mt-6 text-sm font-semibold text-primary hover:text-primary-hover">
              Đọc câu chuyện của chúng tôi
            </Link>
          </div>
        </div>
      </section>

      {/* Category navigation */}
      {categories.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <h2 className="font-display text-2xl md:text-4xl text-text-primary mb-8 md:mb-12">Danh mục</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.map((category) => (
                <Link key={category.id} href={`/collections/${category.slug}`} className="group block">
                  <div className="relative aspect-square rounded-md overflow-hidden bg-background-alt">
                    <Image
                      src={category.image || `https://picsum.photos/seed/${category.slug}/500/500`}
                      alt={category.name}
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-text-primary/20 group-hover:bg-text-primary/10 transition-colors" />
                  </div>
                  <p className="mt-3 text-center font-medium text-text-primary">{category.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why trust this shop — Principle #17, honest values instead of fabricated reviews */}
      <section className="py-16 md:py-24 bg-background-alt">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <h2 className="font-display text-2xl md:text-4xl text-text-primary mb-8 md:mb-12 text-center">
            Vì sao khách hàng chọn Nhà Na
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-card rounded-md shadow-sm p-6 md:p-8">
                <Icon className="w-8 h-8 text-primary mb-4" strokeWidth={1.5} />
                <h3 className="font-display text-xl text-text-primary mb-2">{title}</h3>
                <p className="text-text-secondary leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
