import { eventBus, AppEvents } from '../../utils/eventBus.js';
import { CustomerInterfaces } from './customer.interfaces.js';
import { logger } from '../../config/logger.config.js';
import { Sentry } from '../../config/sentry.config.js';

export function registerCustomerEvents(): void {
  eventBus.on(AppEvents.ORDER_PLACED, async (payload: { customerId: string; total: number }) => {
    try {
      await CustomerInterfaces.incrementStats(payload.customerId, payload.total);
    } catch (err) {
      logger.error({ err }, '[customer.events] ORDER_PLACED handler error');
      Sentry.captureException(err);
    }
  });

  eventBus.on(AppEvents.ORDER_CANCELLED, async (payload: { customerId: string; total: number }) => {
    try {
      await CustomerInterfaces.decrementStats(payload.customerId, payload.total);
    } catch (err) {
      logger.error({ err }, '[customer.events] ORDER_CANCELLED handler error');
      Sentry.captureException(err);
    }
  });
}
