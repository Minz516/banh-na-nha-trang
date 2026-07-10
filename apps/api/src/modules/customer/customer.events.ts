import { eventBus, AppEvents } from '../../utils/eventBus.js';
import { CustomerInterfaces } from './customer.interfaces.js';

export function registerCustomerEvents(): void {
  eventBus.on(AppEvents.ORDER_PLACED, async (payload: { customerId: string; total: number }) => {
    try {
      await CustomerInterfaces.incrementStats(payload.customerId, payload.total);
    } catch (err) {
      console.error('[customer.events] ORDER_PLACED handler error:', err);
    }
  });

  eventBus.on(AppEvents.ORDER_CANCELLED, async (payload: { customerId: string; total: number }) => {
    try {
      await CustomerInterfaces.decrementStats(payload.customerId, payload.total);
    } catch (err) {
      console.error('[customer.events] ORDER_CANCELLED handler error:', err);
    }
  });
}
