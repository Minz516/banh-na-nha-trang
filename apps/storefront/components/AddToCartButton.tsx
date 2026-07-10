'use client';

import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';

type Props = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  variant: 'icon' | 'full';
};

// Section 6.4 — icon-button corner on mobile, full-width button on hover-capable desktop.
export function AddToCartButton({ productId, name, price, image, variant }: Props) {
  const addItem = useCartStore((state) => state.addItem);
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({ productId, quantity: 1, price, name, image });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleAdd}
        aria-label={`Thêm ${name} vào giỏ hàng`}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white shadow-sm active:bg-primary-active active:scale-[0.98] transition-transform"
      >
        {justAdded ? <Check className="w-4 h-4" strokeWidth={2} /> : <Plus className="w-4 h-4" strokeWidth={2} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      aria-label={`Thêm ${name} vào giỏ hàng`}
      className="hidden md:flex w-full items-center justify-center gap-2 h-11 rounded-md bg-primary text-white shadow-sm hover:bg-primary-hover active:bg-primary-active active:scale-[0.98] transition-all md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100"
    >
      {justAdded ? <Check className="w-4 h-4" strokeWidth={2} /> : <Plus className="w-4 h-4" strokeWidth={2} />}
      <span className="text-[15px] font-semibold">{justAdded ? 'Đã thêm' : 'Thêm vào giỏ'}</span>
    </button>
  );
}
