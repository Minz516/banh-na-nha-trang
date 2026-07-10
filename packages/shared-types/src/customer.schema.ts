import { z } from 'zod';

// ── Address ───────────────────────────────────────────────────────────────────────

export const addressLabelSchema = z.enum(['home', 'work', 'other']);

export const addressSchema = z.object({
  id: z.string().optional(),
  label: addressLabelSchema.default('home'),
  fullAddress: z.string().min(5, 'Địa chỉ không hợp lệ'),
  ward: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export type Address = z.infer<typeof addressSchema>;

export const addAddressBodySchema = addressSchema.omit({ id: true });
export type AddAddressBody = z.infer<typeof addAddressBodySchema>;

// ── Customer ──────────────────────────────────────────────────────────────────────

export const customerSchema = z.object({
  id: z.string(),
  phone: z.string(),
  fullName: z.string(),
  email: z.string().email().optional().nullable(),
  userId: z.string().optional().nullable(),
  addresses: z.array(addressSchema),
  dateOfBirth: z.string().optional().nullable(),
  totalOrders: z.number(),
  totalSpent: z.number(),
  notes: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Customer = z.infer<typeof customerSchema>;

// ── Update Customer ───────────────────────────────────────────────────────────────

export const updateCustomerBodySchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(9).optional(),
  dateOfBirth: z.string().optional(),
});

export type UpdateCustomerBody = z.infer<typeof updateCustomerBodySchema>;

// ── Customer Snapshot (embedded in Order) ────────────────────────────────────────

export const customerSnapshotSchema = z.object({
  fullName: z.string(),
  phone: z.string(),
  email: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export type CustomerSnapshot = z.infer<typeof customerSnapshotSchema>;
