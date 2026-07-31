import { useEffect, useState } from 'react';
import { useCartStore } from '@/stores/cartStore';

// The cart persists to localStorage; on first client render it hasn't rehydrated
// yet, so cart-dependent pages must wait for this before trusting `items`.
export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(() => useCartStore.persist?.hasHydrated() ?? false);

  useEffect(() => {
    const unsubscribe = useCartStore.persist?.onFinishHydration(() => setHydrated(true));
    useCartStore.persist?.rehydrate();
    return unsubscribe;
  }, []);

  return hydrated;
}
