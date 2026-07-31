import { eventBus, AppEvents } from '../../utils/eventBus.js';
import { VoucherInterfaces } from './voucher.interfaces.js';
import { logger } from '../../config/logger.config.js';
import { Sentry } from '../../config/sentry.config.js';

export function registerVoucherEvents(): void {
  eventBus.on(AppEvents.ORDER_CANCELLED, async (payload: { voucherCode?: string; phone: string }) => {
    if (!payload.voucherCode) return;
    try {
      await VoucherInterfaces.releaseVoucher(payload.voucherCode, payload.phone);
    } catch (err) {
      logger.error({ err }, '[voucher.events] ORDER_CANCELLED release error');
      Sentry.captureException(err);
    }
  });
}
