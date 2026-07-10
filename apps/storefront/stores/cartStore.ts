import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addItem: (item) => {
        const items = [...get().items];
        const existing = items.find((i) => i.productId === item.productId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          items.push(item);
        }
        const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        set({ items, total });
      },
      updateQuantity: (productId, quantity) => {
        const items = [...get().items];
        const existing = items.find((i) => i.productId === productId);
        if (existing) {
          existing.quantity = Math.max(1, quantity);
        }
        const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        set({ items, total });
      },
      removeItem: (productId) => {
        const items = get().items.filter((i) => i.productId !== productId);
        const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        set({ items, total });
      },
      clearCart: () => set({ items: [], total: 0 }),
    }),
    { name: 'cart-storage', skipHydration: true }
  )
);
