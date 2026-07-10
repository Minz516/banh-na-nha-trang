import type { IVoucher } from './voucher.model.js';

export const VoucherDTO = {
  response(v: IVoucher) {
    return {
      id: v._id.toString(),
      code: v.code,
      type: v.type,
      value: v.value,
      minOrderValue: v.minOrderValue,
      maxDiscount: v.maxDiscount ?? null,
      usageLimit: v.usageLimit ?? null,
      usedCount: v.usedCount,
      perUserLimit: v.perUserLimit,
      validFrom: v.validFrom?.toISOString() ?? null,
      validUntil: v.validUntil?.toISOString() ?? null,
      isActive: v.isActive,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    };
  },
};
