'use client';

import { useState } from 'react';
import { useCartStore } from '@/stores/cartStore';

type Props = {
  productId: string;
  name: string;
  price: number;
  image?: string;
};

export function ProductDetailAddToCart({ productId, name, price, image }: Props) {
  const addItem = useCartStore((state) => state.addItem);
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    addItem({ productId, quantity: 1, price, name, image });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="flex-1 bg-gray-900 text-white h-14 rounded-full font-bold hover:bg-orange-500 transition-colors text-lg"
    >
      {justAdded ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
    </button>
  );
}
