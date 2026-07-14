import { z } from 'zod';
import { customerSnapshotSchema } from './customer.schema.js';

// ── Order Status ──────────────────────────────────────────────────────────────────
// D3: one enum, two label sets (admin/customer). Labels live in the frontend.

export const orderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'shipping',
  'completed',
  'cancelled',
]);

export type OrderStatus = z.infer<typeof orderStatusSchema>;

// ── Order Item (with immutable product snapshot) ──────────────────────────────────

export const productSnapshotSchema = z.object({
  productId: z.string(),
  name: z.string(),
  slug: z.string(),
  image: z.string().optional().nullable(),
  flavor: z.string().optional().nullable(),
});

export type ProductSnapshot = z.infer<typeof productSnapshotSchema>;

export const orderItemSchema = z.object({
  productSnapshot: productSnapshotSchema,
  unitPrice: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  subtotal: z.number().nonnegative(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;

// ── Order ─────────────────────────────────────────────────────────────────────────

export const orderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  customerId: z.string(),
  channel: z.enum(['online', 'pos']),
  customerSnapshot: customerSnapshotSchema,
  items: z.array(orderItemSchema),
  subtotal: z.number().nonnegative(),
  discountAmount: z.number().nonnegative(),
  voucherCode: z.string().optional().nullable(),
  total: z.number().nonnegative(),
  status: orderStatusSchema,
  statusHistory: z.array(
    z.object({
      status: orderStatusSchema,
      changedAt: z.string(),
      changedBy: z.string().optional().nullable(),
    })
  ),
  confirmedAt: z.string().optional().nullable(),
  shippedAt: z.string().optional().nullable(),
  completedAt: z.string().optional().nullable(),
  cancelledAt: z.string().optional().nullable(),
  cancelReason: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  paymentMethod: z.enum(['cod', 'bank_transfer']),
  printCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Order = z.infer<typeof orderSchema>;

// ── Place Order Body ──────────────────────────────────────────────────────────────

export const placeOrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const placeOrderBodySchema = z.object({
  items: z.array(placeOrderItemSchema).min(1, 'Giỏ hàng không được trống'),
  paymentMethod: z.enum(['cod', 'bank_transfer']),
  customerInfo: z.object({
    fullName: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
    phone: z.string().min(9, 'Số điện thoại không hợp lệ'),
    address: z.string().min(5, 'Địa chỉ không hợp lệ'),
    email: z.string().email().optional(),
  }),
  voucherCode: z.string().optional(),
  note: z.string().optional(),
});

export type PlaceOrderBody = z.infer<typeof placeOrderBodySchema>;

// ── Order Lookup ──────────────────────────────────────────────────────────────────

export const orderLookupBodySchema = z.object({
  orderNumber: z.string().min(1),
  phone: z.string().min(9),
});

export type OrderLookupBody = z.infer<typeof orderLookupBodySchema>;

// ── Update Order Status (Admin) ───────────────────────────────────────────────────

export const updateOrderStatusBodySchema = z.object({
  status: orderStatusSchema,
  cancelReason: z.string().optional(),
});

export type UpdateOrderStatusBody = z.infer<typeof updateOrderStatusBodySchema>;

// ── POS Order (Admin) ─────────────────────────────────────────────────────────────

export const posOrderBodySchema = z.object({
  items: z.array(placeOrderItemSchema).min(1),
  paymentMethod: z.enum(['cod', 'bank_transfer']),
  customerInfo: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(9),
    address: z.string().optional(),
    email: z.string().email().optional(),
  }),
  voucherCode: z.string().optional(),
  note: z.string().optional(),
});

export type PosOrderBody = z.infer<typeof posOrderBodySchema>;

// ── Order Query (Admin) ───────────────────────────────────────────────────────────

export const orderQuerySchema = z.object({
  status: orderStatusSchema.optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  customerId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type OrderQuery = z.infer<typeof orderQuerySchema>;
