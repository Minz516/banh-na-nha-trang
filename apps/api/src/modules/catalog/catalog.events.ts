import { eventBus, AppEvents } from '../../utils/eventBus.js';
import { CatalogRepository } from './catalog.repository.js';
import { logger } from '../../config/logger.config.js';
import { Sentry } from '../../config/sentry.config.js';

export function registerCatalogEvents(): void {
  // Restock when an order is cancelled
  eventBus.on(AppEvents.ORDER_CANCELLED, async (payload: { items: Array<{ productId: string; quantity: number }> }) => {
    try {
      await Promise.all(
        payload.items.map((item) => CatalogRepository.incrementStock(item.productId, item.quantity))
      );
    } catch (err) {
      logger.error({ err }, '[catalog.events] ORDER_CANCELLED restock error');
      Sentry.captureException(err);
    }
  });

  // Log low stock
  eventBus.on(AppEvents.STOCK_LOW, (payload: { productId: string; stock: number }) => {
    logger.warn(payload, '[catalog] Low stock');
  });
}
