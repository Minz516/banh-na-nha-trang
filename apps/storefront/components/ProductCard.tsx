import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@repo/shared-types';
import { AddToCartButton } from '@/components/AddToCartButton';

const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

// Section 6.4 — Product Cards: white surface, radius-md, shadow-sm at rest.
export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  const price = product.promoPrice ?? product.basePrice;
  const onSale = product.promoPrice != null && product.promoPrice < product.basePrice;

  return (
    <div className="group relative bg-card rounded-md shadow-sm hover:shadow-md hover:bg-card-hover transition-shadow">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] rounded-md overflow-hidden bg-background-alt">
          <Image
            src={image?.url || `https://picsum.photos/seed/${product.slug}/480/600`}
            alt={image?.alt || product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
          />
          {onSale && (
            <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-primary text-white text-xs font-semibold">
              -{Math.round(100 - (product.promoPrice! / product.basePrice) * 100)}%
            </span>
          )}
          <div className="absolute bottom-3 right-3">
            <AddToCartButton variant="icon" productId={product.id} name={product.name} price={price} image={image?.url} />
          </div>
        </div>
        <div className="p-4 pb-0">
          <h3 className="font-sans text-[18px] font-semibold text-text-primary leading-snug line-clamp-1">
            {product.name}
          </h3>
          {product.flavor && (
            <p className="text-sm text-text-secondary mt-1 line-clamp-1">{product.flavor}</p>
          )}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-text-primary">{currency.format(price)}</span>
            {onSale && (
              <span className="text-sm text-text-muted line-through">{currency.format(product.basePrice)}</span>
            )}
          </div>
        </div>
      </Link>
      <div className="p-4 pt-3">
        <AddToCartButton variant="full" productId={product.id} name={product.name} price={price} image={image?.url} />
      </div>
    </div>
  );
}
