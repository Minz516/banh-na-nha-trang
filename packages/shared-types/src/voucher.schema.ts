import { z } from 'zod';

// ── Voucher ───────────────────────────────────────────────────────────────────────
// D6: percentage + fixed types; usedByPhones (not usedByUsers); validFrom/validUntil optional

export const voucherTypeSchema = z.enum(['percentage', 'fixed']);
export type VoucherType = z.infer<typeof voucherTypeSchema>;

export const voucherSchema = z.object({
  id: z.string(),
  code: z.string(),
  type: voucherTypeSchema,
  value: z.number().positive(),
  minOrderValue: z.number().nonnegative(),
  maxDiscount: z.number().positive().nullable(),
  usageLimit: z.number().int().positive().nullable(),
  usedCount: z.number().int().nonnegative(),
  perUserLimit: z.number().int().positive(),
  validFrom: z.string().nullable(),
  validUntil: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Voucher = z.infer<typeof voucherSchema>;

// ── Create/Update Voucher ─────────────────────────────────────────────────────────

export const createVoucherBodySchema = z.object({
  code: z.string().min(3).toUpperCase(),
  type: voucherTypeSchema,
  value: z.number().positive('Giá trị giảm phải > 0'),
  minOrderValue: z.number().nonnegative().default(0),
  maxDiscount: z.number().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  perUserLimit: z.number().int().positive().default(1),
  validFrom: z.string().datetime().nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
  isActive: z.boolean().default(true),
});

export type CreateVoucherBody = z.infer<typeof createVoucherBodySchema>;

export const updateVoucherBodySchema = createVoucherBodySchema.partial();
export type UpdateVoucherBody = z.infer<typeof updateVoucherBodySchema>;

// ── Validate Voucher ──────────────────────────────────────────────────────────────

export const validateVoucherBodySchema = z.object({
  code: z.string().min(1),
  orderTotal: z.number().positive(),
  phone: z.string().optional(), // guest's phone for per-user limit check
});

export type ValidateVoucherBody = z.infer<typeof validateVoucherBodySchema>;

export const voucherValidationResultSchema = z.object({
  voucherId: z.string(),
  code: z.string(),
  type: voucherTypeSchema,
  value: z.number(),
  discountAmount: z.number(),
});

export type VoucherValidationResult = z.infer<typeof voucherValidationResultSchema>;
