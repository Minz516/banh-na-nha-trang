import { eventBus, AppEvents } from '../../utils/eventBus.js';
import { VoucherInterfaces } from './voucher.interfaces.js';

export function registerVoucherEvents(): void {
  eventBus.on(AppEvents.ORDER_CANCELLED, async (payload: { voucherCode?: string; phone: string }) => {
    if (!payload.voucherCode) return;
    try {
      await VoucherInterfaces.releaseVoucher(payload.voucherCode, payload.phone);
    } catch (err) {
      console.error('[voucher.events] ORDER_CANCELLED release error:', err);
    }
  });
}
