import { eventBus, AppEvents } from '../../utils/eventBus.js';
import { CatalogRepository } from './catalog.repository.js';

export function registerCatalogEvents(): void {
  // Restock when an order is cancelled
  eventBus.on(AppEvents.ORDER_CANCELLED, async (payload: { items: Array<{ productId: string; quantity: number }> }) => {
    try {
      await Promise.all(
        payload.items.map((item) => CatalogRepository.incrementStock(item.productId, item.quantity))
      );
    } catch (err) {
      console.error('[catalog.events] ORDER_CANCELLED restock error:', err);
    }
  });

  // Log low stock
  eventBus.on(AppEvents.STOCK_LOW, (payload: { productId: string; stock: number }) => {
    console.warn(`[catalog] ⚠️  Low stock: productId=${payload.productId}, remaining=${payload.stock}`);
  });
}
