import { VoucherService } from './voucher.service.js';
import type { IVoucher } from './voucher.model.js';

export const VoucherInterfaces = {
  async validateVoucher(code: string, orderTotal: number, phone?: string) {
    return VoucherService.validate(code, orderTotal, phone);
  },

  async consumeVoucher(code: string, phone: string): Promise<void> {
    return VoucherService.consume(code, phone);
  },

  async releaseVoucher(code: string, phone: string): Promise<void> {
    return VoucherService.release(code, phone);
  },
};
