export type VoucherType = 'percentage' | 'fixed';

export type VoucherRow = {
  id: string;
  code: string;
  type: VoucherType;
  value: number;
  minOrderValue: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VoucherFormBody = {
  code: string;
  type: VoucherType;
  value: number;
  minOrderValue: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  perUserLimit: number;
  validFrom: string | null;
  validUntil: string | null;
  isActive?: boolean;
};

// Status is derived, not stored — a voucher is "expired" once validUntil is in
// the past, regardless of isActive (an admin-disabled voucher that hasn't
// reached its expiry date is still "available", just switched off separately).
export function voucherStatus(v: Pick<VoucherRow, 'validUntil'>): 'available' | 'expired' {
  if (v.validUntil && new Date(v.validUntil) < new Date()) return 'expired';
  return 'available';
}
