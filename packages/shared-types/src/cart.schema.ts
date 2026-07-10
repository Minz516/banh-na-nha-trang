import { z } from 'zod';

// ── Guest Cart Item (localStorage) ────────────────────────────────────────────────
// D2: no variantId — just productId + quantity

export const guestCartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  // Denormalised for display — not trusted for pricing at checkout
  name: z.string().optional(),
  price: z.number().nonnegative().optional(),
  imageUrl: z.string().optional(),
  slug: z.string().optional(),
  stock: z.number().int().nonnegative().optional(),
});

export type GuestCartItem = z.infer<typeof guestCartItemSchema>;

// ── Server Cart Item (authenticated users) ────────────────────────────────────────

export const serverCartItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  quantity: z.number().int().positive(),
  addedAt: z.string(),
});

export type ServerCartItem = z.infer<typeof serverCartItemSchema>;

// ── Server Cart (full response) ───────────────────────────────────────────────────

export const serverCartSchema = z.object({
  items: z.array(serverCartItemSchema),
  totalItems: z.number().int(),
  totalAmount: z.number().nonnegative(),
});

export type ServerCart = z.infer<typeof serverCartSchema>;

// ── Add to Cart Body ──────────────────────────────────────────────────────────────

export const addToCartBodySchema = z.object({
  productId: z.string().min(1, 'productId là bắt buộc'),
  quantity: z.number().int().positive('Số lượng tối thiểu 1'),
});

export type AddToCartBody = z.infer<typeof addToCartBodySchema>;

// ── Update Cart Item Body ─────────────────────────────────────────────────────────

export const updateCartItemBodySchema = z.object({
  quantity: z.number().int().positive('Số lượng tối thiểu 1'),
});

export type UpdateCartItemBody = z.infer<typeof updateCartItemBodySchema>;
