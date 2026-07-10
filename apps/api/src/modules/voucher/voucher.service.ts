import { AppError } from '../../middlewares/errorMiddleware.js';
import { VoucherRepository } from './voucher.repository.js';
import type { IVoucher } from './voucher.model.js';

function computeDiscount(voucher: IVoucher, orderTotal: number): number {
  let discount = 0;
  if (voucher.type === 'percentage') {
    discount = (orderTotal * voucher.value) / 100;
    if (voucher.maxDiscount) discount = Math.min(discount, voucher.maxDiscount);
  } else {
    discount = voucher.value;
  }
  return Math.min(discount, orderTotal);
}

export const VoucherService = {
  async validate(code: string, orderTotal: number, phone?: string): Promise<{ voucher: IVoucher; discountAmount: number }> {
    const voucher = await VoucherRepository.findByCode(code);
    if (!voucher || !voucher.isActive) throw new AppError(404, 'Mã giảm giá không hợp lệ hoặc đã hết hạn');

    const now = new Date();
    if (voucher.validFrom && voucher.validFrom > now) throw new AppError(400, 'Mã giảm giá chưa có hiệu lực');
    if (voucher.validUntil && voucher.validUntil < now) throw new AppError(400, 'Mã giảm giá đã hết hạn');
    if (orderTotal < voucher.minOrderValue) throw new AppError(400, `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')}đ để dùng mã này`);
    if (voucher.usageLimit != null && voucher.usedCount >= voucher.usageLimit) throw new AppError(400, 'Mã giảm giá đã hết lượt dùng');

    if (phone) {
      const entry = voucher.usedByPhones.find((e) => e.phone === phone);
      if (entry && entry.count >= voucher.perUserLimit) throw new AppError(400, 'Bạn đã dùng hết lượt cho mã này');
    }

    return { voucher, discountAmount: computeDiscount(voucher, orderTotal) };
  },

  async consume(code: string, phone: string): Promise<void> {
    await VoucherRepository.consumeByPhone(code, phone);
  },

  async release(code: string, phone: string): Promise<void> {
    await VoucherRepository.releaseByPhone(code, phone);
  },

  async list(page: number, limit: number) {
    return VoucherRepository.list(page, limit);
  },

  async create(data: Partial<IVoucher>) {
    return VoucherRepository.create(data);
  },

  async update(id: string, data: Partial<IVoucher>) {
    const v = await VoucherRepository.update(id, data);
    if (!v) throw new AppError(404, 'Không tìm thấy voucher');
    return v;
  },

  async delete(id: string) {
    const v = await VoucherRepository.findById(id);
    if (!v) throw new AppError(404, 'Không tìm thấy voucher');
    await VoucherRepository.delete(id);
  },
};
