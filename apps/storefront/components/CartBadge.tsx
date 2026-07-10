'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';

// Cart is persisted client-side only (SEO_CONTEXT.md 6.3) — the store rehydrates
// after mount so the server-rendered badge (always 0) never mismatches on hydration.
export function CartBadge() {
  const items = useCartStore((state) => state.items);
  // `.persist` is only attached when `window` exists at store-creation time — it is
  // undefined during Next.js's server-side render of this client component.
  const [hydrated, setHydrated] = useState(() => useCartStore.persist?.hasHydrated() ?? false);

  useEffect(() => {
    const unsubscribe = useCartStore.persist?.onFinishHydration(() => setHydrated(true));
    useCartStore.persist?.rehydrate();
    return unsubscribe;
  }, []);

  const count = hydrated ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <Link
      href="/cart"
      aria-label={`Giỏ hàng${count > 0 ? `, ${count} sản phẩm` : ''}`}
      className="relative flex items-center justify-center w-11 h-11 rounded-full bg-text-primary text-background hover:bg-primary transition-colors"
    >
      <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-primary text-white text-[11px] font-semibold leading-none">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
